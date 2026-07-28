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

async function monitorProduct(requestBody) {
  const productName = cleanText(requestBody.productName);
  const supplier = cleanText(requestBody.supplier, 120);

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
      .toLocaleLowerCase("uk-UA")
      .replace(/[’'`"]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function tokenizeSearchText(value) {
    return [
      ...new Set(
        normalizeSearchText(value)
          .split(" ")
          .filter(token => token.length >= 2)
      )
    ];
  }

  function getMatchScore(title, searchQuery) {
    const titleText = normalizeSearchText(title);
    const queryTokens = tokenizeSearchText(searchQuery);

    if (!titleText || !queryTokens.length) {
      return 0;
    }

    const matchedTokens = queryTokens.filter(token => titleText.includes(token));
    return matchedTokens.length / queryTokens.length;
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
        matchScore: getMatchScore(offer.title, sourceQuery)
      }))
      .filter(offer => offer.matchScore > 0)
      .sort((first, second) =>
        second.matchScore - first.matchScore ||
        first.price - second.price
      );

    const queryTokens = tokenizeSearchText(sourceQuery);
    const minimumScore = queryTokens.length <= 1 ? 1 : 0.5;
    const fullOffers = scoredOffers.filter(offer => offer.matchScore === 1);

    const matchedOffers = fullOffers.length
      ? fullOffers
      : scoredOffers.filter(offer => offer.matchScore >= minimumScore);

    const bestOffer = matchedOffers[0] || null;

    return {
      source,
      status: matchedOffers.length ? "ok" : "no_matches",
      matchType: bestOffer
        ? bestOffer.matchScore === 1 && queryTokens.length >= 2
          ? "full"
          : "partial"
        : "none",
      productTitle: bestOffer?.title || null,
      link: bestOffer?.link || extra.searchLink || null,
      offersCount: matchedOffers.length,
      market: calculateMarket(matchedOffers),
      offers: matchedOffers.slice(0, 10),
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

  async function monitorFora() {
    const cacheKey = `fora:${query.toLocaleLowerCase("uk-UA")}`;
    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

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
            customFilter: query,
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
    const items = Array.isArray(foraData.items) ? foraData.items : [];

    const offers = items
      .map(item => {
        const price = parsePrice(item.price);

        if (!price || price <= 0) {
          return null;
        }

        const title = cleanText(
          [item.name, item.unit].filter(Boolean).join(", "),
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
            Number(item.calcStoreQuantity ?? item.quantity ?? 0) > 0
              ? "В наявності"
              : "Немає в наявності"
        };
      })
      .filter(Boolean);

    const result = buildSourceSummary("Фора", query, offers, {
      cached: false,
      location: "базовий онлайн-каталог",
      totalFound: Number(foraData.itemsCount) || items.length,
      searchLink: `https://fora.ua/search/all?find=${encodeURIComponent(query)}`
    });

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  async function monitorAurora() {
    const cacheKey = `aurora:${query.toLocaleLowerCase("uk-UA")}`;
    const cached = monitoringCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        cached: true
      };
    }

    const ignoredTokens = new Set([
      "для", "та", "і", "з", "у", "в", "на", "по",
      "мл", "л", "г", "кг", "шт",
      "шампунь", "бальзам", "крем", "гель", "засіб",
      "набір", "серветки", "порошок", "мило"
    ]);

    const productTokens = tokenizeSearchText(productName)
      .filter(token =>
        !ignoredTokens.has(token) &&
        !/^\d+(?:[.,]\d+)?$/.test(token)
      );

    const latinToken = productTokens.find(token => /[a-z]/i.test(token));

    const auroraQuery = latinToken ||
      [...productTokens]
        .sort((first, second) => second.length - first.length)[0] ||
      productName;

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
      q: auroraQuery,
      dispatch: "products.search"
    };

    Object.entries(searchParams).forEach(([name, value]) => {
      auroraUrl.searchParams.set(name, value);
    });

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
    const offers = [];

    const productPattern =
      /<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*\bproduct-title\b[^"]*"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<span\b[^>]*class="[^"]*\bty-price-num\b[^"]*"[^>]*>([\d\s.,]+)<\/span>/gi;

    for (const match of html.matchAll(productPattern)) {
      const price = parsePrice(match[3]);

      const title = cleanText(
        decodeHtml(match[2].replace(/<[^>]*>/g, " ")),
        260
      );

      if (!price || price <= 0 || !title) {
        continue;
      }

      offers.push({
        source: "Аврора",
        title,
        price: Math.round(price * 100) / 100,
        currency: "UAH",
        link: safeUrl(decodeHtml(match[1])),
        availability: "Онлайн-каталог"
      });
    }

    const result = buildSourceSummary("Аврора", query, offers, {
      cached: false,
      searchQuery: auroraQuery,
      searchLink: auroraUrl.toString()
    });

    monitoringCache.set(cacheKey, {
      savedAt: Date.now(),
      result
    });

    return result;
  }

  const [promState, foraState, auroraState] = await Promise.allSettled([
    monitorProm(productName, supplier),
    monitorFora(),
    monitorAurora()
  ]);

  let promResult;
  let promSource;

  if (promState.status === "fulfilled") {
    promResult = promState.value;

    promSource = buildSourceSummary(
      "Prom.ua",
      query,
      Array.isArray(promResult.offers) ? promResult.offers : [],
      {
        cached: Boolean(promResult.cached),
        searchLink: `https://prom.ua/ua/search?search_term=${encodeURIComponent(query)}`
      }
    );
  } else {
    console.error("[Prom.ua]", promState.reason);

    promResult = {
      offers: [],
      market: calculateMarket([]),
      cached: false
    };

    promSource = buildErrorSource(
      "Prom.ua",
      "Prom тимчасово не відповідає."
    );
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

  return {
    query,
    checkedAt: new Date().toISOString(),
    cached: Boolean(
      promResult.cached &&
      foraSource.cached &&
      auroraSource.cached
    ),
    provider: "multi-source",
    offers: promResult.offers,
    market: promResult.market,
    sources: [promSource, foraSource, auroraSource]
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
      sources: ["Prom.ua", "Фора", "Аврора"]
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
