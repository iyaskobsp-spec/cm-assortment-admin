import http from "node:http";
import { URL } from "node:url";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const MAX_BODY_SIZE = 10 * 1024;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const CACHE_TTL_MS = 15 * 60 * 1000;

const requestLog = new Map();
const monitoringCache = new Map();

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Vary", "Origin");
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  response.end(JSON.stringify(payload));
}

function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.socket.remoteAddress || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestLog.get(ip);

  if (!record || now - record.startedAt >= RATE_WINDOW_MS) {
    requestLog.set(ip, { startedAt: now, count: 1 });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfter: Math.ceil((RATE_WINDOW_MS - (now - record.startedAt)) / 1000)
    };
  }

  record.count += 1;
  return { allowed: true };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let bodySize = 0;

    request.setEncoding("utf8");

    request.on("data", chunk => {
      bodySize += Buffer.byteLength(chunk, "utf8");

      if (bodySize <= MAX_BODY_SIZE) {
        body += chunk;
      }
    });

    request.on("end", () => {
      if (bodySize > MAX_BODY_SIZE) {
        reject(new Error("REQUEST_TOO_LARGE"));
        return;
      }

      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });

    request.on("error", reject);
  });
}

function cleanText(value, maxLength = 240) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function decodeHtml(value) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&#39;": "'"
  };

  return String(value || "").replace(
    /&(amp|lt|gt|quot|#039|#39);/gi,
    entity => entities[entity.toLowerCase()] || entity
  );
}

function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value || "")
    .replace(/\s/g, "")
    .match(/\d+(?:[.,]\d+)?/);

  if (!match) {
    return null;
  }

  const price = Number(match[0].replace(",", "."));
  return Number.isFinite(price) ? price : null;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const items = [value];

  if (Array.isArray(value["@graph"])) {
    items.push(...value["@graph"]);
  }

  return items;
}

function isProduct(value) {
  const type = value?.["@type"];

  return type === "Product" ||
    (Array.isArray(type) && type.includes("Product"));
}

function availabilityLabel(value) {
  const availability = String(value || "").toLowerCase();

  if (availability.includes("instock")) {
    return "В наявності";
  }

  if (availability.includes("outofstock")) {
    return "Немає в наявності";
  }

  if (availability.includes("preorder")) {
    return "Передзамовлення";
  }

  return "Статус не вказано";
}

