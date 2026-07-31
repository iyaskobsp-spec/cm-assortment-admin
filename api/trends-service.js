const ALLOWED_CATEGORIES = new Set([
  "home-kitchen",
  "storage-organization",
  "decor",
  "household",
  "beauty-care",
  "kids",
  "toys",
  "stationery",
  "accessories",
  "pets",
  "seasonal",
  "gifts",
  "electronics-accessories",
  "other"
]);

const ALLOWED_SIGNAL_TYPES = new Set([
  "all",
  "new",
  "trends",
  "popular"
]);

const ALLOWED_MARKETS = new Set([
  "europe-usa",
  "world",
  "europe",
  "usa",
  "uk",
  "germany",
  "poland",
  "france",
  "italy",
  "spain"
]);

const AMAZON_UK_CATEGORY_PATHS = {
  "home-kitchen": "kitchen",
  "storage-organization": "kitchen",
  "decor": "kitchen",
  "household": "kitchen",
  "beauty-care": "beauty",
  "kids": "baby",
  "toys": "kids",
  "stationery": "officeproduct",
  "accessories": "fashion",
  "pets": "pet-supplies",
  "seasonal": "kitchen",
  "gifts": "kitchen",
  "electronics-accessories": "electronics",
  "other": ""
};

const AMAZON_UK_SUPPORTED_MARKETS = new Set([
  "europe-usa",
  "world",
  "europe",
  "uk"
]);

function cleanTrendText(value, maxLength = 300) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function decodeHtmlEntities(value) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#039;": "'",
    "&#39;": "'",
    "&nbsp;": " "
  };

  return String(value || "").replace(
    /&(amp|lt|gt|quot|#039|#39|nbsp);/gi,
    entity =>
      entities[entity.toLowerCase()] || entity
  );
}

