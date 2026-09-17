const SUPPLIER_CACHE_TTL_MS = 30 * 60 * 1000;

const supplierSearchCache = new Map();

const SUPPLIER_ROLE_RULES = [
  {
    role: "Виробник",
    priority: 5,
    markers: [
      "виробник",
      "виробництво",
      "власне виробництво",
      "производитель",
      "производство",
      "собственное производство"
    ]
  },
  {
    role: "Офіційний дистриб’ютор",
    priority: 4,
    markers: [
      "офіційний дистриб'ютор",
      "офіційний дистриб’ютор",
      "официальный дистрибьютор",
      "дистриб'ютор",
      "дистриб’ютор",
      "дистрибьютор"
    ]
  },
  {
    role: "Імпортер",
    priority: 3,
    markers: [
      "імпортер",
      "імпорт товарів",
      "прямий імпорт",
      "импортер",
      "прямой импорт"
    ]
  },
  {
    role: "Оптовий продавець",
    priority: 2,
    markers: [
      "оптом",
      "оптовий продаж",
      "оптові ціни",
      "оптовий постачальник",
      "гурт",
      "гуртовий",
      "гуртом",
      "дрібний опт",
      "мелкий опт",
      "оптовая продажа",
      "оптовые цены",
      "оптовый поставщик"
    ]
  }
];

const MARKETPLACE_HOSTS = new Set([
  "prom.ua",
  "www.prom.ua",
  "rozetka.com.ua",
  "www.rozetka.com.ua",
  "bigl.ua",
  "www.bigl.ua",
  "zakupka.com",
  "www.zakupka.com"
]);

const SEARCH_STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "from",
  "this",
  "that",
  "new",
  "best",
  "hot",
  "товар",
  "товари",
  "купити",
  "ціна",
  "україна",
  "украине",
  "оптом",
  "постачальник",
  "поставщик",
  "для",
  "від",
  "при",
  "про",
  "або",
  "та",
  "і",
  "в",
  "у",
  "на",
  "з",
  "по"
]);

const HOROSHOP_EXTERNAL_NOISE_HOSTS = [
  "horoshop.ua",
  "cartum.io",
  "cartum.md",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "t.me",
  "work.ua",
  "google.com"
];

const HOROSHOP_CATEGORY_LABELS = {
  "dishware-wholesale": "посуд товари для кухні",
  "home-goods": "товари для дому інвентар для дому",
  clothes: "одяг",
  shoes: "взуття",
  "baby-products": "дитячі товари",
  cosmetics: "косметика краса догляд",
  electronics: "електроніка",
  "home-appliances": "побутова техніка",
  groceries: "продукти харчування",
  "pet-supplies": "зоотовари",
  "home-garden-and-tools": "дім сад город",
  "sports-and-outdoor-recreation":
    "спорт активний відпочинок",
  "construction-and-renovation":
    "будівництво ремонт",
  tools: "інструменти",
  "office-supplies": "канцтовари",
  "auto-parts-and-accessories":
    "запчастини автотовари"
};

function cleanSupplierText(value, maxLength = 500) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function decodeSupplierHtml(value) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&#39;": "'",
    "&nbsp;": " "
  };

  return String(value || "")
    .replace(
      /&(amp|lt|gt|quot|#039|#39|nbsp);/gi,
      entity => entities[entity.toLowerCase()] || entity
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number(code))
    );
}

