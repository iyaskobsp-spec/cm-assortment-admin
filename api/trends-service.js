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

const CHINA_CATEGORY_CONFIG = {
  "home-kitchen": {
    queries: [
      "home kitchen products",
      "kitchen household products"
    ],
    include: [
      "kitchen",
      "cooking",
      "cookware",
      "utensil",
      "pan",
      "pot",
      "dish",
      "sink",
      "mixer",
      "blender",
      "storage",
      "organizer",
      "household"
    ],
    exclude: [
      "industrial",
      "commercial sink",
      "restaurant equipment",
      "garage",
      "campervan bracket",
      "motorcycle",
      "automotive"
    ]
  },

  "storage-organization": {
    queries: [
      "home storage organizer",
      "space saving organization"
    ],
    include: [
      "storage",
      "organizer",
      "organisation",
      "organization",
      "holder",
      "rack",
      "shelf",
      "drawer",
      "basket",
      "container",
      "box",
      "cabinet",
      "space saving"
    ],
    exclude: [
      "car storage",
      "motorcycle",
      "server rack",
      "industrial",
      "warehouse"
    ]
  },

  "decor": {
    queries: [
      "modern home decor",
      "creative interior decoration"
    ],
    include: [
      "decor",
      "decoration",
      "ornament",
      "vase",
      "candle holder",
      "figurine",
      "wall art",
      "poster",
      "mirror",
      "lamp",
      "lighting",
      "pillow",
      "artificial flower",
      "interior"
    ],
    exclude: [
      "car decor",
      "motorcycle",
      "industrial",
      "machine",
      "spare part",
      "replacement part",
      "sink",
      "commercial"
    ]
  },

  "household": {
    queries: [
      "household daily use products",
      "home cleaning tools"
    ],
    include: [
      "household",
      "cleaning",
      "cleaner",
      "brush",
      "mop",
      "sponge",
      "cloth",
      "laundry",
      "trash",
      "waste",
      "bathroom",
      "home care",
      "daily use"
    ],
    exclude: [
      "industrial",
      "commercial machine",
      "car cleaning",
      "automotive",
      "replacement motor"
    ]
  },

  "beauty-care": {
    queries: [
      "beauty personal care tools",
      "beauty accessories"
    ],
    include: [
      "beauty",
      "cosmetic",
      "makeup",
      "skin care",
      "skincare",
      "hair",
      "nail",
      "manicure",
      "massage",
      "facial",
      "brush",
      "mirror",
      "personal care"
    ],
    exclude: [
      "car",
      "automotive",
      "industrial",
      "medical surgery",
      "tattoo machine"
    ]
  },

  "kids": {
    queries: [
      "baby kids daily products",
      "children accessories"
    ],
    include: [
      "baby",
      "kids",
      "child",
      "children",
      "toddler",
      "infant",
      "feeding",
      "stroller",
      "nursery",
      "school",
      "learning"
    ],
    exclude: [
      "adult",
      "sexy",
      "car part",
      "motorcycle",
      "industrial"
    ]
  },

  "toys": {
    queries: [
      "creative educational toys",
      "kids interactive toys"
    ],
    include: [
      "toy",
      "game",
      "puzzle",
      "doll",
      "figure",
      "blocks",
      "building",
      "educational",
      "learning",
      "interactive",
      "kids"
    ],
    exclude: [
      "adult",
      "weapon",
      "knife",
      "car part",
      "industrial"
    ]
  },

  "stationery": {
    queries: [
      "creative stationery supplies",
      "school office stationery"
    ],
    include: [
      "stationery",
      "pen",
      "pencil",
      "marker",
      "notebook",
      "paper",
      "sticker",
      "eraser",
      "school",
      "office",
      "desk",
      "folder",
      "journal",
      "planner"
    ],
    exclude: [
      "printer machine",
      "industrial",
      "car",
      "motorcycle",
      "clothing",
      "shoe"
    ]
  },

  "accessories": {
    queries: [
      "fashion daily accessories",
      "trending personal accessories"
    ],
    include: [
      "accessory",
      "accessories",
      "bag",
      "wallet",
      "belt",
      "scarf",
      "glasses",
      "sunglasses",
      "jewelry",
      "jewellery",
      "hair clip",
      "keychain",
      "watch strap"
    ],
    exclude: [
      "shirt",
      "t-shirt",
      "dress",
      "pants",
      "jeans",
      "shoe",
      "slipper",
      "jacket",
      "car accessory",
      "motorcycle"
    ]
  },

  "pets": {
    queries: [
      "smart pet supplies",
      "pet accessories products"
    ],
    include: [
      "pet",
      "dog",
      "cat",
      "puppy",
      "kitten",
      "animal",
      "feeder",
      "leash",
      "collar",
      "grooming",
      "pet toy",
      "litter"
    ],
    exclude: [
      "human",
      "car",
      "motorcycle",
      "industrial",
      "livestock machine"
    ]
  },

  "seasonal": {
    queries: [
      "seasonal holiday products",
      "outdoor seasonal decoration"
    ],
    include: [
      "seasonal",
      "holiday",
      "christmas",
      "halloween",
      "easter",
      "party",
      "summer",
      "winter",
      "outdoor",
      "garden",
      "decoration"
    ],
    exclude: [
      "industrial",
      "commercial machine",
      "car part",
      "motorcycle"
    ]
  },

  "gifts": {
    queries: [
      "creative unique gift ideas",
      "novelty gift products"
    ],
    include: [
      "gift",
      "present",
      "novelty",
      "souvenir",
      "creative",
      "custom",
      "personalized",
      "personalised",
      "birthday",
      "anniversary",
      "gift box"
    ],
    exclude: [
      "gift card",
      "digital code",
      "commercial machine",
      "industrial",
      "car part"
    ]
  },

  "electronics-accessories": {
    queries: [
      "smart electronic accessories",
      "mobile digital accessories"
    ],
    include: [
      "electronic",
      "electronics",
      "phone",
      "mobile",
      "usb",
      "charger",
      "cable",
      "adapter",
      "holder",
      "stand",
      "smart",
      "digital",
      "headphone",
      "earphone"
    ],
    exclude: [
      "industrial machine",
      "car engine",
      "motorcycle part",
      "replacement motherboard"
    ]
  },

  "other": {
    queries: [
      "innovative consumer products",
      "creative useful products"
    ],
    include: [],
    exclude: [
      "industrial machine",
      "commercial equipment",
      "car engine",
      "motorcycle part"
    ]
  }
};