function stripHtml(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function buildAbsoluteAmazonUrl(value) {
  try {
    return new URL(
      decodeHtmlEntities(value),
      "https://www.amazon.co.uk"
    ).toString();
  } catch {
    return null;
  }
}

function buildAbsoluteImageUrl(value) {
  const decodedValue = decodeHtmlEntities(
    String(value || "").trim()
  );

  if (!decodedValue) {
    return null;
  }

  try {
    const imageUrl = new URL(
      decodedValue,
      "https://www.amazon.co.uk"
    );

    if (
      imageUrl.protocol !== "https:" &&
      imageUrl.protocol !== "http:"
    ) {
      return null;
    }

    return imageUrl.toString();
  } catch {
    return null;
  }
}

function extractAmazonImageUrl(linkContent) {
  const imageTagMatch = String(
    linkContent || ""
  ).match(/<img\b[^>]*>/i);

  if (!imageTagMatch) {
    return null;
  }

  const imageTag = imageTagMatch[0];

  const sourceMatch =
    imageTag.match(
      /\bdata-a-dynamic-image=["']([^"']+)["']/i
    ) ||
    imageTag.match(
      /\bdata-src=["']([^"']+)["']/i
    ) ||
    imageTag.match(
      /\bsrc=["']([^"']+)["']/i
    );

  if (!sourceMatch?.[1]) {
    return null;
  }

  if (
    sourceMatch[0]
      .toLocaleLowerCase("en-US")
      .startsWith("data-a-dynamic-image")
  ) {
    try {
      const dynamicImages = JSON.parse(
        decodeHtmlEntities(sourceMatch[1])
      );

      const firstImageUrl =
        Object.keys(dynamicImages)[0];

      return buildAbsoluteImageUrl(
        firstImageUrl
      );
    } catch {
      return null;
    }
  }

  return buildAbsoluteImageUrl(
    sourceMatch[1]
  );
}

function normalizeFilterWords(value) {
  return cleanTrendText(value, 300)
    .toLocaleLowerCase("uk-UA")
    .split(/[,;]+/)
    .map(word =>
      word
        .replace(/^без\s+/u, "")
        .trim()
    )
    .filter(word => word.length >= 2);
}

function matchesSearchDetails(title, searchDetails) {
  const details = normalizeFilterWords(searchDetails);

  if (!details.length) {
    return true;
  }

  const normalizedTitle =
    title.toLocaleLowerCase("uk-UA");

  return details.some(detail =>
    normalizedTitle.includes(detail)
  );
}

function matchesExclusions(title, exclusions) {
  const excludedWords =
    normalizeFilterWords(exclusions);

  if (!excludedWords.length) {
    return false;
  }

  const normalizedTitle =
    title.toLocaleLowerCase("uk-UA");

  return excludedWords.some(word =>
    normalizedTitle.includes(word)
  );
}

function extractAmazonUkProducts(html) {
  const products = [];
  const seenAsins = new Set();

  const productLinkPattern =
    /<a\b[^>]*href=["']([^"']*\/dp\/([A-Z0-9]{10})[^"']*)["'][^>]*>([\s\S]{0,3500}?)<\/a>/gi;

  for (const match of html.matchAll(productLinkPattern)) {
    const relativeLink = match[1];
    const asin = match[2];
    const linkContent = match[3];

    if (!asin || seenAsins.has(asin)) {
      continue;
    }

    const imageAltMatch = linkContent.match(
      /<img\b[^>]*alt=["']([^"']+)["'][^>]*>/i
    );

    const titleMatch = linkContent.match(
      /<span\b[^>]*>([\s\S]*?)<\/span>/i
    );

    const title = cleanTrendText(
      imageAltMatch?.[1] ||
      stripHtml(titleMatch?.[1]) ||
      stripHtml(linkContent),
      300
    );

    if (
      !title ||
      title.length < 8 ||
      title.toLowerCase() === "amazon"
    ) {
      continue;
    }

    const link =
      buildAbsoluteAmazonUrl(relativeLink);

    if (!link) {
      continue;
    }

    const imageUrl =
      extractAmazonImageUrl(linkContent);

    seenAsins.add(asin);

    products.push({
      asin,
      title,
      link,
      imageUrl
    });
  }

  return products.slice(0, 30);
}

function getAmazonUkUrl(category) {
  const categoryPath =
    AMAZON_UK_CATEGORY_PATHS[category] || "";

  if (!categoryPath) {
    return "https://www.amazon.co.uk/gp/new-releases";
  }

  return (
    "https://www.amazon.co.uk/gp/new-releases/" +
    encodeURIComponent(categoryPath)
  );
}

async function loadAmazonUkNewReleases({
  category,
  searchDetails,
  exclusions
}) {
  const sourceUrl = getAmazonUkUrl(category);

  const response = await fetch(sourceUrl, {
    method: "GET",
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "en-GB,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    const error = new Error(
      `AMAZON_UK_REQUEST_FAILED_${response.status}`
    );

    error.statusCode = 502;
    throw error;
  }

  const html = await response.text();

  const extractedProducts =
    extractAmazonUkProducts(html);

  const filteredProducts =
    extractedProducts
      .filter(product =>
        matchesSearchDetails(
          product.title,
          searchDetails
        )
      )
      .filter(product =>
        !matchesExclusions(
          product.title,
          exclusions
        )
      )
      .slice(0, 12);

  return {
    source: "Amazon UK",
    sourceType: "new-releases",
    sourceUrl,
    status: filteredProducts.length
      ? "ok"
      : "no_results",
    totalExtracted: extractedProducts.length,
    products: filteredProducts
  };
}

function buildIdeasFromAmazonUk(sourceResult) {
  return sourceResult.products.map(
    (product, index) => ({
      id: `amazon-uk-${product.asin}`,
      title: product.title,
      imageUrl: product.imageUrl || null,
      description:
        "Товар потрапив до відкритого рейтингу нових релізів Amazon UK.",
      signal:
        index < 5
          ? "Сильний сигнал новинки"
          : "Новинка в рейтингу",
      geography:
        "Велика Британія",
      sources: [
        "Amazon UK Hot New Releases"
      ],
      links: [
        {
          label: "Відкрити на Amazon UK",
          url: product.link
        }
      ],
      sourcePosition: index + 1
    })
  );
}

export async function searchProductTrends(
  requestBody
) {
  const category = cleanTrendText(
    requestBody.category,
    80
  );

  const categoryLabel = cleanTrendText(
    requestBody.categoryLabel,
    120
  );

  const signalType = cleanTrendText(
    requestBody.signalType,
    40
  ) || "all";

  const market = cleanTrendText(
    requestBody.market,
    40
  ) || "europe-usa";

  const searchDetails = cleanTrendText(
    requestBody.searchDetails,
    300
  );

  const exclusions = cleanTrendText(
    requestBody.exclusions,
    300
  );

  if (!category) {
    const error = new Error(
      "TREND_CATEGORY_REQUIRED"
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    const error = new Error(
      "TREND_CATEGORY_INVALID"
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_SIGNAL_TYPES.has(signalType)) {
    const error = new Error(
      "TREND_SIGNAL_TYPE_INVALID"
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_MARKETS.has(market)) {
    const error = new Error(
      "TREND_MARKET_INVALID"
    );

    error.statusCode = 400;
    throw error;
  }

  const sources = [];
  let ideas = [];

  if (
    AMAZON_UK_SUPPORTED_MARKETS.has(market) &&
    ["all", "new"].includes(signalType)
  ) {
    try {
      const amazonUkResult =
        await loadAmazonUkNewReleases({
          category,
          searchDetails,
          exclusions
        });

      sources.push(amazonUkResult);

      ideas = ideas.concat(
        buildIdeasFromAmazonUk(
          amazonUkResult
        )
      );
    } catch (error) {
      console.error(
        "[Amazon UK trends]",
        error
      );

      sources.push({
        source: "Amazon UK",
        sourceType: "new-releases",
        status: "error",
        message:
          "Amazon UK тимчасово не повернув рейтинг новинок.",
        products: []
      });
    }
  }

  let summary = "";

  if (ideas.length) {
    summary =
      `Знайдено товарних ідей: ${ideas.length}. ` +
      "Поки результати базуються на рейтингу нових релізів Amazon UK. " +
      "Наступними джерелами додамо інші країни Amazon і соціальні сигнали.";
  } else if (
    !AMAZON_UK_SUPPORTED_MARKETS.has(market)
  ) {
    summary =
      "Для вибраного ринку джерело Amazon UK не використовується. " +
      "Потрібно підключити окреме джерело для цієї країни.";
  } else if (
    !["all", "new"].includes(signalType)
  ) {
    summary =
      "Amazon Hot New Releases працює для новинок. " +
      "Для трендів і популярного окремо підключимо Movers & Shakers та Best Sellers.";
  } else {
    summary =
      "Amazon UK не повернув товарів за вибраними параметрами. " +
      "Спробуй прибрати уточнення або виключення.";
  }

  return {
    checkedAt: new Date().toISOString(),
    request: {
      category,
      categoryLabel,
      signalType,
      market,
      searchDetails,
      exclusions
    },
    ideas,
    sources,
    summary
  };
}