function normalizeSupplierText(value) {
  return cleanSupplierText(value, 2000)
    .toLocaleLowerCase("uk-UA")
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSupplierTokens(value) {
  return normalizeSupplierText(value)
    .split(" ")
    .filter(token =>
      token.length >= 3 &&
      !SEARCH_STOP_WORDS.has(token)
    );
}

function getSafeSupplierUrl(value) {
  try {
    const url = new URL(String(value || ""));

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function getSupplierHostname(value) {
  try {
    return new URL(value).hostname.toLocaleLowerCase("uk-UA");
  } catch {
    return "";
  }
}

function isUkrainianSupplierUrl(value) {
  const hostname = getSupplierHostname(value);

  return (
    hostname.endsWith(".ua") ||
    hostname === "bigopt.com" ||
    hostname.endsWith(".bigopt.com") ||
    hostname === "zakupka.com" ||
    hostname.endsWith(".zakupka.com")
  );
}

function unwrapDuckDuckGoUrl(value) {
  const decodedValue = decodeSupplierHtml(value);

  try {
    const url = new URL(
      decodedValue.startsWith("//")
        ? `https:${decodedValue}`
        : decodedValue,
      "https://html.duckduckgo.com"
    );

    if (
      url.hostname.endsWith("duckduckgo.com") &&
      url.searchParams.get("uddg")
    ) {
      return getSafeSupplierUrl(
        url.searchParams.get("uddg")
      );
    }

    return getSafeSupplierUrl(url.toString());
  } catch {
    return "";
  }
}

function parseJsonObject(value) {
  const text = String(value || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");

    if (startIndex === -1 || endIndex <= startIndex) {
      return null;
    }

    try {
      return JSON.parse(
        text.slice(startIndex, endIndex + 1)
      );
    } catch {
      return null;
    }
  }
}

function uniqueSupplierValues(values, limit = 5) {
  const uniqueValues = [];
  const seenValues = new Set();

  for (const value of values) {
    const cleanedValue = cleanSupplierText(value, 180);
    const normalizedValue = normalizeSupplierText(cleanedValue);

    if (
      !cleanedValue ||
      !normalizedValue ||
      seenValues.has(normalizedValue)
    ) {
      continue;
    }

    seenValues.add(normalizedValue);
    uniqueValues.push(cleanedValue);

    if (uniqueValues.length >= limit) {
      break;
    }
  }

  return uniqueValues;
}

function buildFallbackSearchTerms(productTitle) {
  const title = cleanSupplierText(productTitle, 180);

  const compactTitle = title
    .replace(/\([^)]*\)/g, " ")
    .replace(
      /\b\d+(?:[.,]\d+)?\s*(?:ml|мл|l|л|g|г|kg|кг|cm|см|mm|мм|pcs?|шт)\b/giu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  const shortTitle = getSupplierTokens(compactTitle)
    .slice(0, 7)
    .join(" ");

  return uniqueSupplierValues([
    compactTitle,
    shortTitle,
    title
  ], 3);
}

function inferHoroshopDirectoryCategory(value) {
  const text = normalizeSupplierText(value);

  const rules = [
    [
      "dishware-wholesale",
      /посуд|таріл|мисоч|миска|чашк|склян|бокал|соусниц|піал|сушарк.{0,12}посуд|столов.{0,12}прилад/u
    ],
    [
      "cosmetics",
      /космет|макіяж|крем|шампун|парфум|догляд.{0,12}(облич|волос|тіл)|манікюр/u
    ],
    [
      "home-appliances",
      /побутов.{0,12}технік|холодиль|пральн|пилосос|мікрохв|кавовар|блендер|електрочайн/u
    ],
    [
      "electronics",
      /електрон|телефон|смартфон|ноутбук|комп'ютер|навушник|планшет|power bank|павербанк/u
    ],
    [
      "groceries",
      /продукт|їжа|напій|кава|чай|солодощ|соус|спеці|бакалі/u
    ],
    [
      "pet-supplies",
      /зоотовар|тварин|собак|кот|кіш|гризун|акварі|корм/u
    ],
    [
      "baby-products",
      /дитяч|немовля|іграш|підгуз|коляск/u
    ],
    [
      "clothes",
      /одяг|білизн|футбол|сукн|куртк|штани|шкарпет/u
    ],
    [
      "shoes",
      /взут|кросів|черевик|туфл|сандал|капц/u
    ],
    [
      "auto-parts-and-accessories",
      /авто|автомоб|запчаст|шина|акумулятор/u
    ],
    [
      "office-supplies",
      /канцтовар|офісн|папір|ручк|олів|зошит/u
    ],
    [
      "construction-and-renovation",
      /будів|ремонт|сантех|плитк|фарба.{0,12}стін|будматері/u
    ],
    [
      "tools",
      /інструмент|дриль|шуруповерт|пилк|викрутк/u
    ],
    [
      "sports-and-outdoor-recreation",
      /спорт|фітнес|туризм|рибал|велосипед|тренажер/u
    ],
    [
      "home-garden-and-tools",
      /сад|город|рослин|горщик|полив|дач/u
    ]
  ];

  return (
    rules.find(([, pattern]) =>
      pattern.test(text)
    )?.[0] ||
    "home-goods"
  );
}


async function prepareSupplierSearchContext({
  productTitle,
  description,
  categoryLabel
}) {
  const fallbackTerms =
    buildFallbackSearchTerms(productTitle);

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      productName:
        fallbackTerms[0] || productTitle,
      searchTerms: fallbackTerms,
      preparedByAi: false
    };
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-120b",
          reasoning_effort: "low",
          temperature: 0.1,
          max_completion_tokens: 280,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content:
                "Ти готуєш пошукові формулювання для пошуку постачальників в Україні. " +
                "Визнач сам товар, відкинь рекламні слова, рейтинг, кількість продажів і назву іноземного майданчика. " +
                "Переклади загальний тип товару українською, але збережи бренд, модель, матеріал, розмір та ключову функцію, якщо вони важливі. " +
                "Поверни лише JSON: {\"productName\":\"...\",\"searchTerms\":[\"...\",\"...\",\"...\"]}. " +
                "Дай від одного до трьох коротких формулювань. Не вигадуй характеристик."
            },
            {
              role: "user",
              content: JSON.stringify({
                productTitle:
                  cleanSupplierText(
                    productTitle,
                    240
                  ),
                description:
                  cleanSupplierText(
                    description,
                    350
                  ) || null,
                category:
                  cleanSupplierText(
                    categoryLabel,
                    120
                  ) || null
              })
            }
          ]
        }),
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new Error(
        `GROQ_${response.status}`
      );
    }

    const data = await response.json();

    const parsed = parseJsonObject(
      data?.choices?.[0]?.message?.content
    );

    const productName = cleanSupplierText(
      parsed?.productName,
      180
    );

    const searchTerms = uniqueSupplierValues([
      ...(Array.isArray(parsed?.searchTerms)
        ? parsed.searchTerms
        : []),
      ...fallbackTerms
    ], 4);

    if (!productName || !searchTerms.length) {
      throw new Error(
        "INVALID_AI_SEARCH_CONTEXT"
      );
    }

    return {
      productName,
      searchTerms,
      preparedByAi: true
    };
  } catch (error) {
    console.warn(
      "[supplier-search-context]",
      error?.message || error
    );

    return {
      productName:
        fallbackTerms[0] || productTitle,
      searchTerms: fallbackTerms,
      preparedByAi: false
    };
  }
}

