import http from "node:http";
import { URL } from "node:url";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const MAX_BODY_SIZE = 10 * 1024;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestLog = new Map();

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

function cleanText(value, maxLength = 180) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
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

  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function makeOffer(item) {
  const price = parsePrice(item.extracted_price ?? item.price);

  if (!price || price <= 0) {
    return null;
  }

  const link = [item.link, item.product_link].find(value =>
    typeof value === "string" && value.startsWith("http")
  ) || null;

  return {
    title: cleanText(item.title, 240) || "Без назви",
    source: cleanText(item.source, 100) || "Невідомий магазин",
    price: Math.round(price * 100) / 100,
    link,
    delivery: cleanText(item.delivery, 120) || null
  };
}

async function monitorProduct(requestBody) {
  if (!SERPAPI_KEY) {
    const error = new Error("SERPAPI_KEY_MISSING");
    error.statusCode = 503;
    throw error;
  }

  const productName = cleanText(requestBody.productName);
  const supplier = cleanText(requestBody.supplier, 120);

  if (!productName) {
    const error = new Error("PRODUCT_NAME_REQUIRED");
    error.statusCode = 400;
    throw error;
  }

  const query = [supplier, productName].filter(Boolean).join(" ");

  const searchParams = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl: "ua",
    hl: "uk",
    num: "20",
    api_key: SERPAPI_KEY
  });

  const providerResponse = await fetch(
    `https://serpapi.com/search.json?${searchParams.toString()}`,
    {
      headers: {
        Accept: "application/json"
      },
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!providerResponse.ok) {
    const error = new Error("PROVIDER_REQUEST_FAILED");
    error.statusCode = 502;
    throw error;
  }

  const providerData = await providerResponse.json();

  if (providerData.error) {
    const error = new Error("PROVIDER_RETURNED_ERROR");
    error.statusCode = 502;
    throw error;
  }

  const offers = (providerData.shopping_results || [])
    .map(makeOffer)
    .filter(Boolean)
    .sort((first, second) => first.price - second.price)
    .slice(0, 20);

  const prices = offers.map(offer => offer.price);
  const averagePrice = prices.length
    ? Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100
    : null;

  return {
    query,
    checkedAt: providerData.search_metadata?.processed_at || new Date().toISOString(),
    provider: "Google Shopping через SerpApi",
    offers,
    market: {
      currency: "UAH",
      lowestPrice: prices.length ? prices[0] : null,
      averagePrice,
      highestPrice: prices.length ? prices[prices.length - 1] : null
    }
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
      monitoringConfigured: Boolean(SERPAPI_KEY)
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
        SERPAPI_KEY_MISSING: {
          statusCode: 503,
          message: "Моніторинг ще не налаштований."
        },
        PROVIDER_REQUEST_FAILED: {
          statusCode: 502,
          message: "Сервіс моніторингу тимчасово недоступний."
        },
        PROVIDER_RETURNED_ERROR: {
          statusCode: 502,
          message: "Сервіс моніторингу не зміг виконати пошук."
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