function extractPromOffers(html) {
  const products = [];
  const scriptPattern =
    /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(scriptPattern)) {
    try {
      const parsed = JSON.parse(match[2].trim());

      flattenJsonLd(parsed)
        .filter(isProduct)
        .forEach(product => products.push(product));
    } catch {
      // Пропускаємо службовий або некоректний JSON-LD.
    }
  }

  const offers = products
    .flatMap(product => {
      const productOffers = Array.isArray(product.offers)
        ? product.offers
        : product.offers
          ? [product.offers]
          : [];

      return productOffers.map(offer => {
        const price = parsePrice(offer.price ?? offer.lowPrice);

        if (!price || price <= 0) {
          return null;
        }

        return {
          source: "Prom",
          title: cleanText(decodeHtml(product.name), 260) || "Без назви",
          price: Math.round(price * 100) / 100,
          currency: cleanText(offer.priceCurrency, 10) || "UAH",
          link: safeUrl(offer.url || product.url),
          format: "Маркетплейс",
          comment: availabilityLabel(offer.availability)
        };
      });
    })
    .filter(Boolean)
    .sort((first, second) => first.price - second.price);

  const uniqueOffers = [];
  const seen = new Set();

  for (const offer of offers) {
    const key = offer.link || `${offer.title}|${offer.price}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueOffers.push(offer);
    }
  }

  return uniqueOffers.slice(0, 10);
}

async function monitorProm(productName, supplier) {
  const query = [supplier, productName]
    .filter(Boolean)
    .join(" ");

  const cacheKey = query.toLowerCase();
  const cached = monitoringCache.get(cacheKey);

  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return {
      ...cached.result,
      cached: true
    };
  }

  const promUrl = new URL("https://prom.ua/ua/search");
  promUrl.searchParams.set("search_term", query);

  const providerResponse = await fetch(promUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "uk-UA,uk;q=0.9"
    },
    signal: AbortSignal.timeout(20000)
  });

  if (!providerResponse.ok) {
    const error = new Error("PROM_REQUEST_FAILED");
    error.statusCode = 502;
    throw error;
  }

  const html = await providerResponse.text();
  const offers = extractPromOffers(html);
  const prices = offers.map(offer => offer.price);

  const result = {
    query,
    checkedAt: new Date().toISOString(),
    cached: false,
    provider: "Prom.ua",
    offers,
    market: {
      currency: "UAH",
      lowestPrice: prices.length ? prices[0] : null,
      averagePrice: prices.length
        ? Math.round(
          (prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100
        ) / 100
        : null,
      highestPrice: prices.length ? prices[prices.length - 1] : null
    }
  };

  monitoringCache.set(cacheKey, {
    savedAt: Date.now(),
    result
  });

  return result;
}

function calculateBusinessMetrics({
  purchasePrice,
  plannedRetailPrice,
  sources
}) {
  const round = value =>
    Number.isFinite(value)
      ? Math.round(value * 100) / 100
      : null;

  const purchase = parsePrice(purchasePrice);
  const plannedRetail = parsePrice(plannedRetailPrice);

  const matchedSources = (Array.isArray(sources) ? sources : [])
    .filter(source => source.status === "ok");

  const marketPrices = matchedSources
    .flatMap(source =>
      Array.isArray(source.offers) ? source.offers : []
    )
    .map(offer => Number(offer.price))
    .filter(price => Number.isFinite(price) && price > 0)
    .sort((first, second) => first - second);

  const middleIndex = Math.floor(marketPrices.length / 2);

  const marketMedian = marketPrices.length
    ? marketPrices.length % 2
      ? marketPrices[middleIndex]
      : (
        marketPrices[middleIndex - 1] +
        marketPrices[middleIndex]
      ) / 2
    : null;

  const marketAverage = marketPrices.length
    ? marketPrices.reduce((sum, price) => sum + price, 0) /
      marketPrices.length
    : null;

  const plannedMarginPercent =
    purchase && plannedRetail
      ? ((plannedRetail - purchase) / plannedRetail) * 100
      : null;

  const marginAtMarketMedianPercent =
    purchase && marketMedian
      ? ((marketMedian - purchase) / marketMedian) * 100
      : null;

  const plannedPriceVsMedianPercent =
    plannedRetail && marketMedian
      ? ((plannedRetail - marketMedian) / marketMedian) * 100
      : null;

  const maxPurchaseAtMarketMedian =
    marketMedian && plannedMarginPercent !== null
      ? marketMedian * (1 - plannedMarginPercent / 100)
      : null;

  const requiredPurchaseReduction =
    purchase &&
    maxPurchaseAtMarketMedian !== null &&
    purchase > maxPurchaseAtMarketMedian
      ? purchase - maxPurchaseAtMarketMedian
      : 0;

  return {
    matchedSourcesCount: matchedSources.length,
    marketOffersCount: marketPrices.length,
    marketLowestPrice:
      marketPrices.length ? round(marketPrices[0]) : null,
    marketAveragePrice: round(marketAverage),
    marketMedianPrice: round(marketMedian),
    marketHighestPrice:
      marketPrices.length
        ? round(marketPrices[marketPrices.length - 1])
        : null,
    purchasePrice: round(purchase),
    plannedRetailPrice: round(plannedRetail),
    plannedMarginPercent: round(plannedMarginPercent),
    marginAtMarketMedianPercent:
      round(marginAtMarketMedianPercent),
    plannedPriceVsMedianPercent:
      round(plannedPriceVsMedianPercent),
    maxPurchaseAtMarketMedian:
      round(maxPurchaseAtMarketMedian),
    requiredPurchaseReduction:
      round(requiredPurchaseReduction)
  };
}

async function generateAiBusinessReview({
  productName,
  supplier,
  segment,
  category,
  type,
  plannedRetailPrice,
  sources
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const round = value =>
    Number.isFinite(value)
      ? Math.round(value * 100) / 100
      : null;

  const plannedPrice = parsePrice(plannedRetailPrice);

  const relevantSources = (Array.isArray(sources) ? sources : [])
    .filter(source =>
      source?.status === "ok" &&
      Array.isArray(source.offers) &&
      source.offers.length
    );

  const marketOffers = relevantSources
    .flatMap(source =>
      source.offers.slice(0, 5).map(offer => ({
        source: cleanText(source.source, 80),
        title: cleanText(offer.title, 240),
        price: round(Number(offer.price))
      }))
    )
    .filter(offer =>
      offer.title &&
      Number.isFinite(offer.price) &&
      offer.price > 0
    );

  const marketPrices = marketOffers
    .map(offer => offer.price)
    .sort((first, second) => first - second);

  const lowestPrice =
    marketPrices.length ? marketPrices[0] : null;

  const highestPrice =
    marketPrices.length
      ? marketPrices[marketPrices.length - 1]
      : null;

  const averagePrice = marketPrices.length
    ? round(
      marketPrices.reduce((sum, price) => sum + price, 0) /
      marketPrices.length
    )
    : null;

  let plannedPricePosition = "недостатньо даних";

  if (
    Number.isFinite(plannedPrice) &&
    Number.isFinite(lowestPrice) &&
    Number.isFinite(highestPrice)
  ) {
    if (plannedPrice < lowestPrice) {
      plannedPricePosition =
        "нижче знайденого ринкового діапазону";
    } else if (plannedPrice > highestPrice) {
      plannedPricePosition =
        "вище знайденого ринкового діапазону";
    } else if (lowestPrice === highestPrice) {
      plannedPricePosition =
        "на рівні знайдених пропозицій";
    } else {
      const position =
        (plannedPrice - lowestPrice) /
        (highestPrice - lowestPrice);

      plannedPricePosition =
        position <= 0.33
          ? "у нижній частині знайденого діапазону"
          : position <= 0.67
            ? "у середній частині знайденого діапазону"
            : "у верхній частині знайденого діапазону";
    }
  }

  const marketEvidence = {
    matchedSourcesCount: relevantSources.length,
    offersCount: marketOffers.length,
    plannedRetailPrice: round(plannedPrice),
    lowestFoundPrice: lowestPrice,
    averageFoundPrice: averagePrice,
    highestFoundPrice: highestPrice,
    plannedPricePosition,
    offers: marketOffers
  };

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.45,
        max_completion_tokens: 360,
        messages: [
          {
            role: "system",
            content:
              "Ти аналітик асортиментного комітету роздрібної мережі. " +
              "Дай простий практичний огляд товару українською мовою у 3–4 природних реченнях суцільним текстом. " +
              "Оціни: чи представлений товар на ринку за кількістю знайдених релевантних пропозицій; " +
              "чи вписується планова роздрібна ціна у ціни справді схожих товарів; " +
              "наскільки надійне це порівняння; і чи варто товар розглядати, тестувати або спочатку уточнити дані. " +
              "Перед висновком обов’язково порівняй назви знайдених товарів. Якщо вони відрізняються за видом, " +
              "матеріалом, розміром, фасуванням або призначенням, прямо скажи, що цінове порівняння орієнтовне. " +
              "Широкий діапазон цін сам по собі не означає високу ринкову ціну — він може означати різні товари. " +
              "Актуальність оцінюй лише як ринкову представленість у знайдених пропозиціях, " +
              "а не як доведений попит, популярність або тренд. " +
              "Не аналізуй закупівельну ціну, маржу, націнку, граничну закупку чи переговори з постачальником. " +
              "Не вигадуй продажі, попит, якість, сезонність або характеристики, яких немає у вхідних даних. " +
              "Не використовуй назви технічних полів, службові інструкції чи англомовні терміни. " +
              "Не переказуй усі цифри: назви лише планову роздрібну ціну та доречний ринковий орієнтир. " +
              "Заверш короткою конкретною рекомендацією без канцеляризмів."
          },
          {
            role: "user",
            content: JSON.stringify({
              product: {
                name: productName,
                supplier: supplier || null,
                segment: segment || null,
                category: category || null,
                type: type || null
              },
              marketEvidence
            })
          }
        ]
      }),
      signal: AbortSignal.timeout(25000)
    }
  );

  if (!groqResponse.ok) {
    const errorBody = await groqResponse
      .text()
      .catch(() => "");

    throw new Error(
      `GROQ_REQUEST_FAILED: HTTP ${groqResponse.status} ${cleanText(errorBody, 300)}`
    );
  }

  const groqData = await groqResponse.json();

  const review = cleanText(
    groqData?.choices?.[0]?.message?.content,
    1800
  );

  if (!review) {
    throw new Error("GROQ_EMPTY_RESPONSE");
  }

  return {
    review,
    marketEvidence,
    model:
      cleanText(groqData.model, 100) ||
      "llama-3.3-70b-versatile"
  };
}

async function monitorProduct(requestBody) {
  const productName = cleanText(requestBody.productName);
  const supplier = cleanText(requestBody.supplier, 120);
  const segment = cleanText(requestBody.segment, 160);
  const category = cleanText(requestBody.category, 160);
  const type = cleanText(requestBody.type, 160);
  const purchasePrice = requestBody.purchasePrice;
  const plannedRetailPrice = requestBody.plannedRetailPrice;

  if (!productName) {
    const error = new Error("PRODUCT_NAME_REQUIRED");
    error.statusCode = 400;
    throw error;
  }

  const query = [supplier, productName]
    .filter(Boolean)
    .join(" ");

  function normalizeSearchText(value) {
    return cleanText(value, 500)
      .normalize("NFKC")
      .toLocaleLowerCase("uk-UA")
      .replace(/ґ/g, "г")
      .replace(/ё/g, "е")
      .replace(/[’'`"«»„“”]+/g, " ")
      .replace(/\b1\s*\/\s*2\b/g, "0.5")
      .replace(/(\d)\s*,\s*(\d)/g, "$1.$2")
      .replace(/(\d)\.(\d)/g, "$1\uE000$2")
      .replace(/[^\p{L}\p{N}\uE000]+/gu, " ")
      .replace(/\uE000/g, ".")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeSearchText(value) {
    return [
      ...new Set(
        normalizeSearchText(value)
          .split(" ")
          .filter(token =>
            token.length >= 2 ||
            /^\d$/.test(token)
          )
      )
    ];
  }

  const stopWords = new Set([
    "для", "та", "і", "й", "з", "із", "зі",
    "у", "в", "на", "по", "до", "від", "при",
    "або", "без", "під", "над", "через",
    "a", "the", "of", "and"
  ]);

  const unitInfo = {
    мл: ["volume", 1],
    ml: ["volume", 1],
    сл: ["volume", 10],
    cl: ["volume", 10],
    дл: ["volume", 100],
    л: ["volume", 1000],
    l: ["volume", 1000],
    liter: ["volume", 1000],
    litre: ["volume", 1000],

    мг: ["mass", 0.001],
    mg: ["mass", 0.001],
    г: ["mass", 1],
    гр: ["mass", 1],
    g: ["mass", 1],
    gr: ["mass", 1],
    грам: ["mass", 1],
    грами: ["mass", 1],
    грамів: ["mass", 1],
    кг: ["mass", 1000],
    kg: ["mass", 1000],

    шт: ["items", 1],
    "шт.": ["items", 1],
    штука: ["items", 1],
    штуки: ["items", 1],
    штук: ["items", 1],
    pcs: ["items", 1],

    предмет: ["items", 1],
    предмета: ["items", 1],
    предмети: ["items", 1],
    предметів: ["items", 1],
    предметов: ["items", 1],

    арк: ["sheets", 1],
    "арк.": ["sheets", 1],
    аркуш: ["sheets", 1],
    аркуша: ["sheets", 1],
    аркуші: ["sheets", 1],
    аркушів: ["sheets", 1],

    лист: ["sheets", 1],
    листа: ["sheets", 1],
    листи: ["sheets", 1],
    листів: ["sheets", 1],
    листов: ["sheets", 1],

    стор: ["sheets", 0.5],
    "стор.": ["sheets", 0.5],
    сторінка: ["sheets", 0.5],
    сторінки: ["sheets", 0.5],
    сторінок: ["sheets", 0.5],
    страниц: ["sheets", 0.5],

    табл: ["tablets", 1],
    таблетка: ["tablets", 1],
    таблетки: ["tablets", 1],
    таблеток: ["tablets", 1],

    капс: ["capsules", 1],
    капсула: ["capsules", 1],
    капсули: ["capsules", 1],
    капсул: ["capsules", 1],

    пак: ["packs", 1],
    уп: ["packs", 1],
    упаковка: ["packs", 1],
    упаковки: ["packs", 1],
    упаковок: ["packs", 1],
    пакет: ["packs", 1],
    пакети: ["packs", 1],
    пакетів: ["packs", 1]
  };

  const packageUnitsPattern = Object.keys(unitInfo)
    .sort((first, second) => second.length - first.length)
    .map(unit =>
      unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("|");

  const createPackagePattern = () =>
    new RegExp(
      `(\\d+(?:\\.\\d+)?)\\s*(${packageUnitsPattern})(?=$|\\s|\\.)`,
      "giu"
    );

  function getMeaningfulTokens(value) {
    return tokenizeSearchText(
      normalizeSearchText(value)
        .replace(createPackagePattern(), " ")
    ).filter(token =>
      !stopWords.has(token) &&
      !unitInfo[token]
    );
  }

  function getTokenRoot(token) {
    const normalizedToken = normalizeSearchText(token)
      .replace(/\.+$/g, "");

    if (
      !normalizedToken ||
      /^\d+(?:\.\d+)?$/.test(normalizedToken) ||
      !/^[а-яіїє]+$/u.test(normalizedToken)
    ) {
      return normalizedToken;
    }

    const suffixes = [
      "уваннями", "юваннями", "уванням", "юванням",
      "ованиями", "ениями", "аннями", "еннями",
      "ованого", "еваного", "ованими", "еваними",
      "ический", "ическая", "ическое", "ические",
      "ського", "цького", "ового", "евого",
      "ними", "ного", "ному",
      "ання", "ення", "ування", "ювання",
      "ами", "ями", "ові", "еві", "ому", "ему",
      "ого", "его", "ими", "ыми",
      "ість", "ость",
      "ий", "ій", "ая", "яя", "ое", "ее",
      "ої", "ей", "ом", "ем", "ам", "ям",
      "ах", "ях", "ів", "ев", "ов",
      "ати", "яти", "ити", "еть", "ить",
      "ка", "ки", "ку", "ке",
      "а", "я", "у", "ю", "и", "і", "ы"
    ].sort(
      (first, second) =>
        second.length - first.length
    );

    for (const suffix of suffixes) {
      if (
        normalizedToken.endsWith(suffix) &&
        normalizedToken.length - suffix.length >= 3
      ) {
        return normalizedToken.slice(
          0,
          -suffix.length
        );
      }
    }

    return normalizedToken;
  }

  function getEditDistance(firstValue, secondValue) {
    const previousRow = Array.from(
      { length: secondValue.length + 1 },
      (_, index) => index
    );

    for (
      let firstIndex = 1;
      firstIndex <= firstValue.length;
      firstIndex += 1
    ) {
      const currentRow = [firstIndex];

      for (
        let secondIndex = 1;
        secondIndex <= secondValue.length;
        secondIndex += 1
      ) {
        const substitutionCost =
          firstValue[firstIndex - 1] ===
          secondValue[secondIndex - 1]
            ? 0
            : 1;

        currentRow[secondIndex] = Math.min(
          currentRow[secondIndex - 1] + 1,
          previousRow[secondIndex] + 1,
          previousRow[secondIndex - 1] +
            substitutionCost
        );
      }

      previousRow.splice(
        0,
        previousRow.length,
        ...currentRow
      );
    }

    return previousRow[secondValue.length];
  }

  function tokensMatch(firstToken, secondToken) {
    const firstBase = getTokenRoot(firstToken);
    const secondBase = getTokenRoot(secondToken);

    if (!firstBase || !secondBase) {
      return false;
    }

    if (firstBase === secondBase) {
      return true;
    }

    if (
      /^\d+(?:\.\d+)?$/.test(firstBase) ||
      /^\d+(?:\.\d+)?$/.test(secondBase)
    ) {
      return false;
    }

    const shorterLength = Math.min(
      firstBase.length,
      secondBase.length
    );

    const lengthDifference = Math.abs(
      firstBase.length -
      secondBase.length
    );

    if (
      shorterLength >= 4 &&
      lengthDifference <= 2 &&
      (
        firstBase.startsWith(secondBase) ||
        secondBase.startsWith(firstBase)
      )
    ) {
      return true;
    }

    const editDistance = getEditDistance(
      firstBase,
      secondBase
    );

    if (shorterLength >= 8) {
      return editDistance <= 2;
    }

    return shorterLength >= 4 && editDistance <= 1;
  }

  function extractPackages(value) {
    const packages = [];

    for (
      const match of normalizeSearchText(value)
        .matchAll(createPackagePattern())
    ) {
      const normalizedUnit =
        match[2].toLocaleLowerCase("uk-UA");

      const unit = unitInfo[normalizedUnit];

      if (!unit) {
        continue;
      }

      const [kind, multiplier] = unit;
      const amount = Number(match[1]) * multiplier;

      if (Number.isFinite(amount) && amount > 0) {
        packages.push({
          kind,
          amount: Math.round(amount * 1000) / 1000
        });
      }
    }

    return packages.filter((item, index, items) =>
      items.findIndex(candidate =>
        candidate.kind === item.kind &&
        candidate.amount === item.amount
      ) === index
    );
  }

  const productTokensForMatching =
    getMeaningfulTokens(productName);

  const supplierTokensForMatching =
    getMeaningfulTokens(supplier);

  const classificationTokensForMatching =
    getMeaningfulTokens(`${category} ${type}`);

  const classificationProductTokens =
    productTokensForMatching.filter(productToken =>
      classificationTokensForMatching.some(
        classificationToken =>
          tokensMatch(productToken, classificationToken)
      )
    );

  const lexicalProductTokens =
    productTokensForMatching.filter(token =>
      /\p{L}/u.test(token)
    );

  const coreProductTokens =
    classificationProductTokens.length
      ? classificationProductTokens
      : lexicalProductTokens.slice(0, 1);

  const queryPackages = extractPackages(productName);

  function getMatchScore(title, matchedQuery = "") {
    const titleTokens = getMeaningfulTokens(title);
    const matchedQueryTokens =
      getMeaningfulTokens(matchedQuery);

    if (
      !titleTokens.length ||
      !productTokensForMatching.length
    ) {
      return 0;
    }

    const countMatchedTokens = tokens =>
      tokens.filter(queryToken =>
        titleTokens.some(titleToken =>
          tokensMatch(queryToken, titleToken)
        )
      ).length;

    const matchedCoreTokens =
      countMatchedTokens(coreProductTokens);

    const matchedSearchTokens =
      countMatchedTokens(matchedQueryTokens);

    if (
      coreProductTokens.length &&
      !matchedCoreTokens &&
      !matchedSearchTokens
    ) {
      return 0;
    }

    const matchedProductTokens =
      countMatchedTokens(productTokensForMatching);

    const productCoverage =
      matchedProductTokens /
      productTokensForMatching.length;

    const searchCoverage =
      matchedQueryTokens.length
        ? matchedSearchTokens /
          matchedQueryTokens.length
        : 0;

    const matchedSupplierTokens =
      countMatchedTokens(supplierTokensForMatching);

    const supplierCoverage =
      supplierTokensForMatching.length
        ? matchedSupplierTokens /
          supplierTokensForMatching.length
        : 1;

    const titlePackages = extractPackages(title);

    let hasExactPackage = !queryPackages.length;
    let packageMissing = false;
    let packageDifferent = false;

    if (queryPackages.length) {
      hasExactPackage = queryPackages.some(queryPackage =>
        titlePackages.some(titlePackage =>
          titlePackage.kind === queryPackage.kind &&
          Math.abs(
            titlePackage.amount - queryPackage.amount
          ) < 0.001
        )
      );

      for (const queryPackage of queryPackages) {
        const sameKindTitlePackages =
          titlePackages.filter(titlePackage =>
            titlePackage.kind === queryPackage.kind
          );

        const hasDifferentExplicitPackage =
          sameKindTitlePackages.length &&
          !sameKindTitlePackages.some(titlePackage =>
            Math.abs(
              titlePackage.amount - queryPackage.amount
            ) < 0.001
          );

        if (hasDifferentExplicitPackage) {
          packageDifferent = true;
        }
      }

      packageMissing =
        !hasExactPackage && !packageDifferent;
    }

    const isFullMatch =
      productCoverage === 1 &&
      supplierCoverage === 1 &&
      !packageMissing &&
      !packageDifferent;

    if (isFullMatch) {
      return 1;
    }

    const effectiveCoverage = Math.max(
      productCoverage,
      Math.min(searchCoverage, 0.92)
    );

    let score =
      0.18 +
      effectiveCoverage * 0.55;

    if (supplierTokensForMatching.length) {
      score += supplierCoverage * 0.12;
    }

    if (
      queryPackages.length &&
      hasExactPackage
    ) {
      score += 0.12;
    }

    if (packageDifferent) {
      score -= 0.12;
    }

    if (packageMissing) {
      score -= 0.04;
    }

    return Math.max(
      0,
      Math.min(
        Math.round(score * 1000) / 1000,
        0.99
      )
    );
  }

  function buildSearchQueries() {
    const supplierAlreadyInProductName =
      supplierTokensForMatching.length > 0 &&
      supplierTokensForMatching.every(supplierToken =>
        productTokensForMatching.some(productToken =>
          tokensMatch(supplierToken, productToken)
        )
      );

    const productWithoutPackage =
      normalizeSearchText(productName)
        .replace(createPackagePattern(), " ")
        .replace(/\s+/g, " ")
        .trim();

    const exactQuery = [
      supplierAlreadyInProductName ? "" : supplier,
      productName
    ]
      .filter(Boolean)
      .join(" ");

    const supplierProductWithoutPackage = [
      supplierAlreadyInProductName ? "" : supplier,
      productWithoutPackage
    ]
      .filter(Boolean)
      .join(" ");

    const queryCandidates = [
      exactQuery,
      productName,
      supplierProductWithoutPackage,
      productWithoutPackage
    ];

    const uniqueQueries = [];
    const seenQueries = new Set();

    queryCandidates.forEach(candidate => {
      const cleanedCandidate = normalizeSearchText(
        cleanText(candidate, 500)
      );

      if (
        cleanedCandidate.length < 2 ||
        seenQueries.has(cleanedCandidate)
      ) {
        return;
      }

      seenQueries.add(cleanedCandidate);
      uniqueQueries.push(cleanedCandidate);
    });

    return uniqueQueries;
  }

  const searchQueries = buildSearchQueries();

  async function runSearchCascade(loadOffers) {
    const offersByKey = new Map();
    const attemptedQueries = [];

    let successfulRequests = 0;
    let firstError = null;

    for (const searchQuery of searchQueries) {
      attemptedQueries.push(searchQuery);

      try {
        const loadedOffers =
          await loadOffers(searchQuery);

        successfulRequests += 1;

        const offers = Array.isArray(loadedOffers)
          ? loadedOffers
          : [];

        offers.forEach(offer => {
          if (!offer?.title) {
            return;
          }

          const offerKey =
            offer.link ||
            [
              normalizeSearchText(offer.title),
              Number(offer.price) || 0
            ].join("|");

          if (!offersByKey.has(offerKey)) {
            offersByKey.set(offerKey, {
              ...offer,
              matchedQuery: searchQuery
            });
          }
        });
      } catch (error) {
        firstError ||= error;
      }
    }

    if (!successfulRequests && firstError) {
      throw firstError;
    }

    return {
      offers: [...offersByKey.values()],
      attemptedQueries
    };
  }

  function calculateMarket(offers) {
    const prices = offers
      .map(offer => Number(offer.price))
      .filter(price => Number.isFinite(price) && price > 0)
      .sort((first, second) => first - second);

    return {
      currency: "UAH",
      lowestPrice: prices.length ? prices[0] : null,
      averagePrice: prices.length
        ? Math.round(
          (prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100
        ) / 100
        : null,
      highestPrice: prices.length ? prices[prices.length - 1] : null
    };
  }

  function buildSourceSummary(source, sourceQuery, offers, extra = {}) {
    const scoredOffers = offers
      .map(offer => ({
        ...offer,
        matchScore: getMatchScore(
          offer.title,
          offer.matchedQuery
        )
      }))
      .filter(offer => offer.matchScore >= 0.35)
      .sort((first, second) =>
        second.matchScore - first.matchScore ||
        first.price - second.price
      );

    const bestOffer = scoredOffers[0] || null;

    return {
      source,
      status: scoredOffers.length
        ? "ok"
        : "no_matches",
      matchType: bestOffer
        ? bestOffer.matchScore === 1
          ? "full"
          : "partial"
        : "none",
      productTitle: bestOffer?.title || null,
      link:
        bestOffer?.link ||
        extra.searchLink ||
        null,
      offersCount: scoredOffers.length,
      market: calculateMarket(scoredOffers),
      offers: scoredOffers.slice(0, 20),
      ...extra
    };
  }

  function buildErrorSource(source, message) {
    return {
      source,
      status: "error",
      matchType: "none",
      productTitle: null,
      link: null,
      offersCount: 0,
      market: calculateMarket([]),
      offers: [],
      message
    };
  }

  function filterSourcesByMeaning(sourceList) {
    const identityProductTokens =
      productTokensForMatching.filter(productToken =>
        /\p{L}/u.test(productToken) &&
        !supplierTokensForMatching.some(supplierToken =>
          tokensMatch(productToken, supplierToken)
        )
      );

    const productIdentityTokens =
      identityProductTokens.length
        ? identityProductTokens
        : productTokensForMatching;

    const typeIdentityTokens =
      getMeaningfulTokens(type);

    const normalizedProductPhrase =
      normalizeSearchText(productName)
        .replace(createPackagePattern(), " ")
        .replace(/\s+/g, " ")
        .trim();

    function evaluateOffer(offer) {
      const titleTokens =
        getMeaningfulTokens(offer.title);

      if (
        !titleTokens.length ||
        !productIdentityTokens.length
      ) {
        return null;
      }

      const matchedIndexes =
        productIdentityTokens.map(productToken =>
          titleTokens.findIndex(titleToken =>
            tokensMatch(productToken, titleToken)
          )
        );

      if (matchedIndexes.some(index => index < 0)) {
        return null;
      }

      const exactMatchedTokens =
        productIdentityTokens.filter(productToken =>
          titleTokens.includes(productToken)
        ).length;

      const firstMatchedIndex = Math.min(
        ...matchedIndexes
      );

      const tokensBeforeIdentity =
        titleTokens.slice(0, firstMatchedIndex);

      const hasTypeAnchor =
        tokensBeforeIdentity.some(titleToken =>
          typeIdentityTokens.some(typeToken =>
            tokensMatch(titleToken, typeToken)
          )
        );

      const hasSupplierAnchor =
        tokensBeforeIdentity.length > 0 &&
        tokensBeforeIdentity.every(titleToken =>
          supplierTokensForMatching.some(supplierToken =>
            tokensMatch(titleToken, supplierToken)
          )
        );

      const normalizedTitlePhrase =
        normalizeSearchText(offer.title)
          .replace(createPackagePattern(), " ")
          .replace(/\s+/g, " ")
          .trim();

      const hasDirectPhrase =
        normalizedProductPhrase.length >= 2 &&
        ` ${normalizedTitlePhrase} `.includes(
          ` ${normalizedProductPhrase} `
        );

      let hasValidIdentity = false;

      if (productIdentityTokens.length === 1) {
        const productToken =
          productIdentityTokens[0];

        const exactIndex =
          titleTokens.indexOf(productToken);

        hasValidIdentity =
          exactIndex === 0 ||
          firstMatchedIndex === 0 ||
          hasTypeAnchor ||
          hasSupplierAnchor;
      } else {
        hasValidIdentity =
          hasDirectPhrase ||
          firstMatchedIndex === 0 ||
          hasTypeAnchor ||
          hasSupplierAnchor;
      }

      if (!hasValidIdentity) {
        return null;
      }

      const titlePackages =
        extractPackages(offer.title);

      let packageDistance =
        queryPackages.length ? null : 0;

      if (
        queryPackages.length &&
        titlePackages.length
      ) {
        const packageDistances =
          queryPackages.map(queryPackage => {
            const sameKindPackages =
              titlePackages.filter(titlePackage =>
                titlePackage.kind ===
                queryPackage.kind
              );

            const comparablePackages =
              sameKindPackages.length
                ? sameKindPackages
                : (
                    ["mass", "volume"].includes(
                      queryPackage.kind
                    )
                      ? titlePackages.filter(
                          titlePackage =>
                            ["mass", "volume"].includes(
                              titlePackage.kind
                            )
                        )
                      : []
                  );

            if (!comparablePackages.length) {
              return null;
            }

            return Math.min(
              ...comparablePackages.map(titlePackage =>
                Math.abs(
                  titlePackage.amount -
                  queryPackage.amount
                ) / queryPackage.amount
              )
            );
          });

        if (
          packageDistances.some(
            distance => distance === null
          )
        ) {
          return null;
        }

        packageDistance = Math.max(
          ...packageDistances
        );
      }

      const matchScore =
        Number(offer.matchScore) ||
        getMatchScore(
          offer.title,
          offer.matchedQuery
        );

      const identityCoverage =
        exactMatchedTokens /
        productIdentityTokens.length;

      const semanticScore =
        Math.round(
          (
            matchScore +
            identityCoverage * 0.08 +
            (hasDirectPhrase ? 0.06 : 0) +
            (hasTypeAnchor ? 0.03 : 0)
          ) * 1000
        ) / 1000;

      return {
        ...offer,
        matchScore,
        semanticScore,
        packageDistance,
        semanticMatchType:
          matchScore === 1
            ? "full"
            : "partial"
      };
    }

    return sourceList.map(source => {
      if (
        source?.status === "error" ||
        !Array.isArray(source.offers)
      ) {
        return source;
      }

      const relevantOffers = source.offers
        .map(evaluateOffer)
        .filter(Boolean)
        .sort((first, second) =>
          Number(
            second.semanticMatchType === "full"
          ) -
          Number(
            first.semanticMatchType === "full"
          ) ||
          (
            Number.isFinite(first.packageDistance)
              ? first.packageDistance
              : Number.POSITIVE_INFINITY
          ) -
          (
            Number.isFinite(second.packageDistance)
              ? second.packageDistance
              : Number.POSITIVE_INFINITY
          ) ||
          Number(second.semanticScore || 0) -
          Number(first.semanticScore || 0) ||
          Number(first.price || 0) -
          Number(second.price || 0)
        );

      const fullOffers = relevantOffers.filter(
        offer =>
          offer.semanticMatchType === "full"
      );

      const preferredOffers =
        fullOffers.length
          ? fullOffers
          : relevantOffers;

      let packageMatchedOffers =
        preferredOffers;

      if (queryPackages.length) {
        const offersWithPackage =
          preferredOffers.filter(offer =>
            Number.isFinite(
              offer.packageDistance
            )
          );

        if (offersWithPackage.length) {
          const nearestPackageDistance =
            Math.min(
              ...offersWithPackage.map(
                offer => offer.packageDistance
              )
            );

          packageMatchedOffers =
            offersWithPackage.filter(offer =>
              Math.abs(
                offer.packageDistance -
                nearestPackageDistance
              ) < 0.000001
            );
        }
      }

      const selectedOffers =
        packageMatchedOffers.slice(0, 10);

      const bestOffer =
        selectedOffers[0] || null;

      return {
        ...source,
        status: bestOffer
          ? "ok"
          : "no_matches",
        matchType:
          bestOffer?.semanticMatchType ||
          "none",
        productTitle:
          bestOffer?.title || null,
        link:
          bestOffer?.link ||
          source.searchLink ||
          null,
        offersCount: selectedOffers.length,
        market: calculateMarket(
          selectedOffers
        ),
        offers: selectedOffers
      };
    });
  }

  async function monitorPromCascade() {
    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const promResult =
        await monitorProm(searchQuery, "");

      return Array.isArray(promResult.offers)
        ? promResult.offers
        : [];
    });

    return buildSourceSummary(
      "Prom.ua",
      query,
      offers,
      {
        cached: false,
        searchQueries: attemptedQueries,
        searchLink:
          `https://prom.ua/ua/search?search_term=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );
  }  

  async function monitorFora() {
    const cacheKey =
      `fora:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let totalFound = 0;

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const foraResponse = await fetch(
        "https://api.catalog.ecom.fora.ua/api/2.0/exec/EcomCatalogGlobal",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://fora.ua",
            Referer: "https://fora.ua/"
          },
          body: JSON.stringify({
            method: "GetSimpleCatalogItems",
            data: {
              merchantId: 4,
              customFilter: searchQuery,
              deliveryType: 0,
              filialId: 310,
              From: 1,
              To: 30
            }
          }),
          signal: AbortSignal.timeout(20000)
        }
      );

      if (!foraResponse.ok) {
        throw new Error("FORA_REQUEST_FAILED");
      }

      const foraData = await foraResponse.json();

      const items = Array.isArray(foraData.items)
        ? foraData.items
        : [];

      totalFound = Math.max(
        totalFound,
        Number(foraData.itemsCount) || items.length
      );

      return items
        .map(item => {
          const price = parsePrice(item.price);

          if (!price || price <= 0) {
            return null;
          }

          const title = cleanText(
            [item.name, item.unit]
              .filter(Boolean)
              .join(", "),
            260
          );

          return {
            source: "Фора",
            title: title || "Без назви",
            price: Math.round(price * 100) / 100,
            currency: "UAH",
            link: item.slug
              ? `https://fora.ua/product/${encodeURIComponent(item.slug)}`
              : null,
            availability:
              Number(
                item.calcStoreQuantity ??
                item.quantity ??
                0
              ) > 0
                ? "В наявності"
                : "Немає в наявності"
          };
        })
        .filter(Boolean);
    });

    const result = buildSourceSummary(
      "Фора",
      query,
      offers,
      {
        cached: false,
        location: "базовий онлайн-каталог",
        totalFound,
        searchQueries: attemptedQueries,
        searchLink:
          `https://fora.ua/search/all?find=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorAurora() {
    const cacheKey =
      `aurora:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let firstSearchLink = "";

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const auroraUrl = new URL("https://avrora.ua/");

      const searchParams = {
        subcats: "Y",
        status: "A",
        pshort: "Y",
        pfull: "Y",
        pname: "Y",
        pkeywords: "Y",
        pcode_from_q: "Y",
        search_performed: "Y",
        q: searchQuery,
        dispatch: "products.search"
      };

      Object.entries(searchParams).forEach(
        ([name, value]) => {
          auroraUrl.searchParams.set(name, value);
        }
      );

      if (!firstSearchLink) {
        firstSearchLink = auroraUrl.toString();
      }

      const auroraResponse = await fetch(auroraUrl, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "uk-UA,uk;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
        },
        signal: AbortSignal.timeout(20000)
      });

      if (!auroraResponse.ok) {
        throw new Error("AURORA_REQUEST_FAILED");
      }

      const html = await auroraResponse.text();
      const searchOffers = [];

      const structuredProducts = [];
      const jsonLdPattern =
        /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;

      function collectStructuredProducts(value) {
        if (Array.isArray(value)) {
          value.forEach(collectStructuredProducts);
          return;
        }

        if (!value || typeof value !== "object") {
          return;
        }

        if (isProduct(value)) {
          structuredProducts.push(value);
        }

        Object.values(value).forEach(
          collectStructuredProducts
        );
      }

      for (const scriptMatch of html.matchAll(jsonLdPattern)) {
        try {
          collectStructuredProducts(
            JSON.parse(scriptMatch[2].trim())
          );
        } catch {
          // Пропускаємо службовий або некоректний JSON-LD.
        }
      }

      structuredProducts.forEach(product => {
        const productOffers = Array.isArray(product.offers)
          ? product.offers
          : product.offers
            ? [product.offers]
            : [];

        productOffers.forEach(offer => {
          const price = parsePrice(
            offer.price ??
            offer.lowPrice ??
            offer.highPrice
          );

          const title = cleanText(
            decodeHtml(product.name),
            260
          );

          if (!price || price <= 0 || !title) {
            return;
          }

          let link = null;

          try {
            link = new URL(
              offer.url || product.url || "",
              "https://avrora.ua/"
            ).toString();
          } catch {
            link = null;
          }

          searchOffers.push({
            source: "Аврора",
            title,
            price: Math.round(price * 100) / 100,
            currency:
              cleanText(offer.priceCurrency, 10) ||
              "UAH",
            link,
            availability: availabilityLabel(
              offer.availability
            )
          });
        });
      });

      const productPattern =
        /<a\b(?=[^>]*class=["'][^"']*\bproduct-title\b[^"']*["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/a>[\s\S]{0,3000}?<span\b(?=[^>]*class=["'][^"']*\bty-price-num\b[^"']*["'])[^>]*>([\d\s.,]+)<\/span>/gi;

      for (const match of html.matchAll(productPattern)) {
        const price = parsePrice(match[3]);

        const title = cleanText(
          decodeHtml(
            match[2].replace(/<[^>]*>/g, " ")
          ),
          260
        );

        if (!price || price <= 0 || !title) {
          continue;
        }

        let link = null;

        try {
          link = new URL(
            decodeHtml(match[1]),
            "https://avrora.ua/"
          ).toString();
        } catch {
          link = null;
        }

        searchOffers.push({
          source: "Аврора",
          title,
          price: Math.round(price * 100) / 100,
          currency: "UAH",
          link,
          availability: "Онлайн-каталог"
        });
      }

      return searchOffers.filter(
        (offer, index, items) =>
          items.findIndex(candidate =>
            (
              candidate.link &&
              candidate.link === offer.link
            ) ||
            (
              candidate.title === offer.title &&
              candidate.price === offer.price
            )
          ) === index
      );
    });

    const result = buildSourceSummary(
      "Аврора",
      query,
      offers,
      {
        cached: false,
        searchQueries: attemptedQueries,
        searchLink:
          firstSearchLink ||
          `https://avrora.ua/?q=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorEva() {
    const cacheKey =
      `eva:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let totalFound = 0;

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const evaUrl = new URL("https://search.eva.ua/");

      evaUrl.searchParams.set("id", "10779");
      evaUrl.searchParams.set("query", searchQuery);
      evaUrl.searchParams.set("lang", "uk");
      evaUrl.searchParams.set("autocomplete", "true");
      evaUrl.searchParams.set("group", "true");

      const evaResponse = await fetch(evaUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "uk-UA,uk;q=0.9",
          Origin: "https://eva.ua",
          Referer: "https://eva.ua/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
        },
        signal: AbortSignal.timeout(20000)
      });

      if (!evaResponse.ok) {
        throw new Error("EVA_REQUEST_FAILED");
      }

      const evaData = await evaResponse.json();

      const groups = Array.isArray(
        evaData?.results?.items
      )
        ? evaData.results.items
        : [];

      const items = groups.flatMap(group =>
        Array.isArray(group?.items)
          ? group.items
          : []
      );

      totalFound = Math.max(
        totalFound,
        Number(evaData.total) || items.length
      );

      return items
        .map(item => {
          const price = parsePrice(
            item.price_min || item.price
          );

          const title = cleanText(item.name, 260);
          const link = safeUrl(item.url);

          if (!price || price <= 0 || !title) {
            return null;
          }

          return {
            source: "EVA",
            title,
            price: Math.round(price * 100) / 100,
            currency: "UAH",
            link,
            availability: item.is_presence
              ? "В наявності"
              : "Немає в наявності"
          };
        })
        .filter(Boolean);
    });

    const result = buildSourceSummary(
      "EVA",
      query,
      offers,
      {
        cached: false,
        totalFound,
        searchQueries: attemptedQueries,
        searchLink:
          `https://eva.ua/ua/search/?q=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorSilpo() {
    const cacheKey =
      `silpo:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    const branchId =
      "1ee60f26-91ca-6348-9f46-7975b9b60b08";

    let totalFound = 0;

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const silpoUrl = new URL(
        `https://sf-ecom-api.silpo.ua/v1/uk/branches/${branchId}/quick-search`
      );

      silpoUrl.searchParams.set("limit", "30");
      silpoUrl.searchParams.set("search", searchQuery);
      silpoUrl.searchParams.set(
        "sortBy",
        "productsList"
      );
      silpoUrl.searchParams.set(
        "sortDirection",
        "desc"
      );
      silpoUrl.searchParams.set(
        "deliveryType",
        "SelfPickup"
      );

      const silpoResponse = await fetch(silpoUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Accept-Language": "uk-UA,uk;q=0.9",
          Origin: "https://silpo.ua",
          Referer: "https://silpo.ua/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36"
        },
        signal: AbortSignal.timeout(20000)
      });

      if (!silpoResponse.ok) {
        const errorBody = await silpoResponse
          .text()
          .catch(() => "");

        throw new Error(
          `SILPO_REQUEST_FAILED: HTTP ${silpoResponse.status} ${cleanText(errorBody, 300)}`
        );
      }

      const silpoData = await silpoResponse.json();

      const items = [
        silpoData?.products,
        silpoData?.items,
        silpoData?.data?.products,
        silpoData?.data?.items
      ].find(Array.isArray) || [];

      totalFound = Math.max(
        totalFound,
        Number(
          silpoData?.total ??
          silpoData?.totalCount ??
          silpoData?.data?.total
        ) || items.length
      );

      return items
        .map(item => {
          const price = parsePrice(
            item.price ??
            item.currentPrice ??
            item.priceWithDiscount ??
            item.finalPrice
          );

          const title = cleanText(
            item.title ??
            item.name ??
            item.productName,
            260
          );

          const slug =
            item.slug ??
            item.productSlug ??
            item.code;

          if (!price || price <= 0 || !title) {
            return null;
          }

          return {
            source: "Сільпо",
            title,
            price: Math.round(price * 100) / 100,
            currency: "UAH",
            link: slug
              ? `https://silpo.ua/product/${encodeURIComponent(
                  slug
                )}`
              : null,
            availability: item.inStock === false
              ? "Немає в наявності"
              : "В наявності"
          };
        })
        .filter(Boolean);
    });

    const result = buildSourceSummary(
      "Сільпо",
      query,
      offers,
      {
        cached: false,
        location: "обраний магазин Сільпо",
        totalFound,
        searchQueries: attemptedQueries,
        searchLink:
          `https://silpo.ua/search?find=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorAtb() {
    const cacheKey =
      `atb:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let totalFound = 0;

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const atbUrl = new URL(
        "https://api.multisearch.io/"
      );

      atbUrl.searchParams.set("query", searchQuery);
      atbUrl.searchParams.set(
        "q",
        Math.random().toString(36).slice(-6)
      );
      atbUrl.searchParams.set("id", "11280");
      atbUrl.searchParams.set("s", "large");
      atbUrl.searchParams.set(
        "m",
        String(Date.now())
      );
      atbUrl.searchParams.set("lang", "uk");
      atbUrl.searchParams.set("location", "1154");
      atbUrl.searchParams.set(
        "key",
        "63a6d0a760fd2d0562c4061b78e64754"
      );

      const atbResponse = await fetch(atbUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Accept-Language": "uk-UA,uk;q=0.9",
          Origin: "https://www.atbmarket.com",
          Referer: "https://www.atbmarket.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36"
        },
        signal: AbortSignal.timeout(20000)
      });

      if (!atbResponse.ok) {
        const errorBody = await atbResponse
          .text()
          .catch(() => "");

        throw new Error(
          `ATB_REQUEST_FAILED: HTTP ${atbResponse.status} ${cleanText(errorBody, 300)}`
        );
      }

      const atbData = await atbResponse.json();

      const groups = Array.isArray(
        atbData?.results?.item_groups
      )
        ? atbData.results.item_groups
        : [];

      const items = groups.flatMap(group =>
        Array.isArray(group?.items)
          ? group.items.flat()
          : []
      );

      totalFound = Math.max(
        totalFound,
        Number(atbData?.total) || items.length
      );

      return items
        .map(item => {
          const price = parsePrice(item.price);
          const title = cleanText(item.name, 260);
          const link = safeUrl(item.url);

          if (!price || price <= 0 || !title) {
            return null;
          }

          return {
            source: "АТБ",
            title,
            price: Math.round(price * 100) / 100,
            currency:
              cleanText(item.currency, 10) || "грн",
            link,
            availability:
              item.is_presence === false
                ? "Немає в наявності"
                : "В наявності"
          };
        })
        .filter(Boolean);
    });

    const result = buildSourceSummary(
      "АТБ",
      query,
      offers,
      {
        cached: false,
        location: "магазин АТБ №1154",
        totalFound,
        searchQueries: attemptedQueries,
        searchLink:
          `https://www.atbmarket.com/sch?lang=uk&location=1154&query=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorKopiyochka() {
    const cacheKey =
      `kopiyochka:${query.toLocaleLowerCase("uk-UA")}`;

    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let totalFound = 0;

    const {
      offers,
      attemptedQueries
    } = await runSearchCascade(async searchQuery => {
      const requestBody = new URLSearchParams();

      requestBody.set(
        "action",
        "get_catalog_products"
      );
      requestBody.set("place_id", "");
      requestBody.set("category_term_id", "");
      requestBody.set("offset", "0");
      requestBody.set("search_query", searchQuery);
      requestBody.set("sort_by", "popularity");

      const kopiyochkaResponse = await fetch(
        "https://www.kopiyochka.ua/user-pannel/admin-ajax.php",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/x-www-form-urlencoded;charset=UTF-8",
            Origin: "https://www.kopiyochka.ua",
            Referer:
              "https://www.kopiyochka.ua/search/",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36"
          },
          body: requestBody.toString(),
          signal: AbortSignal.timeout(20000)
        }
      );

      if (!kopiyochkaResponse.ok) {
        const errorBody = await kopiyochkaResponse
          .text()
          .catch(() => "");

        throw new Error(
          `KOPIYOCHKA_REQUEST_FAILED: HTTP ${kopiyochkaResponse.status} ${cleanText(errorBody, 300)}`
        );
      }

      const kopiyochkaData =
        await kopiyochkaResponse.json();

      const items = Array.isArray(
        kopiyochkaData?.items
      )
        ? kopiyochkaData.items
        : Array.isArray(kopiyochkaData)
          ? kopiyochkaData
          : [];

      totalFound = Math.max(
        totalFound,
        items.length
      );

      return items
        .map(item => {
          const promoPrice = parsePrice(
            item.promo_unit_price
          );

          const basePrice = parsePrice(
            item.base_unit_price
          );

          const price =
            promoPrice && promoPrice > 0
              ? promoPrice
              : basePrice;

          const title = cleanText(
            decodeHtml(item.post_title),
            260
          );

          const link = safeUrl(
            item.url || item.guid
          );

          if (!price || price <= 0 || !title) {
            return null;
          }

          return {
            source: "Копійочка",
            title,
            price: Math.round(price * 100) / 100,
            currency: "UAH",
            link,
            availability: "Онлайн-каталог"
          };
        })
        .filter(Boolean);
    });

    const result = buildSourceSummary(
      "Копійочка",
      query,
      offers,
      {
        cached: false,
        totalFound,
        searchQueries: attemptedQueries,
        searchLink:
          `https://www.kopiyochka.ua/search/?phrase=${encodeURIComponent(
            attemptedQueries[0] || query
          )}`
      }
    );

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  const [
    promState,
    foraState,
    auroraState,
    evaState,
    silpoState,
    atbState,
    kopiyochkaState
  ] = await Promise.allSettled([
    monitorPromCascade(),
    monitorFora(),
    monitorAurora(),
    monitorEva(),
    monitorSilpo(),
    monitorAtb(),
    monitorKopiyochka()
  ]);

  const promSource = promState.status === "fulfilled"
    ? promState.value
    : buildErrorSource(
      "Prom.ua",
      "Prom тимчасово не відповідає."
    );

  if (promState.status === "rejected") {
    console.error("[Prom.ua]", promState.reason);
  }


  const foraSource = foraState.status === "fulfilled"
    ? foraState.value
    : buildErrorSource(
      "Фора",
      "Фора тимчасово не відповідає."
    );

  if (foraState.status === "rejected") {
    console.error("[Фора]", foraState.reason);
  }

  const auroraSource = auroraState.status === "fulfilled"
    ? auroraState.value
    : buildErrorSource(
      "Аврора",
      "Аврора тимчасово не відповідає."
    );

  if (auroraState.status === "rejected") {
    console.error("[Аврора]", auroraState.reason);
  }

  const evaSource = evaState.status === "fulfilled"
    ? evaState.value
    : buildErrorSource(
      "EVA",
      "EVA тимчасово не відповідає."
    );

  if (evaState.status === "rejected") {
    console.error("[EVA]", evaState.reason);
  }

  const silpoSource = silpoState.status === "fulfilled"
    ? silpoState.value
    : buildErrorSource(
      "Сільпо",
      "Сільпо тимчасово не відповідає."
    );

  if (silpoState.status === "rejected") {
    console.error("[Сільпо]", silpoState.reason);
  }

  const atbSource = atbState.status === "fulfilled"
    ? atbState.value
    : buildErrorSource(
      "АТБ",
      "АТБ тимчасово не відповідає."
    );

  if (atbState.status === "rejected") {
    console.error("[АТБ]", atbState.reason);
  }

  const kopiyochkaSource =
    kopiyochkaState.status === "fulfilled"
      ? kopiyochkaState.value
      : buildErrorSource(
        "Копійочка",
        "Копійочка тимчасово не відповідає."
      );

  if (kopiyochkaState.status === "rejected") {
    console.error(
      "[Копійочка]",
      kopiyochkaState.reason
    );
  }

  let sources = [
    promSource,
    foraSource,
    auroraSource,
    evaSource,
    silpoSource,
    atbSource,
    kopiyochkaSource
  ];

  try {
    sources = filterSourcesByMeaning(sources);
  } catch (error) {
    console.error("[Offer relevance]", error);
  }

  let aiReview = null;

  try {
    aiReview = await generateAiBusinessReview({
      productName,
      supplier,
      segment,
      category,
      type,
      purchasePrice,
      plannedRetailPrice,
      sources
    });
  } catch (error) {
    console.error("[Groq AI]", error);
  }

  const filteredPromSource = sources.find(
    source => source.source === "Prom.ua"
  ) || promSource;

  return {
    query,
    checkedAt: new Date().toISOString(),
    cached: sources.every(
      source => source.cached === true
    ),
    provider: "multi-source",
    offers: Array.isArray(filteredPromSource.offers)
      ? filteredPromSource.offers
      : [],
    market:
      filteredPromSource.market ||
      calculateMarket([]),
    sources,
    aiReview
  };
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(request, response);

  const requestUrl = new URL(
    request.url || "/",
    `http://${request.headers.host || "localhost"}`
  );

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      monitoringConfigured: true,
      sources: ["Prom.ua", "Фора", "Аврора", "EVA", "Сільпо"]
    });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/monitor") {
    const rateLimit = checkRateLimit(getClientIp(request));

    if (!rateLimit.allowed) {
      response.setHeader("Retry-After", String(rateLimit.retryAfter));
      sendJson(response, 429, {
        error: "RATE_LIMITED",
        message: "Забагато запитів. Спробуйте пізніше."
      });
      return;
    }

    try {
      const requestBody = await readJsonBody(request);
      const result = await monitorProduct(requestBody);

      sendJson(response, 200, result);
    } catch (error) {
      const knownErrors = {
        REQUEST_TOO_LARGE: {
          statusCode: 413,
          message: "Запит завеликий."
        },
        INVALID_JSON: {
          statusCode: 400,
          message: "Некоректний формат запиту."
        },
        PRODUCT_NAME_REQUIRED: {
          statusCode: 400,
          message: "Вкажіть назву товару."
        },
        PROM_REQUEST_FAILED: {
          statusCode: 502,
          message: "Prom тимчасово не відповідає."
        }
      };

      const knownError = knownErrors[error.message];

      console.error("[monitoring-api]", error);

      sendJson(response, knownError?.statusCode || 500, {
        error: error.message || "INTERNAL_ERROR",
        message: knownError?.message || "Не вдалося виконати моніторинг."
      });
    }

    return;
  }

  sendJson(response, 404, {
    error: "NOT_FOUND",
    message: "Маршрут не знайдено."
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CM assortment API started on port ${PORT}`);
});