function buildSupplierQueries(searchTerms) {
  const mainTerms = searchTerms.slice(0, 3);
  const queries = [];

  for (const term of mainTerms) {
    queries.push(
      `${term} оптом постачальник Україна site:.ua`,
      `${term} виробник імпортер дистриб'ютор Україна site:.ua`
    );
  }

  return uniqueSupplierValues(queries, 6);
}

function extractDuckDuckGoCandidates(
  html,
  query
) {
  const candidates = [];

  const resultPattern =
    /<div[^>]+class="[^"]*\bresult\b[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*\bresult\b|$)/gi;

  for (
    const resultMatch
    of String(html || "").matchAll(
      resultPattern
    )
  ) {
    const block = resultMatch[1];

    const linkMatch = block.match(
      /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
    );

    if (!linkMatch) {
      continue;
    }

    const link = unwrapDuckDuckGoUrl(
      linkMatch[1]
    );

    if (
      !link ||
      !isUkrainianSupplierUrl(link)
    ) {
      continue;
    }

    const snippetMatch = block.match(
      /<(?:a|div)[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div)>/i
    );

    candidates.push({
      title: cleanSupplierText(
        decodeSupplierHtml(linkMatch[2]),
        220
      ),
      snippet: cleanSupplierText(
        decodeSupplierHtml(
          snippetMatch?.[1]
        ),
        500
      ),
      link,
      query,
      source: "Вебпошук"
    });
  }

  return candidates.slice(0, 10);
}

