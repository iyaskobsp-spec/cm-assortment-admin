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
  "china"
]);

const AMAZON_CATEGORY_PATHS = {
  "home-kitchen": {
    uk: "kitchen",
    germany: "kitchen",
    france: "kitchen",
    italy: "kitchen",
    poland: "kitchen",
    usa: "kitchen"
  },

  "storage-organization": {
    uk: "diy",
    germany: "diy",
    france: "hi",
    italy: "kitchen",
    poland: "kitchen",
    usa: "kitchen"
  },

  "decor": {
    uk: "lighting",
    germany: "lighting",
    france: "lighting",
    italy: "lighting",
    poland: "kitchen",
    usa: "home-garden"
  },

  "household": {
    uk: "grocery",
    germany: "grocery",
    france: "grocery",
    italy: "kitchen",
    poland: "kitchen",
    usa: "hpc"
  },

  "beauty-care": {
    uk: "beauty",
    germany: "beauty",
    france: "beauty",
    italy: "beauty",
    poland: "beauty",
    usa: "beauty"
  },

  "kids": {
    uk: "baby",
    germany: "baby",
    france: "baby",
    italy: "baby",
    poland: "baby",
    usa: "baby-products"
  },

  "toys": {
    uk: "kids",
    germany: "kids",
    france: "toys",
    italy: "toys",
    poland: "toys",
    usa: "toys-and-games"
  },

  "stationery": {
    uk: "officeproduct",
    germany: "officeproduct",
    france: "officeproduct",
    italy: "office-products",
    poland: "office-products",
    usa: "office-products"
  },

  "accessories": {
    uk: "fashion",
    germany: "fashion",
    france: "fashion",
    italy: "fashion",
    poland: "fashion",
    usa: "fashion"
  },

  "pets": {
    uk: "pet-supplies",
    germany: "pet-supplies",
    france: "pet-supplies",
    italy: "pet-supplies",
    poland: "pet-supplies",
    usa: "pet-supplies"
  },

  "seasonal": {
    uk: "garden",
    germany: "garden",
    france: "garden",
    italy: "garden",
    poland: "garden",
    usa: "lawngarden"
  },

  "gifts": {
    uk: "handmade",
    germany: "handmade",
    france: "handmade",
    italy: "handmade",
    poland: "kitchen",
    usa: "handmade"
  },

  "electronics-accessories": {
    uk: "electronics",
    germany: "electronics",
    france: "electronics",
    italy: "electronics",
    poland: "electronics",
    usa: "electronics"
  },

  "other": {
    uk: "",
    germany: "",
    france: "",
    italy: "",
    poland: "",
    usa: ""
  }
};

const AMAZON_CATEGORY_SECTION_WORDS = {
  "home-kitchen": [
    "home & kitchen",
    "home and kitchen",
    "küche, haushalt & wohnen",
    "küche haushalt wohnen"
  ],

  "storage-organization": [
    "home & kitchen",
    "home and kitchen",
    "storage",
    "organisation",
    "organization",
    "küche, haushalt & wohnen",
    "aufbewahrung"
  ],

  "decor": [
    "home & kitchen",
    "home and kitchen",
    "home décor",
    "home decor",
    "wohnaccessoires",
    "dekoration",
    "küche, haushalt & wohnen"
  ],

  "household": [
    "home & kitchen",
    "home and kitchen",
    "household",
    "cleaning",
    "haushalt",
    "küche, haushalt & wohnen"
  ],

  "beauty-care": [
    "beauty",
    "health & personal care",
    "health and personal care",
    "beauty & personal care",
    "beauty and personal care",
    "drogerie & körperpflege",
    "beauty"
  ],

  "kids": [
    "baby products",
    "baby",
    "babyartikel"
  ],

  "toys": [
    "toys & games",
    "toys and games",
    "spielzeug"
  ],

  "stationery": [
    "stationery & office supplies",
    "stationery and office supplies",
    "office products",
    "bürobedarf & schreibwaren",
    "bürobedarf"
  ],

  "accessories": [
    "fashion",
    "clothing, shoes & jewellery",
    "clothing shoes and jewellery",
    "fashion"
  ],

  "pets": [
    "pet supplies",
    "pet products",
    "haustier"
  ],

  "seasonal": [
    "home & kitchen",
    "home and kitchen",
    "garden",
    "garten",
    "küche, haushalt & wohnen"
  ],

  "gifts": [
    "home & kitchen",
    "home and kitchen",
    "toys & games",
    "toys and games",
    "fashion",
    "küche, haushalt & wohnen",
    "spielzeug"
  ],

  "electronics-accessories": [
    "electronics & photo",
    "electronics and photo",
    "computers & accessories",
    "computers and accessories",
    "elektronik & foto",
    "computer & zubehör"
  ],

  "other": []
};

