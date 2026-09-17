import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { searchProductTrends } from "./trends-service.js";
import { searchUkraineSuppliers } from "./supplier-service.js";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const MAX_BODY_SIZE = 10 * 1024;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 150;
const CACHE_TTL_MS = 15 * 60 * 1000;
const AI_REVIEW_CONTEXT_TTL_MS = 60 * 60 * 1000;

const requestLog = new Map();
const monitoringCache = new Map();
const aiReviewContextCache = new Map();

const SEARCH_TOKEN_ALIAS_GROUPS = [
  "підгуз|підгузок|памперс|diaper",
  "склянка|стакан|tumbler",
  "чашка|горнятко|кружка|mug|cup",
  "пляшка|бутилка|бутылка|bottle",
  "рушник|полотенце|towel",
  "серветка|салфетка|wipe|napkin",
  "контейнер|ємність|емкость",
  "вішалка|вешалка|hanger",
  "щітка|щетка|brush",
  "губка|спонж|sponge",
  "крем|cream|creme",
  "сироватка|сыворотка|serum",
  "шампунь|shampoo",
  "мило|мыло|soap",
  "парфуми|парфюм|духи|perfume",
  "іграшка|игрушка|toy",
  "корм|feed",
  "сумка|торба|bag",
  "рюкзак|backpack",
  "гаманець|кошелек|wallet",
  "парасолька|зонт|umbrella",
  "шкарпетки|носки|socks",
  "тапочки|капці|slippers",
  "устілка|стелька|insole",
  "тарілка|тарелка|plate",
  "ложка|spoon",
  "виделка|вилка|fork",
  "сковорода|сковорідка|pan",
  "каструля|кастрюля|pot",
  "свічка|свеча|candle",
  "дзеркало|зеркало|mirror",
  "навушники|наушники|headphones|earphones",
  "батарейка|батарея|battery",
  "зарядка|зарядний|зарядное|charger",
  "чохол|чехол|case",
  "олівець|карандаш|pencil",
  "зошит|тетрадь|notebook",
  "ножиці|ножницы|scissors",
  "фарба|краска|paint",
  "пустушка|соска|pacifier",
  "прорізувач|прорезыватель|teether"
].map(group => group.split("|"));

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
    .filter(Boolean);

  const uniqueOffers = [];
  const seen = new Set();

  for (const offer of offers) {
    const key = offer.link || `${offer.title}|${offer.price}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueOffers.push(offer);
    }
  }

  return uniqueOffers.slice(0, 40);
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

const AI_REVIEW_GOALS = {
  new_product:
    "оцінити доцільність введення нового товару",
  price_review:
    "оцінити та обґрунтувати планову роздрібну ціну",
  product_replacement:
    "оцінити товар як можливу заміну іншої позиції",
  supplier_negotiation:
    "підготувати висновки для переговорів із постачальником"
};

const AI_REVIEW_FOCUS = {
  match_quality:
    "точність знайдених товарів-аналогів",
  market_price:
    "відповідність планової ціни знайденому ринку",
  market_presence:
    "ринкова представленість товару у перевірених мережах",
  profitability:
    "закупівельна ціна, планова маржа та економіка товару",
  risks:
    "ризики порівняння та дані, які треба уточнити"
};

const AI_REVIEW_FORMATS = {
  committee:
    "короткий предметний висновок для асортиментного комітету",
  detailed:
    "детальний аналітичний огляд із поясненням висновків"
};

function cleanupAiReviewContexts() {
  const now = Date.now();

  aiReviewContextCache.forEach((record, contextId) => {
    if (
      !record ||
      now - record.savedAt > AI_REVIEW_CONTEXT_TTL_MS
    ) {
      aiReviewContextCache.delete(contextId);
    }
  });
}

function saveAiReviewContext(context) {
  cleanupAiReviewContexts();

  const contextId = randomUUID();

  aiReviewContextCache.set(contextId, {
    savedAt: Date.now(),
    context
  });

  return contextId;
}

function getAiReviewContext(contextId) {
  cleanupAiReviewContexts();

  const record = aiReviewContextCache.get(contextId);

  if (!record) {
    return null;
  }

  return record.context;
}

async function generateAiBusinessReview({
  productName,
  supplier,
  segment,
  category,
  type,
  purchasePrice,
  plannedRetailPrice,
  sources,
  reviewGoal,
  reviewFocus,
  reviewFormat,
  additionalContext
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const round = value =>
    Number.isFinite(value)
      ? Math.round(value * 100) / 100
      : null;

  const selectedGoal =
    AI_REVIEW_GOALS[reviewGoal] ||
    AI_REVIEW_GOALS.new_product;

  const selectedFocusKeys = Array.isArray(reviewFocus)
    ? reviewFocus.filter(key => AI_REVIEW_FOCUS[key])
    : [];

  const effectiveFocusKeys =
    selectedFocusKeys.length
      ? selectedFocusKeys
      : ["match_quality", "market_price", "risks"];

  const selectedFocus = effectiveFocusKeys.map(
    key => AI_REVIEW_FOCUS[key]
  );

  const selectedFormat =
    AI_REVIEW_FORMATS[reviewFormat] ||
    AI_REVIEW_FORMATS.committee;

  const relevantSources = (Array.isArray(sources) ? sources : [])
    .filter(source =>
      source?.status === "ok" &&
      Array.isArray(source.offers) &&
      source.offers.length
    );

  const marketOffers = relevantSources
    .flatMap(source =>
      [...source.offers]
        .sort((first, second) =>
          Number(second.semanticMatchType === "full") -
            Number(first.semanticMatchType === "full") ||
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
          Number(second.semanticScore || second.matchScore || 0) -
            Number(first.semanticScore || first.matchScore || 0)
        )
        .slice(0, 6)
        .map(offer => ({
          source: cleanText(source.source, 80),
          title: cleanText(offer.title, 240),
          price: round(Number(offer.price)),
          matchType:
            offer.semanticMatchType ||
            (Number(offer.matchScore) === 1
              ? "full"
              : "partial"),
          matchScore: round(
            Number(offer.semanticScore || offer.matchScore)
          ),
          packageDifferencePercent:
            Number.isFinite(offer.packageDistance)
              ? round(offer.packageDistance * 100)
              : null
        }))
    )
    .filter(offer =>
      offer.title &&
      Number.isFinite(offer.price) &&
      offer.price > 0
    );

  const businessMetrics = calculateBusinessMetrics({
    purchasePrice,
    plannedRetailPrice,
    sources: relevantSources
  });

  const marketEvidence = {
    ...businessMetrics,
    sources: relevantSources.map(source => ({
      source: cleanText(source.source, 80),
      matchType: source.matchType || "partial",
      offersCount: Number(source.offersCount) || 0,
      lowestPrice:
        Number(source.market?.lowestPrice) > 0
          ? round(Number(source.market.lowestPrice))
          : null,
      averagePrice:
        Number(source.market?.averagePrice) > 0
          ? round(Number(source.market.averagePrice))
          : null,
      highestPrice:
        Number(source.market?.highestPrice) > 0
          ? round(Number(source.market.highestPrice))
          : null
    })),
    bestOffers: marketOffers
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
        model: "openai/gpt-oss-120b",
        reasoning_effort: "low",
        temperature: 0.35,
        max_completion_tokens:
          reviewFormat === "detailed" ? 700 : 420,
        messages: [
          {
            role: "system",
            content:
              "Ти аналітик асортиментного комітету роздрібної мережі. " +
              "Сформуй українською мовою змістовний огляд саме під вибрану мету й акценти. " +
              "Не використовуй однаковий шаблон і не заповнюй відповідь загальними фразами. " +
              "Спочатку оціни, наскільки знайдені позиції справді є аналогами товару. " +
              "Враховуй вид, бренд, призначення, фасування, розмір та показники відповідності. " +
              "Якщо аналоги часткові або відрізняються фасуванням, прямо поясни, що цінове порівняння орієнтовне. " +
              "Ринкова представленість означає лише наявність релевантних пропозицій у перевірених джерелах, " +
              "а не доведений попит, популярність чи тренд. " +
              "Економіку товару аналізуй лише тоді, коли це вибрано у фокусі та є закупівельна і планова ціни. " +
              "Не вигадуй продажі, попит, якість, сезонність, характеристики або дані конкурентів. " +
              "Не переказуй механічно всі цифри — використовуй лише ті, що впливають на висновок. " +
              "Відокрем факти від припущень і заверши конкретною рекомендацією для вибраної мети. " +
              "Для короткого формату пиши стисло без зайвих заголовків. " +
              "Для детального формату структуруй відповідь за змістом, але додавай лише доречні блоки."
          },
          {
            role: "user",
            content: JSON.stringify({
              task: {
                goal: selectedGoal,
                focus: selectedFocus,
                format: selectedFormat,
                additionalContext:
                  cleanText(additionalContext, 600) || null
              },
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
    reviewFormat === "detailed" ? 5000 : 2600
  );

  if (!review) {
    throw new Error("GROQ_EMPTY_RESPONSE");
  }

  return {
    review,
    marketEvidence,
    goal: reviewGoal || "new_product",
    focus: effectiveFocusKeys,
    format: reviewFormat || "committee",
    model:
      cleanText(groqData.model, 100) ||
      "openai/gpt-oss-120b"
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

  const searchTokenAliasRoots =
    SEARCH_TOKEN_ALIAS_GROUPS.map(group =>
      group.map(alias => getTokenRoot(alias))
    );

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
      searchTokenAliasRoots.some(group =>
        group.includes(firstBase) &&
        group.includes(secondBase)
      )
    ) {
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

  const semanticContextMap = {
    careTarget: {
      face: ["для обличчя", "обличчя|лице|лиця|face|facial"],
      hands: ["для рук", "рук|руки|hands|hand"],
      feet: ["для ніг", "ніг|ног|стоп|feet|foot"],
      body: ["для тіла", "тіла|тіло|тела|body"],
      hair: ["для волосся", "волосся|волос|hair"],
      lips: ["для губ", "губ|губи|lips|lip"],
      eyes: ["для очей", "очей|глаз|eyes|eye"],
      nails: ["для нігтів", "нігтів|ногтей|nails|nail"],
      oral: [
        "для ротової порожнини",
        "ротової порожнини|порожнини рота|зубів|зубні|полости рта|oral|dental"
      ],
      intimate: [
        "для інтимної гігієни",
        "інтимної|интимной|intimate"
      ],
      footwear: [
        "для взуття",
        "взуття|обуви|обувь|shoe|shoes|footwear"
      ]
    },
    cleaningTarget: {
      laundry: [
        "для прання",
        "прання|білизни|белья|стирки|laundry"
      ],
      dishes: [
        "для посуду",
        "миття посуду|посуду|посуды|dish|dishes"
      ],
      kitchen: [
        "для кухні",
        "кухні|кухни|кухонний|кухонный|kitchen"
      ],
      bathroom: [
        "для ванної кімнати",
        "ванної|ванной|ванних кімнат|bathroom"
      ],
      toilet: [
        "для туалету",
        "туалету|туалета|унітаз|унитаз|toilet|wc"
      ],
      glassSurface: [
        "для скла",
        "скляних поверхонь|скла|стекол|стекла|window cleaner"
      ],
      furniture: [
        "для меблів",
        "меблів|мебели|furniture"
      ],
      floor: [
        "для підлоги",
        "підлоги|полов|пола|floor"
      ],
      auto: [
        "для автомобіля",
        "автомобіля|автомобиля|авто|car|auto"
      ],
      electronics: [
        "для техніки",
        "техніки|техники|екранів|экранов|electronics"
      ]
    },
    audience: {
      pets: [
        "для тварин",
        "тварин|животных|собак|кішок|котов|котів|pet|pets"
      ],
      baby: [
        "для малюків",
        "малюків|малюка|младенцев|немовлят|baby|infant"
      ],
      children: [
        "дитячий",
        "дитячий|дитячі|детский|детские|children|kids"
      ],
      women: [
        "жіночий",
        "жіночий|жіночі|женский|женские|women|woman"
      ],
      men: [
        "чоловічий",
        "чоловічий|чоловічі|мужской|мужские|men|man"
      ]
    },
    deviceTarget: {
      phone: [
        "для телефону",
        "телефону|телефона|смартфона|phone|smartphone"
      ],
      computer: [
        "для комп'ютера",
        "комп'ютера|компьютера|ноутбука|computer|laptop"
      ],
      audio: [
        "аудіо",
        "аудіо|аудио|навушники|наушники|audio|headphones"
      ]
    },
    useArea: {
      garden: [
        "для саду",
        "саду|сада|город|рослин|растений|garden"
      ],
      school: [
        "шкільний",
        "шкільний|шкільні|школьный|школьные|school"
      ],
      travel: [
        "дорожній",
        "дорожній|дорожные|подорожей|путешествий|travel"
      ],
      sport: [
        "спортивний",
        "спортивний|спортивные|спорт|sport"
      ],
      holiday: [
        "святковий",
        "святковий|праздничный|нового року|пасхи|хеллоуин|holiday"
      ]
    },
    productPurpose: {
      skincare: [
        "доглядова косметика",
        "крем для обличчя|крема для обличчя|креми для обличчя|сироватка|сыворотка|serum|догляд за обличчям|уход за лицом|зволожувальний|увлажняющий|живильний|питательный|денний крем|нічний крем|botanical cream"
      ],
      makeup: [
        "декоративна косметика",
        "декоративна косметика|декоративная косметика|макіяж|макияж|тональний|тональный|foundation|bb cream|cc cream|праймер|primer|консилер|concealer|пудра|румяна"
      ],
      soap: [
        "мило",
        "крем-мило|крем мыло|мило|мыло|soap"
      ],
      hairColor: [
        "фарба для волосся",
        "фарба для волосся|краска для волос|крем-фарба|крем краска|hair color|color sensation"
      ],
      cleansing: [
        "очищення обличчя",
        "очищення обличчя|очищение лица|вмивання|умывания|міцелярна|мицеллярная|cleanser|cleansing"
      ]
    }
  };

  const semanticContextRules =
    Object.entries(semanticContextMap).flatMap(
      ([axis, concepts]) =>
        Object.entries(concepts).map(
          ([key, [hint, aliasText]]) => ({
            axis,
            key,
            hint,
            aliasTokens: aliasText
              .split("|")
              .map(alias => getMeaningfulTokens(alias))
          })
        )
    );

  function getSemanticContextKeys(value) {
    const valueTokens = getMeaningfulTokens(value);

    return semanticContextRules
      .filter(rule =>
        rule.aliasTokens.some(aliasTokens =>
          aliasTokens.length > 0 &&
          aliasTokens.every(aliasToken =>
            valueTokens.some(valueToken =>
              tokensMatch(aliasToken, valueToken)
            )
          )
        )
      )
      .map(rule => rule.key);
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

  const aliasProductTokens =
    productTokensForMatching.filter(token => {
      const tokenRoot = getTokenRoot(token);

      return searchTokenAliasRoots.some(group =>
        group.includes(tokenRoot)
      );
    });

  const coreProductTokens =
    aliasProductTokens.length
      ? aliasProductTokens
      : classificationProductTokens.length
        ? classificationProductTokens
        : lexicalProductTokens.slice(0, 1);

  const queryPackages = extractPackages(productName);

  const productContextKeys =
    getSemanticContextKeys(productName);

  const typeContextKeys =
    getSemanticContextKeys(type);

  const categoryContextKeys =
    getSemanticContextKeys(category);

  const segmentContextKeys =
    getSemanticContextKeys(segment);

  const embeddedBrandCandidates =
    supplierTokensForMatching.length
      ? []
      : productTokensForMatching.filter(token => {
          if (!/^[a-z][a-z0-9-]{2,}$/i.test(token)) {
            return false;
          }

          const tokenRoot = getTokenRoot(token);

          const isProductAlias =
            searchTokenAliasRoots.some(group =>
              group.includes(tokenRoot)
            );

          const isSemanticAlias =
            semanticContextRules.some(rule =>
              rule.aliasTokens.some(aliasTokens =>
                aliasTokens.some(aliasToken =>
                  tokensMatch(aliasToken, token)
                )
              )
            );

          return !isProductAlias && !isSemanticAlias;
        });

  const likelyEmbeddedBrandTokens =
    embeddedBrandCandidates.length === 1 &&
    (
      aliasProductTokens.length > 0 ||
      productContextKeys.length > 0 ||
      typeContextKeys.length > 0 ||
      categoryContextKeys.length > 0
    )
      ? embeddedBrandCandidates
      : [];

  const expectedSemanticContexts = [
    ...new Set(
      semanticContextRules.map(rule => rule.axis)
    )
  ].map(axis => {
    const axisKeys = keys =>
      keys.filter(key =>
        semanticContextRules.some(rule =>
          rule.key === key && rule.axis === axis
        )
      );

    const selectedSource = [
      ["product", axisKeys(productContextKeys)],
      ["type", axisKeys(typeContextKeys)],
      ["category", axisKeys(categoryContextKeys)],
      ["segment", axisKeys(segmentContextKeys)]
    ].find(([, keys]) => keys.length > 0);

    return {
      axis,
      source: selectedSource?.[0] || null,
      keys: selectedSource?.[1] || []
    };
  }).filter(context => context.keys.length > 0);

  function assessSemanticContext(title) {
    const titleContextKeys =
      getSemanticContextKeys(title);

    let contextBonus = 0;
    let conflictPenalty = 0;
    let matchedContexts = 0;
    let strongConflict = false;

    expectedSemanticContexts.forEach(context => {
      const titleAxisKeys =
        titleContextKeys.filter(key =>
          semanticContextRules.some(rule =>
            rule.key === key &&
            rule.axis === context.axis
          )
        );

      if (!titleAxisKeys.length) {
        return;
      }

      const hasExpectedContext =
        titleAxisKeys.some(key =>
          context.keys.includes(key)
        );

      const hasExclusiveConflict =
        context.axis === "productPurpose" &&
        titleAxisKeys.some(key =>
          !context.keys.includes(key)
        );

      if (
        hasExpectedContext &&
        !hasExclusiveConflict
      ) {
        matchedContexts += 1;

        contextBonus += {
          product: 0.14,
          type: 0.1,
          category: 0.06,
          segment: 0.03
        }[context.source] || 0;

        return;
      }

      const basePenalty = {
        product: 0.42,
        type: 0.32,
        category: 0.2,
        segment: 0.08
      }[context.source] || 0;

      const axisMultiplier = {
        careTarget: 1,
        cleaningTarget: 1,
        productPurpose: 1,
        audience: 0.55,
        deviceTarget: 0.45,
        useArea: 0.35
      }[context.axis] || 0.5;

      conflictPenalty +=
        basePenalty * axisMultiplier;

      if (
        [
          "careTarget",
          "cleaningTarget",
          "productPurpose"
        ]
          .includes(context.axis) &&
        ["product", "type", "category"]
          .includes(context.source)
      ) {
        strongConflict = true;
      }
    });

    return {
      contextBonus:
        Math.min(contextBonus, 0.22),
      conflictPenalty:
        Math.min(conflictPenalty, 0.65),
      matchedContexts,
      strongConflict
    };
  }

  function getMatchScore(title, matchedQuery = "") {
    const titleTokens = getMeaningfulTokens(title);
    const matchedQueryTokens =
      getMeaningfulTokens(matchedQuery);

    const semanticContext =
      assessSemanticContext(title);

    if (
      !titleTokens.length ||
      !productTokensForMatching.length
    ) {
      return 0;
    }

    if (semanticContext.strongConflict) {
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
      !matchedCoreTokens
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
      !packageDifferent &&
      semanticContext.conflictPenalty === 0;

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

    score += semanticContext.contextBonus;
    score -= semanticContext.conflictPenalty;

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

    const productWithoutLikelyBrand =
      productWithoutPackage
        .split(" ")
        .filter(token =>
          !likelyEmbeddedBrandTokens.some(
            brandToken =>
              tokensMatch(token, brandToken)
          )
        )
        .join(" ")
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

    const contextPriority = [
      "careTarget",
      "cleaningTarget",
      "deviceTarget",
      "audience",
      "useArea"
    ];

    const semanticHintContext =
      [...expectedSemanticContexts]
        .filter(context =>
          ["type", "category"].includes(
            context.source
          )
        )
        .sort((first, second) =>
          contextPriority.indexOf(first.axis) -
          contextPriority.indexOf(second.axis)
        )[0];

    const classificationSearchHint =
      semanticHintContext
        ? semanticContextRules.find(rule =>
            rule.key ===
            semanticHintContext.keys[0]
          )?.hint || ""
        : "";

    const contextQuery = [
      supplierAlreadyInProductName
        ? ""
        : supplier,
      productWithoutPackage,
      classificationSearchHint
    ]
      .filter(Boolean)
      .join(" ");

    const contextWithoutBrandQuery = [
      productWithoutLikelyBrand,
      classificationSearchHint
    ]
      .filter(Boolean)
      .join(" ");

    const queryCandidates = [
      exactQuery,
      contextQuery,
      contextWithoutBrandQuery,
      productWithoutLikelyBrand,
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
        seenQueries.has(cleanedCandidate) ||
        uniqueQueries.length >= 4
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

    const queryConcurrency = 2;

    for (
      let startIndex = 0;
      startIndex < searchQueries.length;
      startIndex += queryConcurrency
    ) {
      const queryBatch = searchQueries.slice(
        startIndex,
        startIndex + queryConcurrency
      );

      attemptedQueries.push(...queryBatch);

      const batchResults = await Promise.allSettled(
        queryBatch.map(async searchQuery => ({
          searchQuery,
          loadedOffers: await loadOffers(searchQuery)
        }))
      );

      batchResults.forEach(result => {
        if (result.status === "rejected") {
          firstError ||= result.reason;
          return;
        }

        successfulRequests += 1;

        const {
          searchQuery,
          loadedOffers
        } = result.value;

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
      });
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
        ) &&
        !likelyEmbeddedBrandTokens.some(brandToken =>
          tokensMatch(productToken, brandToken)
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

      const semanticContext =
        assessSemanticContext(offer.title);

      if (
        !titleTokens.length ||
        !productIdentityTokens.length ||
        semanticContext.strongConflict
      ) {
        return null;
      }

      const hasCoreIdentityMatch =
        coreProductTokens.some(coreToken =>
          titleTokens.some(titleToken =>
            tokensMatch(coreToken, titleToken)
          )
        );

      if (!hasCoreIdentityMatch) {
        return null;
      }

      const matchedIndexes =
        productIdentityTokens.map(productToken =>
          titleTokens.findIndex(titleToken =>
            tokensMatch(productToken, titleToken)
          )
        );

      const matchedIdentityCount =
        matchedIndexes
          .filter(index => index >= 0)
          .length;

      const identityCoverage =
        matchedIdentityCount /
        productIdentityTokens.length;

      const minimumIdentityCoverage =
        productIdentityTokens.length === 1
          ? 1
          : 0.5;

      if (
        identityCoverage <
        minimumIdentityCoverage
      ) {
        return null;
      }

      const exactMatchedTokens =
        productIdentityTokens.filter(productToken =>
          titleTokens.includes(productToken)
        ).length;

      const firstMatchedIndex = Math.min(
        ...matchedIndexes.filter(
          index => index >= 0
        )
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
          hasSupplierAnchor ||
          semanticContext.matchedContexts > 0;
      } else {
        hasValidIdentity =
          hasDirectPhrase ||
          firstMatchedIndex === 0 ||
          hasTypeAnchor ||
          hasSupplierAnchor ||
          semanticContext.matchedContexts > 0;
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

      const exactIdentityCoverage =
        exactMatchedTokens /
        productIdentityTokens.length;

      const semanticScore =
        Math.round(
          (
            matchScore +
            identityCoverage * 0.08 +
            exactIdentityCoverage * 0.03 +
            (hasDirectPhrase ? 0.06 : 0) +
            (hasTypeAnchor ? 0.03 : 0) +
            semanticContext.contextBonus -
            semanticContext.conflictPenalty
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

      const preferredOffers = relevantOffers;

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

  const checkedAt = new Date().toISOString();

  const reviewContextId = saveAiReviewContext({
    productName,
    supplier,
    segment,
    category,
    type,
    purchasePrice,
    plannedRetailPrice,
    checkedAt,
    sources
  });

  const filteredPromSource = sources.find(
    source => source.source === "Prom.ua"
  ) || promSource;

  return {
    query,
    checkedAt,
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
    reviewContextId
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

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/monitor-review"
  ) {
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
      const reviewContextId = cleanText(
        requestBody.reviewContextId,
        100
      );

      if (!reviewContextId) {
        throw new Error("REVIEW_CONTEXT_REQUIRED");
      }

      const reviewContext = getAiReviewContext(
        reviewContextId
      );

      if (!reviewContext) {
        throw new Error("REVIEW_CONTEXT_EXPIRED");
      }

      const aiReview = await generateAiBusinessReview({
        ...reviewContext,
        reviewGoal: cleanText(requestBody.reviewGoal, 80),
        reviewFocus: requestBody.reviewFocus,
        reviewFormat: cleanText(requestBody.reviewFormat, 80),
        additionalContext: cleanText(
          requestBody.additionalContext,
          600
        )
      });

      sendJson(response, 200, {
        checkedAt: reviewContext.checkedAt,
        aiReview
      });
    } catch (error) {
      const errorCode = String(error.message || "")
        .split(":")[0];

      const knownErrors = {
        REQUEST_TOO_LARGE: {
          statusCode: 413,
          message: "Запит завеликий."
        },
        INVALID_JSON: {
          statusCode: 400,
          message: "Некоректний формат запиту."
        },
        REVIEW_CONTEXT_REQUIRED: {
          statusCode: 400,
          message: "Спочатку виконайте моніторинг товару."
        },
        REVIEW_CONTEXT_EXPIRED: {
          statusCode: 410,
          message:
            "Результат моніторингу застарів. Оновіть ціни й повторіть огляд."
        },
        GROQ_API_KEY_MISSING: {
          statusCode: 503,
          message: "Сервіс ШІ зараз не налаштований."
        },
        GROQ_REQUEST_FAILED: {
          statusCode: 502,
          message: "Сервіс ШІ тимчасово не відповідає."
        },
        GROQ_EMPTY_RESPONSE: {
          statusCode: 502,
          message: "Сервіс ШІ не сформував огляд."
        }
      };

      const knownError = knownErrors[errorCode];

      console.error("[monitor-review-api]", error);

      sendJson(response, knownError?.statusCode || 500, {
        error: errorCode || "INTERNAL_ERROR",
        message:
          knownError?.message ||
          "Не вдалося сформувати огляд ШІ."
      });
    }

    return;
  }

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/suppliers"
  ) {
    const rateLimit = checkRateLimit(
      getClientIp(request)
    );

    if (!rateLimit.allowed) {
      response.setHeader(
        "Retry-After",
        String(rateLimit.retryAfter)
      );

      sendJson(response, 429, {
        error: "RATE_LIMITED",
        message:
          "Забагато запитів. Спробуйте пізніше."
      });

      return;
    }

    try {
      const requestBody =
        await readJsonBody(request);

      const result =
        await searchUkraineSuppliers({
          productTitle: cleanText(
            requestBody.productTitle,
            240
          ),
          description: cleanText(
            requestBody.description,
            500
          ),
          categoryLabel: cleanText(
            requestBody.categoryLabel,
            140
          )
        });

      sendJson(response, 200, result);
    } catch (error) {
      const errorCode = String(
        error.message || ""
      ).split(":")[0];

      const knownErrors = {
        REQUEST_TOO_LARGE: {
          statusCode: 413,
          message: "Запит завеликий."
        },
        INVALID_JSON: {
          statusCode: 400,
          message:
            "Некоректний формат запиту."
        },
        SUPPLIER_PRODUCT_REQUIRED: {
          statusCode: 400,
          message:
            "Не вдалося визначити товар для пошуку постачальників."
        }
      };

      const knownError =
        knownErrors[errorCode];

      console.error(
        "[suppliers-api]",
        error
      );

      sendJson(
        response,
        knownError?.statusCode || 500,
        {
          error:
            errorCode ||
            "INTERNAL_ERROR",
          message:
            knownError?.message ||
            "Не вдалося знайти постачальників в Україні."
        }
      );
    }

    return;
  }

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/trends"
  ) {
    const rateLimit = checkRateLimit(
      getClientIp(request)
    );

    if (!rateLimit.allowed) {
      response.setHeader(
        "Retry-After",
        String(rateLimit.retryAfter)
      );

      sendJson(response, 429, {
        error: "RATE_LIMITED",
        message:
          "Забагато запитів. Спробуйте пізніше."
      });

      return;
    }

    try {
      const requestBody =
        await readJsonBody(request);

      const result =
        await searchProductTrends(requestBody);

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
        TREND_CATEGORY_REQUIRED: {
          statusCode: 400,
          message: "Оберіть категорію товару."
        },
        TREND_CATEGORY_INVALID: {
          statusCode: 400,
          message:
            "Обрана категорія не підтримується."
        },
        TREND_SIGNAL_TYPE_INVALID: {
          statusCode: 400,
          message:
            "Обраний тип сигналу не підтримується."
        },
        TREND_MARKET_INVALID: {
          statusCode: 400,
          message:
            "Обраний ринок не підтримується."
        }
      };

      const knownError =
        knownErrors[error.message];

      console.error("[trends-api]", error);

      sendJson(
        response,
        knownError?.statusCode ||
          error.statusCode ||
          500,
        {
          error:
            error.message ||
            "INTERNAL_ERROR",
          message:
            knownError?.message ||
            "Не вдалося виконати пошук новинок."
        }
      );
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