async function searchDuckDuckGo(query) {
  const url =
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "uk-UA,uk;q=0.9,en;q=0.6",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(
      `DUCKDUCKGO_${response.status}`
    );
  }

  return extractDuckDuckGoCandidates(
    await response.text(),
    query
  );
}

function collectJsonLdObjects(
  value,
  objects = []
) {
  if (Array.isArray(value)) {
    value.forEach(item =>
      collectJsonLdObjects(
        item,
        objects
      )
    );

    return objects;
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return objects;
  }

  objects.push(value);

  Object.values(value).forEach(item =>
    collectJsonLdObjects(
      item,
      objects
    )
  );

  return objects;
}

function extractPromSupplierCandidates(
  html,
  query
) {
  const objects = [];

  const scriptPattern =
    /<script\b[^>]*type=(?:["'])application\/ld\+json(?:["'])[^>]*>([\s\S]*?)<\/script>/gi;

  for (
    const match
    of String(html || "").matchAll(
      scriptPattern
    )
  ) {
    try {
      collectJsonLdObjects(
        JSON.parse(match[1].trim()),
        objects
      );
    } catch {
      // Пропускаємо службовий JSON-LD.
    }
  }

  const candidates = [];

  for (const object of objects) {
    const type = Array.isArray(
      object?.["@type"]
    )
      ? object["@type"]
      : [object?.["@type"]];

    if (!type.includes("Product")) {
      continue;
    }

    const offers = Array.isArray(
      object.offers
    )
      ? object.offers
      : object.offers
        ? [object.offers]
        : [];

    const offerWithSeller =
      offers.find(offer =>
        offer?.seller?.name ||
        offer?.seller?.url
      );

    const link = getSafeSupplierUrl(
      object.url ||
      offerWithSeller?.url ||
      offers.find(
        offer => offer?.url
      )?.url
    );

    if (!link) {
      continue;
    }

    candidates.push({
      title: cleanSupplierText(
        object.name,
        220
      ),
      snippet: cleanSupplierText(
        object.description,
        500
      ),
      link,
      supplierName:
        cleanSupplierText(
          offerWithSeller?.seller?.name,
          140
        ),
      supplierLink:
        getSafeSupplierUrl(
          offerWithSeller?.seller?.url
        ),
      query,
      source: "Prom.ua"
    });
  }

  return candidates.slice(0, 16);
}

async function searchPromSuppliers(term) {
  const query = `${term} оптом`;

  const url =
    `https://prom.ua/ua/search?search_term=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "uk-UA,uk;q=0.9,en;q=0.6",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(
      `PROM_${response.status}`
    );
  }

  return extractPromSupplierCandidates(
    await response.text(),
    query
  );
}

function extractBigOptSearchCandidates(
  html,
  query
) {
  const candidates = [];

  const productPattern =
    /<div[^>]+class=["'][^"']*\bpg-sup\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<a[^>]+href=["']([^"']+)["'][^>]+class=["'][^"']*\bpg-name\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (
    const match
    of String(html || "").matchAll(
      productPattern
    )
  ) {
    const supplierName =
      cleanSupplierText(
        decodeSupplierHtml(match[1]),
        140
      );

    const link = getSafeSupplierUrl(
      decodeSupplierHtml(match[2])
    );

    const title = cleanSupplierText(
      decodeSupplierHtml(match[3]),
      220
    );

    if (
      !supplierName ||
      !link ||
      !title
    ) {
      continue;
    }

    candidates.push({
      title,
      snippet:
        `${supplierName}. Оптовий постачальник. Товар: ${title}`,
      link,
      supplierName,
      query,
      source: "BigOpt",
      ukraineVerified: true
    });

    if (candidates.length >= 8) {
      break;
    }
  }

  return candidates;
}

function extractBigOptSupplierLink(html) {
  const linkMatch = String(html || "").match(
    /<a[^>]+href=["']([^"']+)["'][^>]*>\s*(?:<[^>]+>\s*)*Перейти на сайт постачальника[\s\S]*?<\/a>/i
  );

  return getSafeSupplierUrl(
    decodeSupplierHtml(linkMatch?.[1])
  );
}

async function loadBigOptSupplierCandidate(
  candidate
) {
  try {
    const response = await fetch(
      candidate.link,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml",
          "Accept-Language":
            "uk-UA,uk;q=0.9,en;q=0.6",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/124 Safari/537.36"
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      return candidate;
    }

    const html = await response.text();

    return {
      ...candidate,
      supplierLink:
        extractBigOptSupplierLink(html)
    };
  } catch {
    return candidate;
  }
}

async function searchBigOptSuppliers(term) {
  const query = cleanSupplierText(
    term,
    180
  );

  const url =
    "https://bigopt.com/search/?m=2&terms=" +
    encodeURIComponent(query);

  const response = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "uk-UA,uk;q=0.9,en;q=0.6",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(
      `BIGOPT_${response.status}`
    );
  }

  const candidates =
    extractBigOptSearchCandidates(
      await response.text(),
      query
    );

  const enrichedCandidates = [];

  for (
    let index = 0;
    index < candidates.length;
    index += 4
  ) {
    const batch = candidates.slice(
      index,
      index + 4
    );

    enrichedCandidates.push(
      ...await Promise.all(
        batch.map(
          loadBigOptSupplierCandidate
        )
      )
    );
  }

  return enrichedCandidates;
}

function resolveHoroshopUrl(value) {
  try {
    return getSafeSupplierUrl(
      new URL(
        decodeSupplierHtml(value),
        "https://horoshop.ua"
      ).toString()
    );
  } catch {
    return "";
  }
}

function extractHoroshopSupplierCandidates(
  html,
  query
) {
  const candidates = [];

  const itemPattern =
    /<div[^>]+class=["'][^"']*\bsuppliers__item-title\b[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*\bsuppliers__item-title\b|<div[^>]+class=["'][^"']*\bsuppliers__pagination\b|$)/gi;

  for (
    const itemMatch
    of String(html || "").matchAll(
      itemPattern
    )
  ) {
    const block = itemMatch[1];

    const titleMatch = block.match(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i
    );

    const link = resolveHoroshopUrl(
      titleMatch?.[1]
    );

    const supplierName =
      cleanSupplierText(
        decodeSupplierHtml(
          titleMatch?.[2]
        ),
        140
      );

    if (
      !link ||
      !supplierName ||
      !link.includes(
        "horoshop.ua/ua/suppliers/"
      )
    ) {
      continue;
    }

    const tags = uniqueSupplierValues(
      [...block.matchAll(
        /<li[^>]*>([\s\S]*?)<\/li>/gi
      )].map(match =>
        cleanSupplierText(
          decodeSupplierHtml(match[1]),
          100
        )
      ),
      30
    );

    const tagText = tags.join(". ");

    candidates.push({
      title:
        `${supplierName} — ${tagText || query}`,
      snippet:
        `${tagText}. Перевірений каталог постачальників Хорошоп.`,
      link,
      supplierName,
      query,
      source: "Хорошоп",
      ukraineVerified: true
    });

    if (candidates.length >= 10) {
      break;
    }
  }

  return candidates;
}

function extractHoroshopExternalWebsite(html) {
  const links = [];

  for (
    const match
    of String(html || "").matchAll(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  ) {
    const link = resolveHoroshopUrl(
      match[1]
    );

    const hostname =
      getSupplierHostname(link)
        .replace(/^www\./, "");

    if (
      !link ||
      !hostname ||
      HOROSHOP_EXTERNAL_NOISE_HOSTS.some(
        noiseHost =>
          hostname === noiseHost ||
          hostname.endsWith(
            `.${noiseHost}`
          )
      )
    ) {
      continue;
    }

    const anchorText =
      cleanSupplierText(
        decodeSupplierHtml(match[2]),
        180
      )
        .toLocaleLowerCase("uk-UA")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");

    const exactDomainLabel =
      anchorText === hostname ||
      anchorText.includes(hostname);

    links.push({
      link,
      exactDomainLabel
    });
  }

  return (
    links.find(item =>
      item.exactDomainLabel
    )?.link ||
    links[0]?.link ||
    ""
  );
}

async function loadHoroshopSupplierCandidate(
  candidate
) {
  try {
    const response = await fetch(
      candidate.link,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml",
          "Accept-Language":
            "uk-UA,uk;q=0.9,en;q=0.6",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/124 Safari/537.36"
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      return candidate;
    }

    const html = await response.text();

    const pageText = cleanSupplierText(
      decodeSupplierHtml(html),
      30000
    );

    if (
      !pageText
        .toLocaleLowerCase("uk-UA")
        .replace(/\s*:\s*/g, " ")
        .includes(
          "країна співпраці україна"
        )
    ) {
      return candidate;
    }

    const descriptionMatch =
      pageText.match(
        /Країна співпраці\s*:?\s*Україна\s*([\s\S]*?)(?=Відгуки(?:\s+\d+)?|Новий відгук|Бажаєте змінити|Хочете сайт)/i
      );

    const supplierDescription =
      cleanSupplierText(
        descriptionMatch?.[1],
        1000
      );

    return {
      ...candidate,
      snippet: cleanSupplierText(
        `${candidate.snippet} ${supplierDescription}`,
        1400
      ),
      supplierLink:
        extractHoroshopExternalWebsite(
          html
        ) || candidate.link,
      ukraineVerified: true
    };
  } catch {
    return candidate;
  }
}

async function searchHoroshopSuppliers(
  searchContext
) {
  const directoryCategory =
    inferHoroshopDirectoryCategory(
      `${searchContext.productName} ${searchContext.searchTerms.join(" ")}`
    );

  const filteredCategory =
    directoryCategory.replace(
      /-(?:wholesale|dropshipping)$/,
      ""
    );

  const url =
    "https://horoshop.ua/ua/suppliers/" +
    `${filteredCategory}/filter/` +
    "supplier_country=5/";

  const response = await fetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "uk-UA,uk;q=0.9,en;q=0.6",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(
      `HOROSHOP_${response.status}`
    );
  }

  const candidates =
    extractHoroshopSupplierCandidates(
      await response.text(),
      searchContext.productName
    );

  const enrichedCandidates = [];

  for (
    let index = 0;
    index < candidates.length;
    index += 4
  ) {
    const batch = candidates.slice(
      index,
      index + 4
    );

    const batchResults =
      await Promise.all(
        batch.map(
          loadHoroshopSupplierCandidate
        )
      );

    enrichedCandidates.push(
      ...batchResults.filter(Boolean)
    );
  }

  return enrichedCandidates;
}


async function runSupplierTasks(
  tasks,
  concurrency = 3
) {
  const results = [];

  for (
    let index = 0;
    index < tasks.length;
    index += concurrency
  ) {
    const batch = tasks.slice(
      index,
      index + concurrency
    );

    const batchResults =
      await Promise.allSettled(
        batch.map(task => task())
      );

    results.push(...batchResults);
  }

  return results;
}

function calculateSupplierMatch(
  candidate,
  searchContext
) {
  const directoryCategory =
    inferHoroshopDirectoryCategory(
      `${searchContext.productName} ${searchContext.searchTerms.join(" ")}`
    );

  const expectedTokens = [
    ...getSupplierTokens(
      searchContext.productName
    ),
    ...searchContext.searchTerms.flatMap(
      getSupplierTokens
    ),
    ...getSupplierTokens(
      HOROSHOP_CATEGORY_LABELS[
        directoryCategory
      ]
    )
  ];

  const uniqueExpectedTokens = [
    ...new Set(expectedTokens)
  ];

  const candidateTokens = new Set(
    getSupplierTokens(
      `${candidate.title} ${candidate.snippet}`
    )
  );

  if (!uniqueExpectedTokens.length) {
    return 0;
  }

  const matchedTokens =
    uniqueExpectedTokens.filter(token =>
      candidateTokens.has(token) ||
      [...candidateTokens].some(
        candidateToken =>
          token.length >= 5 &&
          candidateToken.length >= 5 &&
          (
            candidateToken.startsWith(
              token.slice(0, 5)
            ) ||
            token.startsWith(
              candidateToken.slice(0, 5)
            )
          )
      )
    );

  return Math.min(
    1,
    matchedTokens.length /
      Math.min(
        uniqueExpectedTokens.length,
        6
      )
  );
}

function classifySupplierCandidate(
  candidate
) {
  const evidenceText =
    normalizeSupplierText(
      `${candidate.title} ${candidate.snippet}`
    );

  for (
    const rule
    of SUPPLIER_ROLE_RULES
  ) {
    const matchedMarkers =
      rule.markers.filter(marker =>
        evidenceText.includes(
          normalizeSupplierText(marker)
        )
      );

    if (matchedMarkers.length) {
      return {
        role: rule.role,
        rolePriority: rule.priority,
        evidence:
          matchedMarkers.slice(0, 3)
      };
    }
  }

  const hostname =
    getSupplierHostname(
      candidate.link
    );

  return {
    role: MARKETPLACE_HOSTS.has(hostname)
      ? "Продавець на маркетплейсі"
      : "Продавець — потребує перевірки",
    rolePriority: 1,
    evidence: []
  };
}

function getSupplierDisplayName(
  candidate
) {
  if (candidate.supplierName) {
    return candidate.supplierName;
  }

  const titleParts =
    cleanSupplierText(
      candidate.title,
      180
    )
      .split(/\s+[|—–-]\s+/)
      .map(part => part.trim())
      .filter(Boolean);

  if (titleParts.length > 1) {
    return titleParts[
      titleParts.length - 1
    ].slice(0, 140);
  }

  const hostname =
    getSupplierHostname(
      candidate.link
    )
      .replace(/^www\./, "");

  return (
    hostname ||
    "Український продавець"
  );
}

function normalizeSupplierCandidates(
  candidates,
  searchContext
) {
  const suppliersByKey = new Map();

  for (const candidate of candidates) {
    const link = getSafeSupplierUrl(
      candidate.supplierLink ||
      candidate.link
    );

    if (
      !link ||
      (
        !candidate.ukraineVerified &&
        !isUkrainianSupplierUrl(link)
      )
    ) {
      continue;
    }

    const productMatch =
      calculateSupplierMatch(
        candidate,
        searchContext
      );

    if (productMatch < 0.16) {
      continue;
    }

    const classification =
      classifySupplierCandidate(
        candidate
      );

    const name =
      getSupplierDisplayName(
        candidate
      );

    const hostname =
      getSupplierHostname(link);

    const normalizedName =
      normalizeSupplierText(name);

    const key =
      normalizedName || hostname;

    const supplier = {
      name,
      role: classification.role,
      verification:
        candidate.source === "Хорошоп"
          ? "Перевірений у каталозі Хорошоп; точний асортимент треба уточнити"
          : classification.rolePriority >= 2 &&
              productMatch >= 0.34
            ? "Є ознаки оптового постачання"
            : "Потребує перевірки умов співпраці",
      evidence:
        classification.evidence,
      matchedProduct:
        cleanSupplierText(
          candidate.title,
          220
        ),
      description:
        cleanSupplierText(
          candidate.snippet,
          380
        ),
      source: candidate.source,
      website: hostname,
      link,
      productMatch:
        Math.round(
          productMatch * 100
        ),
      rolePriority:
        classification.rolePriority
    };

    const previous =
      suppliersByKey.get(key);

    if (
      !previous ||
      supplier.rolePriority >
        previous.rolePriority ||
      (
        supplier.rolePriority ===
          previous.rolePriority &&
        supplier.productMatch >
          previous.productMatch
      )
    ) {
      suppliersByKey.set(
        key,
        supplier
      );
    }
  }

  return [...suppliersByKey.values()]
    .sort((first, second) =>
      second.rolePriority -
        first.rolePriority ||
      second.productMatch -
        first.productMatch ||
      first.name.localeCompare(
        second.name,
        "uk"
      )
    )
    .slice(0, 15)
    .map(
      ({
        rolePriority,
        ...supplier
      }) => supplier
    );
}

export async function searchUkraineSuppliers(
  request = {}
) {
  const productTitle =
    cleanSupplierText(
      request.productTitle,
      240
    );

  if (!productTitle) {
    throw new Error(
      "SUPPLIER_PRODUCT_REQUIRED"
    );
  }

  const description =
    cleanSupplierText(
      request.description,
      500
    );

  const categoryLabel =
    cleanSupplierText(
      request.categoryLabel,
      140
    );

  const cacheKey =
    normalizeSupplierText(
      `${productTitle}|${description}|${categoryLabel}`
    );

  const cached =
    supplierSearchCache.get(
      cacheKey
    );

  if (
    cached &&
    Date.now() -
      cached.savedAt <
        SUPPLIER_CACHE_TTL_MS
  ) {
    return {
      ...cached.result,
      cached: true
    };
  }

  const searchContext =
    await prepareSupplierSearchContext({
      productTitle,
      description,
      categoryLabel
    });

  const webQueries =
    buildSupplierQueries(
      searchContext.searchTerms
    );

  const tasks = [
    () =>
      searchHoroshopSuppliers(
        searchContext
      ),
    ...webQueries.map(query =>
      () =>
        searchDuckDuckGo(query)
    ),
    ...searchContext.searchTerms
      .slice(0, 2)
      .map(term =>
        () =>
          searchBigOptSuppliers(term)
      ),
    ...searchContext.searchTerms
      .slice(0, 3)
      .map(term =>
        () =>
          searchPromSuppliers(term)
      )
  ];

  const taskResults =
    await runSupplierTasks(
      tasks,
      3
    );

  const candidates = [];
  const sourceErrors = [];

  taskResults.forEach(result => {
    if (
      result.status ===
        "fulfilled"
    ) {
      candidates.push(
        ...result.value
      );

      return;
    }

    sourceErrors.push(
      cleanSupplierText(
        result.reason?.message ||
          result.reason,
        120
      )
    );
  });

  const suppliers =
    normalizeSupplierCandidates(
      candidates,
      searchContext
    );

  const result = {
    checkedAt:
      new Date().toISOString(),
    cached: false,
    country: "Україна",
    product: {
      originalTitle:
        productTitle,
      searchName:
        searchContext.productName,
      searchTerms:
        searchContext.searchTerms
    },
    suppliers,
    summary: suppliers.length
      ? `Знайдено кандидатів: ${suppliers.length}. Дані про роль компанії визначені лише за відкритими ознаками на сторінках.`
      : "В українській відкритій видачі постачальників за цим товаром поки не знайдено.",
    partial:
      sourceErrors.length > 0,
    sourceErrors:
      sourceErrors.slice(0, 5)
  };

  supplierSearchCache.set(
    cacheKey,
    {
      savedAt: Date.now(),
      result
    }
  );

  return result;
}