const AMAZON_MARKET_CONFIG = {
  uk: {
    code: "uk",
    domain: "https://www.amazon.co.uk",
    sourceName: "Amazon UK",
    geography: "Велика Британія",
    language: "en-GB,en;q=0.9",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "europe",
      "uk"
    ])
  },

  germany: {
    code: "germany",
    domain: "https://www.amazon.de",
    sourceName: "Amazon Germany",
    geography: "Німеччина",
    language: "de-DE,de;q=0.9,en;q=0.7",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "europe",
      "germany"
    ])
  },

  france: {
    code: "france",
    domain: "https://www.amazon.fr",
    sourceName: "Amazon France",
    geography: "Франція",
    language: "fr-FR,fr;q=0.9,en;q=0.7",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "europe",
      "france"
    ])
  },

  italy: {
    code: "italy",
    domain: "https://www.amazon.it",
    sourceName: "Amazon Italy",
    geography: "Італія",
    language: "it-IT,it;q=0.9,en;q=0.7",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "europe",
      "italy"
    ])
  },

  poland: {
    code: "poland",
    domain: "https://www.amazon.pl",
    sourceName: "Amazon Poland",
    geography: "Польща",
    language: "pl-PL,pl;q=0.9,en;q=0.7",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "europe",
      "poland"
    ])
  },

  usa: {
    code: "usa",
    domain: "https://www.amazon.com",
    sourceName: "Amazon USA",
    geography: "США",
    language: "en-US,en;q=0.9",
    supportedMarkets: new Set([
      "europe-usa",
      "world",
      "usa"
    ])
  }  
};

const AMAZON_SIGNAL_PATHS = {
  new: {
    path: "new-releases",
    rankingName: "Hot New Releases",
    description:
      "Товар потрапив до рейтингу нових релізів Amazon."
  },

  trends: {
    path: "movers-and-shakers",
    rankingName: "Movers & Shakers",
    description:
      "Товар потрапив до рейтингу позицій, що швидко зростають на Amazon."
  },

  popular: {
    path: "bestsellers",
    rankingName: "Best Sellers",
    description:
      "Товар потрапив до рейтингу найбільш популярних позицій Amazon."
  }
};

const CHINA_CATEGORY_QUERIES = {
  "home-kitchen": [
    "home kitchen new products",
    "kitchen gadgets",
    "household innovations"
  ],

  "storage-organization": [
    "home storage organizer",
    "space saving organizer",
    "storage organization"
  ],

  "decor": [
    "home decor",
    "modern home decoration",
    "creative interior decor"
  ],

  "household": [
    "household products",
    "home cleaning tools",
    "daily use household"
  ],

  "beauty-care": [
    "beauty tools",
    "personal care products",
    "beauty accessories"
  ],

  "kids": [
    "baby products",
    "kids daily products",
    "children accessories"
  ],

  "toys": [
    "new toys",
    "creative toys",
    "educational toys"
  ],

  "stationery": [
    "creative stationery",
    "office supplies",
    "school stationery"
  ],

  "accessories": [
    "fashion accessories",
    "daily accessories",
    "trending accessories"
  ],

  "pets": [
    "pet supplies",
    "pet accessories",
    "smart pet products"
  ],

  "seasonal": [
    "seasonal products",
    "holiday decorations",
    "outdoor seasonal products"
  ],

  "gifts": [
    "creative gifts",
    "unique gift ideas",
    "novelty gifts"
  ],

  "electronics-accessories": [
    "electronic accessories",
    "mobile accessories",
    "smart gadgets"
  ],

  "other": [
    "new innovative products",
    "trending products",
    "creative products"
  ]
};