const CHINA_SIGNAL_CONFIG = {
  all: {
    queryWords: [
      "new trending popular products"
    ],
    sortType:
      "default",
    label:
      "Товарний сигнал AliExpress",
    description:
      "Товар знайдений у широкій категорійній видачі AliExpress."
  },

  new: {
    queryWords: [
      "new arrivals 2026",
      "latest new design"
    ],
    sortType:
      "create_desc",
    label:
      "Новинка у видачі AliExpress",
    description:
      "Товар знайдений за запитами нових надходжень і нових дизайнів AliExpress."
  },

  trends: {
    queryWords: [
      "trending viral products",
      "hot trend 2026"
    ],
    sortType:
      "default",
    label:
      "Трендовий пошуковий сигнал AliExpress",
    description:
      "Товар знайдений у трендовій пошуковій добірці AliExpress."
  },

  popular: {
    queryWords: [
      "best seller",
      "top selling most ordered"
    ],
    sortType:
      "total_tranpro_desc",
    label:
      "Популярний пошуковий сигнал AliExpress",
    description:
      "Товар знайдений у добірці популярних і найбільш продаваних товарів AliExpress."
  }
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

const ALIEXPRESS_CACHE_TTL_MS =
  20 * 60 * 1000;

const aliexpressPageCache =
  new Map();

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

function normalizeChinaText(value) {
  return cleanTrendText(
    value,
    500
  )
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getChinaWords(value) {
  return [
    ...new Set(
      normalizeChinaText(value)
        .split(" ")
        .filter(word =>
          word.length >= 3
        )
    )
  ];
}

function buildChinaSearchQueries(
  category,
  signalType,
  searchDetails
) {
  const categoryConfig =
    CHINA_CATEGORY_CONFIG[category] ||
    CHINA_CATEGORY_CONFIG.other;

  const signalConfig =
    CHINA_SIGNAL_CONFIG[signalType];

  if (!signalConfig) {
    return [];
  }

  const details = cleanTrendText(
    searchDetails,
    160
  );

  const baseQuery =
    categoryConfig.queries[0] ||
    CHINA_CATEGORY_CONFIG.other
      .queries[0];

  const signalWords =
    signalConfig.queryWords[0];

  const primaryQuery = [
    baseQuery,
    signalWords,
    details
  ]
    .filter(Boolean)
    .join(" ");

  return [
    cleanTrendText(
      primaryQuery,
      240
    )
  ].filter(Boolean);
}

function buildAliExpressSearchUrl(
  chinaConfig,
  searchQuery,
  signalType
) {
  const searchUrl = new URL(
    "/wholesale",
    chinaConfig.domain
  );

  searchUrl.searchParams.set(
    "SearchText",
    searchQuery
  );

  searchUrl.searchParams.set(
    "trafficChannel",
    "main"
  );

  searchUrl.searchParams.set(
    "g",
    "y"
  );

  const signalConfig =
    CHINA_SIGNAL_CONFIG[signalType];

  if (
    signalConfig?.sortType &&
    signalConfig.sortType !== "default"
  ) {
    searchUrl.searchParams.set(
      "SortType",
      signalConfig.sortType
    );
  }

  return searchUrl.toString();
}

async function loadAliExpressSearchPage({
  chinaConfig,
  searchQuery,
  signalType
}) {
  const sourceUrl =
    buildAliExpressSearchUrl(
      chinaConfig,
      searchQuery,
      signalType
    );

  const jinaQuery = [
    "site:aliexpress.com/item",
    searchQuery
  ]
    .filter(Boolean)
    .join(" ");

  const searchUrl =
    `https://s.jina.ai/${encodeURIComponent(
      jinaQuery
    )}`;

  const cacheKey =
    searchUrl.toLocaleLowerCase(
      "en-US"
    );

  const cachedPage =
    aliexpressPageCache.get(
      cacheKey
    );

  if (
    cachedPage &&
    Date.now() -
      cachedPage.savedAt <
      ALIEXPRESS_CACHE_TTL_MS
  ) {
    return {
      ...cachedPage.result,
      cached: true
    };
  }

  const response = await fetch(
    searchUrl,
    {
      method: "GET",
      headers: {
        Accept:
          "text/plain",
        "X-Respond-With":
          "markdown",
        "X-With-Links-Summary":
          "all",
        "X-With-Images-Summary":
          "all",
        "X-Timeout":
          "30"
      },
      signal:
        AbortSignal.timeout(40000)
    }
  );

  if (!response.ok) {
    const error = new Error(
      `ALIEXPRESS_SEARCH_FAILED_${response.status}`
    );

    error.statusCode = 502;
    throw error;
  }

  const html =
    await response.text();

  if (
    html.length < 500 ||
    !html
      .toLocaleLowerCase("en-US")
      .includes("aliexpress")
  ) {
    const error = new Error(
      "ALIEXPRESS_SEARCH_EMPTY"
    );

    error.statusCode = 502;
    throw error;
  }

  const result = {
    sourceUrl,
    finalUrl:
      searchUrl,
    html,
    cached: false
  };

  aliexpressPageCache.set(
    cacheKey,
    {
      savedAt:
        Date.now(),
      result
    }
  );

  return result;
}

function getAliExpressImageUrl(
  imageTag,
  chinaConfig
) {
  const imageCandidates = [];

  const sourcePatterns = [
    /\bdata-src=["']([^"']+)["']/i,
    /\bsrc=["']([^"']+)["']/i,
    /\bsrcset=["']([^"']+)["']/i
  ];

  for (
    const sourcePattern
    of sourcePatterns
  ) {
    const sourceMatch =
      imageTag.match(
        sourcePattern
      );

    if (!sourceMatch?.[1]) {
      continue;
    }

    if (
      sourcePattern
        .toString()
        .includes("srcset")
    ) {
      const srcsetCandidates =
        sourceMatch[1]
          .split(",")
          .map(item =>
            item.trim().split(/\s+/)[0]
          )
          .filter(Boolean);

      imageCandidates.push(
        ...srcsetCandidates
      );
    } else {
      imageCandidates.push(
        sourceMatch[1]
      );
    }
  }

  for (
    const rawCandidate
    of imageCandidates
  ) {
    try {
      const decodedCandidate =
        decodeHtmlEntities(
          rawCandidate
        );

      const imageUrl =
        decodedCandidate.startsWith("//")
          ? `https:${decodedCandidate}`
          : new URL(
              decodedCandidate,
              chinaConfig.domain
            ).toString();

      const normalizedUrl =
        imageUrl.toLocaleLowerCase(
          "en-US"
        );

      const isMediaDomain =
        normalizedUrl.includes(
          "alicdn"
        ) ||
        normalizedUrl.includes(
          "aliexpress-media"
        );

      const isBlockedImage =
        normalizedUrl.includes(
          "48x48"
        ) ||
        normalizedUrl.includes(
          "32x32"
        ) ||
        normalizedUrl.includes(
          "16x16"
        ) ||
        normalizedUrl.includes(
          "logo"
        ) ||
        normalizedUrl.includes(
          "icon"
        ) ||
        normalizedUrl.includes(
          "sprite"
        ) ||
        normalizedUrl.includes(
          "banner"
        ) ||
        normalizedUrl.includes(
          "arrow"
        ) ||
        normalizedUrl.includes(
          "loading"
        ) ||
        normalizedUrl.endsWith(
          ".gif"
        );

      if (
        isMediaDomain &&
        !isBlockedImage
      ) {
        return imageUrl;
      }
    } catch {
      // Пропускаємо некоректну адресу.
    }
  }

  return null;
}

function isBlockedAliExpressTitle(title) {
  const normalizedTitle =
    normalizeChinaText(title);

  if (
    !normalizedTitle ||
    normalizedTitle.length < 8
  ) {
    return true;
  }

  const blockedPatterns = [
    /^save \d/,
    /^shop now$/,
    /^view more$/,
    /^free shipping$/,
    /^welcome deal$/,
    /^choice$/,
    /^sponsored$/,
    /^school ready sale$/,
    /^super deals$/,
    /^big sale$/,
    /^new user bonus$/,
    /^download app$/,
    /^sign in$/,
    /^register$/,
    /^add to cart$/,
    /^buy now$/
  ];

  return blockedPatterns.some(
    pattern =>
      pattern.test(
        normalizedTitle
      )
  );
}

function getTitleImageSimilarity(
  title,
  imageAlt
) {
  const titleWords =
    getChinaWords(title);

  const altWords =
    new Set(
      getChinaWords(imageAlt)
    );

  if (
    !titleWords.length ||
    !altWords.size
  ) {
    return 0;
  }

  const matches =
    titleWords.filter(word =>
      altWords.has(word)
    ).length;

  return matches /
    titleWords.length;
}

function extractAliExpressProducts(
  html,
  chinaConfig
) {
  const products = [];
  const seenProductIds =
    new Set();

  const sourceText =
    String(html || "");

  const productLinkPattern =
    /\[([^\]]{4,500})\]\((https?:\/\/[^)\s]*aliexpress[^)\s]*\/item\/(\d+)\.html[^)\s]*)\)/gi;

  const linkMatches = [
    ...sourceText.matchAll(
      productLinkPattern
    )
  ];

  for (
    const linkMatch
    of linkMatches
  ) {
    const rawTitle =
      linkMatch[1];

    const rawLink =
      linkMatch[2];

    const productId =
      linkMatch[3];

    if (
      !productId ||
      seenProductIds.has(
        productId
      )
    ) {
      continue;
    }

    const title =
      cleanTrendText(
        decodeHtmlEntities(
          rawTitle
            .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
            .replace(/[*_#`]+/g, " ")
        ),
        300
      );

    if (
      !title ||
      isBlockedAliExpressTitle(
        title
      )
    ) {
      continue;
    }

    const matchIndex =
      Number(linkMatch.index) || 0;

    const contextStart =
      Math.max(
        0,
        matchIndex - 1800
      );

    const contextEnd =
      Math.min(
        sourceText.length,
        matchIndex + 1800
      );

    const context =
      sourceText.slice(
        contextStart,
        contextEnd
      );

    const imageMatches = [
      ...context.matchAll(
        /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi
      )
    ];

    let imageUrl = null;

    for (
      const imageMatch
      of imageMatches
    ) {
      const candidateUrl =
        decodeHtmlEntities(
          imageMatch[2]
        );

      const normalizedUrl =
        candidateUrl.toLocaleLowerCase(
          "en-US"
        );

      if (
        (
          normalizedUrl.includes(
            "alicdn"
          ) ||
          normalizedUrl.includes(
            "aliexpress-media"
          )
        ) &&
        !normalizedUrl.includes(
          "48x48"
        ) &&
        !normalizedUrl.includes(
          "32x32"
        ) &&
        !normalizedUrl.includes(
          "logo"
        ) &&
        !normalizedUrl.includes(
          "icon"
        )
      ) {
        imageUrl =
          candidateUrl;
        break;
      }
    }

    const link =
      `${chinaConfig.domain}/item/${productId}.html`;

    seenProductIds.add(
      productId
    );

    products.push({
      productId,
      title,
      link,
      imageUrl,
      sourcePosition:
        products.length + 1
    });

    if (
      products.length >= 30
    ) {
      break;
    }
  }

  return products;
}

function getChinaCategoryScore(
  title,
  category
) {
  const categoryConfig =
    CHINA_CATEGORY_CONFIG[category] ||
    CHINA_CATEGORY_CONFIG.other;

  const normalizedTitle =
    normalizeChinaText(title);

  const includeMatches =
    categoryConfig.include.filter(
      word =>
        normalizedTitle.includes(
          normalizeChinaText(word)
        )
    );

  const excludeMatches =
    categoryConfig.exclude.filter(
      word =>
        normalizedTitle.includes(
          normalizeChinaText(word)
        )
    );

  if (excludeMatches.length) {
    return -10;
  }

  if (
    !categoryConfig.include.length
  ) {
    return 2;
  }

  if (includeMatches.length) {
    return Math.min(
      includeMatches.length + 2,
      8
    );
  }

  return 1;
}

function getChinaQueryScore(
  title,
  searchQuery
) {
  const titleWords =
    new Set(
      getChinaWords(title)
    );

  const ignoredWords =
    new Set([
      "new",
      "latest",
      "design",
      "trending",
      "viral",
      "products",
      "product",
      "popular",
      "seller",
      "selling",
      "ordered",
      "2026",
      "home",
      "daily"
    ]);

  const queryWords =
    getChinaWords(
      searchQuery
    ).filter(word =>
      !ignoredWords.has(word)
    );

  if (!queryWords.length) {
    return 0;
  }

  return queryWords.filter(word =>
    titleWords.has(word)
  ).length;
}

async function loadAliExpressSignal({
  chinaConfig,
  category,
  signalType,
  searchDetails,
  exclusions
}) {
  const searchQueries =
    buildChinaSearchQueries(
      category,
      signalType,
      searchDetails
    );

  const productsById =
    new Map();

  const checkedSources = [];
  let successfulRequests = 0;
  let totalExtracted = 0;
  let firstError = null;

  for (
    const searchQuery
    of searchQueries
  ) {
    try {
      const pageResult =
        await loadAliExpressSearchPage({
          chinaConfig,
          searchQuery,
          signalType
        });

      successfulRequests += 1;

      checkedSources.push({
        query:
          searchQuery,
        url:
          pageResult.sourceUrl
      });

      const extractedProducts =
        extractAliExpressProducts(
          pageResult.html,
          chinaConfig
        );

      totalExtracted +=
        extractedProducts.length;

      for (
        const product
        of extractedProducts
      ) {
        if (
          matchesExclusions(
            product.title,
            exclusions
          )
        ) {
          continue;
        }

        const categoryScore =
          getChinaCategoryScore(
            product.title,
            category
          );

        if (categoryScore < 0) {
          continue;
        }

        const queryScore =
          getChinaQueryScore(
            product.title,
            searchQuery
          );

        const currentProduct =
          productsById.get(
            product.productId
          );

        if (!currentProduct) {
          productsById.set(
            product.productId,
            {
              ...product,
              signalType,
              categoryScore,
              queryScore,
              occurrenceCount:
                1,
              matchedQueries: [
                searchQuery
              ],
              bestPosition:
                product.sourcePosition
            }
          );

          continue;
        }

        currentProduct.occurrenceCount += 1;

        currentProduct.categoryScore =
          Math.max(
            currentProduct.categoryScore,
            categoryScore
          );

        currentProduct.queryScore =
          Math.max(
            currentProduct.queryScore,
            queryScore
          );

        currentProduct.bestPosition =
          Math.min(
            currentProduct.bestPosition,
            product.sourcePosition
          );

        if (
          !currentProduct.matchedQueries.includes(
            searchQuery
          )
        ) {
          currentProduct.matchedQueries.push(
            searchQuery
          );
        }
      }
    } catch (error) {
      firstError ||= error;

      console.error(
        `[${chinaConfig.sourceName} ${signalType}]`,
        error
      );
    }
  }

  if (
    !successfulRequests &&
    firstError
  ) {
    throw firstError;
  }

  const products = [
    ...productsById.values()
  ]
    .map(product => {
      const positionScore =
        Math.max(
          0,
          20 -
          Number(
            product.bestPosition || 20
          )
        );

      const relevanceScore =
        product.categoryScore * 12 +
        product.queryScore * 3 +
        product.occurrenceCount * 6 +
        positionScore * 2 +
        (
          product.imageUrl
            ? 8
            : 0
        );

      return {
        ...product,
        relevanceScore
      };
    })
    .sort(
      (first, second) =>
        second.relevanceScore -
        first.relevanceScore ||
        second.occurrenceCount -
        first.occurrenceCount ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(0, 12)
    .map((product, index) => ({
      ...product,
      sourcePosition:
        index + 1
    }));

  return {
    source:
      chinaConfig.sourceName,
    sourceType:
      signalType,
    status:
      products.length
        ? "ok"
        : "no_results",
    totalExtracted,
    checkedSources,
    products
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

function buildIdeasFromAliExpress(
  sourceResult,
  chinaConfig
) {
  const signalConfig =
    CHINA_SIGNAL_CONFIG[
      sourceResult.sourceType
    ];

  return sourceResult.products.map(
    product => {
      const repeatText =
        product.occurrenceCount > 1
          ? ` Товар знайдений у ${product.occurrenceCount} різних пошукових добірках.`
          : "";

      return {
        id:
          `aliexpress-${sourceResult.sourceType}-${product.productId}`,
        title:
          product.title,
        imageUrl:
          product.imageUrl || null,
        description:
          (
            signalConfig?.description ||
            "Товар знайдений у товарній видачі AliExpress."
          ) +
          repeatText,
        signal:
          signalConfig?.label ||
          "Товарна видача AliExpress",
        signalType:
          sourceResult.sourceType,
        geography:
          chinaConfig.geography,
        sources: [
          `${chinaConfig.sourceName} · пошуковий сигнал`
        ],
        links: [
          {
            label:
              "Відкрити на AliExpress",
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
    const chinaSignalType =
      signalType;

    try {
      const chinaResult =
        await loadAliExpressSignal({
          chinaConfig,
          category,
          signalType:
            chinaSignalType,
          searchDetails,
          exclusions
        });

      sources.push(
        chinaResult
      );

      ideas = ideas.concat(
        buildIdeasFromAliExpress(
          chinaResult,
          chinaConfig
        )
      );
    } catch (error) {
      console.error(
        `[${chinaConfig.sourceName} ${chinaSignalType}]`,
        error
      );

      sources.push({
        source:
          chinaConfig.sourceName,
        sourceType:
          chinaSignalType,
        status:
          "error",
        message:
          error.message ===
          "ALIEXPRESS_BLOCKED_PAGE"
            ? "AliExpress тимчасово повернув перевірку замість товарної видачі."
            : `${chinaConfig.sourceName} тимчасово не повернув товарну видачу.`,
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

  ideas = uniqueIdeas
    .sort(
      (first, second) =>
        Number(first.sourcePosition || 99) -
        Number(second.sourcePosition || 99)
    )
    .slice(0, 36);

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
      `Успішно перевірено джерел: ${successfulSources.length}. ` +
      (
        successfulMarkets.length
          ? `Джерела: ${successfulMarkets.join(", ")}. `
          : ""
      ) +
      "Результати можуть включати новинки, товари, що набирають позиції, та популярні товари.";
  } else if (
    !amazonConfigs.length &&
    !chinaConfigs.length
  ) {
    summary =
      "Для вибраного ринку ще не підключено товарне джерело.";
  } else {
    summary =
      "Підключені джерела не повернули товарів за вибраними параметрами. " +
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