const CHINA_SOURCE_CONFIG = {
  aliexpress: {
    code: "aliexpress",
    sourceName: "AliExpress",
    geography: "Китай",
    domain: "https://www.aliexpress.com",
    supportedMarkets: new Set([
      "world",
      "china"
    ])
  }
};

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

function buildAbsoluteAmazonUrl(
  value,
  amazonDomain
) {
  try {
    return new URL(
      decodeHtmlEntities(value),
      amazonDomain
    ).toString();
  } catch {
    return null;
  }
}

function buildAbsoluteImageUrl(
  value,
  amazonDomain
) {
  const decodedValue = decodeHtmlEntities(
    String(value || "").trim()
  );

  if (!decodedValue) {
    return null;
  }

  try {
    const imageUrl = new URL(
      decodedValue,
      amazonDomain
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

function extractAmazonImageUrl(
  linkContent,
  amazonDomain
) {
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
        firstImageUrl,
        amazonDomain
      );
    } catch {
      return null;
    }
  }

  return buildAbsoluteImageUrl(
    sourceMatch[1],
    amazonDomain
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

function buildChinaSearchQueries(
  category,
  searchDetails
) {
  const categoryQueries =
    CHINA_CATEGORY_QUERIES[category] ||
    CHINA_CATEGORY_QUERIES.other;

  const details = cleanTrendText(
    searchDetails,
    160
  );

  const queryCandidates =
    categoryQueries.flatMap(baseQuery => {
      if (!details) {
        return [baseQuery];
      }

      return [
        `${baseQuery} ${details}`,
        baseQuery
      ];
    });

  const uniqueQueries = [];
  const seenQueries = new Set();

  for (const query of queryCandidates) {
    const cleanedQuery = cleanTrendText(
      query,
      240
    );

    const queryKey =
      cleanedQuery.toLocaleLowerCase(
        "en-US"
      );

    if (
      !cleanedQuery ||
      seenQueries.has(queryKey)
    ) {
      continue;
    }

    seenQueries.add(queryKey);
    uniqueQueries.push(
      cleanedQuery
    );
  }

  return uniqueQueries.slice(0, 6);
}

function buildAliExpressSearchUrl(
  chinaConfig,
  searchQuery
) {
  const searchUrl = new URL(
    "/wholesale",
    chinaConfig.domain
  );

  searchUrl.searchParams.set(
    "SearchText",
    searchQuery
  );

  return searchUrl.toString();
}

async function loadAliExpressSearchPage({
  chinaConfig,
  searchQuery
}) {
  const sourceUrl =
    buildAliExpressSearchUrl(
      chinaConfig,
      searchQuery
    );

  const response = await fetch(sourceUrl, {
    method: "GET",
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        "en-US,en;q=0.9",
      Referer:
        chinaConfig.domain,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    redirect: "follow",
    signal:
      AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    const error = new Error(
      `ALIEXPRESS_REQUEST_FAILED_${response.status}`
    );

    error.statusCode = 502;
    throw error;
  }

  const html = await response.text();

  return {
    sourceUrl,
    finalUrl:
      response.url || sourceUrl,
    html
  };
}

function matchesAmazonCategorySection(
  sectionTitle,
  category
) {
  const categoryWords =
    AMAZON_CATEGORY_SECTION_WORDS[category] || [];

  if (!categoryWords.length) {
    return true;
  }

  const normalizedSectionTitle =
    cleanTrendText(sectionTitle, 300)
      .toLocaleLowerCase("en-US");

  if (!normalizedSectionTitle) {
    return false;
  }

  return categoryWords.some(word =>
    normalizedSectionTitle.includes(
      word.toLocaleLowerCase("en-US")
    )
  );
}

function extractAmazonProducts(
  html,
  amazonConfig,
  signalType
) {
  const products = [];
  const seenAsins = new Set();

  const htmlText = String(html || "");

  const asinMarkerPattern =
    /\bdata-asin=["']([A-Z0-9]{10})["']/gi;

  const asinMarkers = [
    ...htmlText.matchAll(asinMarkerPattern)
  ];

  const blockedTitleParts = [
    "barclays instalments",
    "amazon barclaycard",
    "apply for a credit card",
    "amazon business",
    "audible",
    "prime membership",
    "sponsored",
    "werbung",
    "anzeige"
  ];

  for (
    let index = 0;
    index < asinMarkers.length;
    index += 1
  ) {
    const marker = asinMarkers[index];
    const asin = marker[1];

    if (!asin || seenAsins.has(asin)) {
      continue;
    }

    const blockStart = marker.index;

    const blockEnd =
      asinMarkers[index + 1]?.index ||
      Math.min(
        blockStart + 18000,
        htmlText.length
      );

    const productBlock = htmlText.slice(
      blockStart,
      blockEnd
    );

    const sectionContextStart =
      Math.max(0, blockStart - 12000);

    const sectionContext =
      htmlText.slice(
        sectionContextStart,
        blockStart
      );

    const sectionHeadingMatches = [
      ...sectionContext.matchAll(
        /<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi
      )
    ];

    const sectionTitle = cleanTrendText(
      stripHtml(
        sectionHeadingMatches.at(-1)?.[1] || ""
      ),
      300
    );

    const hasRankingMarker =
      /\bzg-bdg-text\b/i.test(productBlock) ||
      /\bp13n-sc-uncoverable-faceout\b/i.test(
        productBlock
      ) ||
      /aria-label=["']#?\d+["']/i.test(
        productBlock
      ) ||
      />\s*#\d+\s*</i.test(productBlock);

    const linkMatch = productBlock.match(
      new RegExp(
        `href=["']([^"']*\\/dp\\/${asin}[^"']*)["']`,
        "i"
      )
    );

    const isMoversAndShakersProduct =
      signalType === "trends" &&
      Boolean(linkMatch?.[1]) &&
      /<img\b/i.test(productBlock);

    if (
      !hasRankingMarker &&
      !isMoversAndShakersProduct
    ) {
      continue;
    }

    if (!linkMatch?.[1]) {
      continue;
    }

    const imageTagMatch = productBlock.match(
      /<img\b[^>]*>/i
    );

    const imageTag =
      imageTagMatch?.[0] || "";

    const imageAltMatch = imageTag.match(
      /\balt=["']([^"']+)["']/i
    );

    const titleClassMatch = productBlock.match(
      /<[^>]+\bclass=["'][^"']*(?:p13n-sc-truncate-desktop-type2|_cDEzb_p13n-sc-css-line-clamp)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i
    );

    const fallbackTitleMatch = productBlock.match(
      /<span\b[^>]*>([\s\S]{8,500}?)<\/span>/i
    );

    const title = cleanTrendText(
      imageAltMatch?.[1] ||
      stripHtml(titleClassMatch?.[1]) ||
      stripHtml(fallbackTitleMatch?.[1]),
      300
    );

    if (!title || title.length < 8) {
      continue;
    }

    const normalizedTitle =
      title.toLocaleLowerCase("en-US");

    const isBlockedTitle =
      blockedTitleParts.some(part =>
        normalizedTitle.includes(part)
      );

    if (isBlockedTitle) {
      continue;
    }

    const link =
      buildAbsoluteAmazonUrl(
        linkMatch[1],
        amazonConfig.domain
      );

    if (!link) {
      continue;
    }

    const imageUrl =
      extractAmazonImageUrl(
        productBlock,
        amazonConfig.domain
      );

    const rankMatch =
      productBlock.match(
        /\bzg-bdg-text\b[^>]*>\s*#?(\d+)/i
      ) ||
      productBlock.match(
        /aria-label=["']#?(\d+)["']/i
      ) ||
      productBlock.match(
        />\s*#(\d+)\s*</i
      );

    const sourcePosition =
      Number(rankMatch?.[1]) > 0
        ? Number(rankMatch[1])
        : products.length + 1;

    seenAsins.add(asin);

    products.push({
      asin,
      title,
      link,
      imageUrl,
      sourcePosition,
      sectionTitle
    });
  }

  return products
    .sort(
      (first, second) =>
        first.sourcePosition -
        second.sourcePosition
    )
    .slice(0, 30);
}

function getAmazonRankingUrl(
  amazonConfig,
  category,
  signalType
) {
  const categoryConfig =
    AMAZON_CATEGORY_PATHS[category] || {};

  const categoryPath =
    categoryConfig[amazonConfig.code] || "";

  const signalConfig =
    AMAZON_SIGNAL_PATHS[signalType];

  if (!signalConfig) {
    return null;
  }

  const baseUrl =
    `${amazonConfig.domain}/gp/${signalConfig.path}`;

  if (!categoryPath) {
    return baseUrl;
  }

  return (
    `${baseUrl}/` +
    encodeURIComponent(categoryPath)
  );
}

async function loadAmazonRanking({
  amazonConfig,
  category,
  signalType,
  searchDetails,
  exclusions
}) {
  const signalConfig =
    AMAZON_SIGNAL_PATHS[signalType];

  if (!signalConfig) {
    return {
      source:
        amazonConfig.sourceName,
      sourceType:
        signalType,
      sourceUrl:
        null,
      status:
        "no_results",
      totalExtracted:
        0,
      products:
        []
    };
  }

  const sourceUrl =
    getAmazonRankingUrl(
      amazonConfig,
      category,
      signalType
    );

  const response = await fetch(sourceUrl, {
    method: "GET",
    headers: {
      Accept:
        "text/html,application/xhtml+xml",
      "Accept-Language":
        amazonConfig.language,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    const error = new Error(
      `AMAZON_${amazonConfig.code.toUpperCase()}_REQUEST_FAILED_${response.status}`
    );

    error.statusCode = 502;
    throw error;
  }

  const html = await response.text();

  const extractedProducts =
    extractAmazonProducts(
      html,
      amazonConfig,
      signalType
    );
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
      .slice(0, 12)
      .map((product, index) => ({
        ...product,
        signalType,
        sourceName:
          `${amazonConfig.sourceName} ${signalConfig.rankingName}`,
        description:
          signalConfig.description,
        sourcePosition:
          Number(product.sourcePosition) > 0
            ? Number(product.sourcePosition)
            : index + 1
      }));

  return {
    source:
      amazonConfig.sourceName,
    sourceType:
      signalType,
    sourceUrl,
    status:
      filteredProducts.length
        ? "ok"
        : "no_results",
    totalExtracted:
      extractedProducts.length,
    products:
      filteredProducts
  };
}

async function loadAmazonTrendCandidates({
  amazonConfig,
  category,
  searchDetails,
  exclusions
}) {
  const [
    newReleasesResult,
    bestSellersResult
  ] = await Promise.all([
    loadAmazonRanking({
      amazonConfig,
      category,
      signalType: "new",
      searchDetails,
      exclusions
    }),

    loadAmazonRanking({
      amazonConfig,
      category,
      signalType: "popular",
      searchDetails,
      exclusions
    })
  ]);

  const bestSellersByAsin = new Map(
    bestSellersResult.products.map(product => [
      product.asin,
      product
    ])
  );

  const trendProducts =
    newReleasesResult.products
      .map(newProduct => {
        const popularProduct =
          bestSellersByAsin.get(
            newProduct.asin
          );

        if (!popularProduct) {
          return null;
        }

        const newReleasePosition =
          Number(newProduct.sourcePosition) || 99;

        const bestSellerPosition =
          Number(popularProduct.sourcePosition) || 99;

        return {
          ...newProduct,
          signalType: "trends",

          sourceName:
            `${amazonConfig.sourceName} Hot New Releases + Best Sellers`,

          description:
            "Товар одночасно входить до рейтингу нових релізів і рейтингу популярних товарів Amazon.",

          sourcePosition:
            Math.min(
              newReleasePosition,
              bestSellerPosition
            ),

          newReleasePosition,
          bestSellerPosition,

          trendScore:
            newReleasePosition +
            bestSellerPosition
        };
      })
      .filter(Boolean)
      .sort(
        (first, second) =>
          first.trendScore -
          second.trendScore
      )
      .slice(0, 12);

  return {
    source:
      amazonConfig.sourceName,

    sourceType:
      "trends",

    sourceUrl:
      bestSellersResult.sourceUrl,

    status:
      trendProducts.length
        ? "ok"
        : "no_results",

    totalExtracted:
      newReleasesResult.totalExtracted +
      bestSellersResult.totalExtracted,

    products:
      trendProducts,

    checkedSources: [
      newReleasesResult.sourceUrl,
      bestSellersResult.sourceUrl
    ]
  };
}

function buildIdeasFromAmazon(
  sourceResult,
  amazonConfig
) {
  return sourceResult.products.map(
    product => {
      let signalLabel =
        "Товар у рейтингу Amazon";

      if (product.signalType === "new") {
        signalLabel =
          product.sourcePosition <= 5
            ? "Сильний сигнал новинки"
            : "Новинка в рейтингу";
      }

      if (product.signalType === "trends") {
        signalLabel =
          product.sourcePosition <= 5
            ? "Сильний тренд: новинка-бестселер"
            : "Новинка вже серед бестселерів";
      }

      if (product.signalType === "popular") {
        signalLabel =
          product.sourcePosition <= 5
            ? "Висока популярність"
            : "Популярний товар";
      }

      return {
        id:
          `amazon-${amazonConfig.code}-${product.signalType}-${product.asin}`,
        title:
          product.title,
        imageUrl:
          product.imageUrl || null,
        description:
          product.description ||
          `Товар знайдений у рейтингу ${amazonConfig.sourceName}.`,
        signal:
          signalLabel,
        signalType:
          product.signalType,
        geography:
          amazonConfig.geography,
        sources: [
          product.sourceName ||
          amazonConfig.sourceName
        ],
        links: [
          {
            label:
              `Відкрити на ${amazonConfig.sourceName}`,
            url:
              product.link
          }
        ],
        sourcePosition:
          product.sourcePosition
      };
    }
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

  const requestedSignalTypes =
    signalType === "all"
      ? [
          "new",
          "trends",
          "popular"
        ]
      : [signalType];

  const amazonConfigs =
    Object.values(
      AMAZON_MARKET_CONFIG
    ).filter(amazonConfig =>
      amazonConfig.supportedMarkets.has(
        market
      )
    );

  const chinaConfigs =
    Object.values(
      CHINA_SOURCE_CONFIG
    ).filter(chinaConfig =>
      chinaConfig.supportedMarkets.has(
        market
      )
    );  

  for (
    const amazonConfig
    of amazonConfigs
  ) {
    for (
      const amazonSignalType
      of requestedSignalTypes
    ) {
      try {
        const amazonResult =
          amazonSignalType === "trends"
            ? await loadAmazonTrendCandidates({
                amazonConfig,
                category,
                searchDetails,
                exclusions
              })
            : await loadAmazonRanking({
                amazonConfig,
                category,
                signalType:
                  amazonSignalType,
                searchDetails,
                exclusions
              });
        sources.push(
          amazonResult
        );

        ideas = ideas.concat(
          buildIdeasFromAmazon(
            amazonResult,
            amazonConfig
          )
        );
      } catch (error) {
        console.error(
          `[${amazonConfig.sourceName} ${amazonSignalType}]`,
          error
        );

        sources.push({
          source:
            amazonConfig.sourceName,
          sourceType:
            amazonSignalType,
          status:
            "error",
          message:
            `${amazonConfig.sourceName} тимчасово не повернув вибраний рейтинг.`,
          products:
            []
        });
      }
    }
  }

  for (
    const chinaConfig
    of chinaConfigs
  ) {
    const chinaQueries =
      buildChinaSearchQueries(
        category,
        searchDetails
      );

    const testQuery =
      chinaQueries[0];

    if (!testQuery) {
      continue;
    }

    try {
      const pageResult =
        await loadAliExpressSearchPage({
          chinaConfig,
          searchQuery:
            testQuery
        });

      const normalizedHtml =
        pageResult.html
          .toLocaleLowerCase(
            "en-US"
          );

      const diagnostics = {
        source:
          chinaConfig.sourceName,
        query:
          testQuery,
        sourceUrl:
          pageResult.sourceUrl,
        finalUrl:
          pageResult.finalUrl,
        htmlLength:
          pageResult.html.length,
        hasProductLinks:
          normalizedHtml.includes(
            "/item/"
          ),
        hasProductId:
          normalizedHtml.includes(
            "productid"
          ),
        hasCaptcha:
          normalizedHtml.includes(
            "captcha"
          ),
        hasRobotCheck:
          normalizedHtml.includes(
            "robot"
          ) ||
          normalizedHtml.includes(
            "verify"
          ),
        hasSearchText:
          normalizedHtml.includes(
            testQuery.toLocaleLowerCase(
              "en-US"
            )
          )
      };

      console.log(
        "[AliExpress diagnostics]",
        diagnostics
      );

      sources.push({
        source:
          chinaConfig.sourceName,
        sourceType:
          "diagnostic",
        sourceUrl:
          pageResult.sourceUrl,
        finalUrl:
          pageResult.finalUrl,
        status:
          "diagnostic_ok",
        query:
          testQuery,
        diagnostics,
        products:
          []
      });
    } catch (error) {
      console.error(
        `[${chinaConfig.sourceName} diagnostics]`,
        error
      );

      sources.push({
        source:
          chinaConfig.sourceName,
        sourceType:
          "diagnostic",
        status:
          "error",
        message:
          error.message ||
          `${chinaConfig.sourceName} не відповів.`,
        products:
          []
      });
    }
  }

  const uniqueIdeas = [];
  const seenIdeaIds = new Set();

  for (const idea of ideas) {
    const ideaKey =
      idea.id ||
      `${idea.title}|${idea.geography}`;

    if (seenIdeaIds.has(ideaKey)) {
      continue;
    }

    seenIdeaIds.add(ideaKey);
    uniqueIdeas.push(idea);
  }

  ideas = uniqueIdeas.slice(0, 30);

  let summary = "";

  if (ideas.length) {
    const successfulSources =
      sources.filter(
        source =>
          source.status === "ok"
      );

    const successfulMarkets = [
      ...new Set(
        successfulSources.map(
          source => source.source
        )
      )
    ];

    summary =
      `Знайдено товарних ідей: ${ideas.length}. ` +
      `Успішно перевірено рейтингів Amazon: ${successfulSources.length}. ` +
      (
        successfulMarkets.length
          ? `Джерела: ${successfulMarkets.join(", ")}. `
          : ""
      ) +
      "Результати можуть включати новинки, товари, що набирають позиції, та популярні товари.";
  } else if (!amazonConfigs.length) {
    summary =
      "Для вибраного ринку ще не підключено відповідний сайт Amazon.";
  } else {
    summary =
      "Amazon не повернув товарів за вибраними параметрами. " +
      "Спробуй іншу категорію або прибери уточнення та виключення.";
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
