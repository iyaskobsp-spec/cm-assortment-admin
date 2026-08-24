const UKRAINE_SOURCE_CONFIGS = [
  {
    code: "prom",
    sourceName: "Prom.ua",
    geography: "Україна",
    domain: "https://prom.ua"
  },
  {
    code: "rozetka",
    sourceName: "Rozetka",
    geography: "Україна",
    domain: "https://rozetka.com.ua"
  }
];

const UKRAINE_SIGNAL_CONFIG = {
  all: {
    label: "Товарний сигнал українського маркетплейсу",
    description:
      "Товар знайдений у релевантній видачі українського маркетплейсу."
  },

  new: {
    label: "Новинка українського маркетплейсу",
    description:
      "Товар знайдений у видачі нових пропозицій українського маркетплейсу."
  },

  trends: {
    label: "Трендовий сигнал українського маркетплейсу",
    description:
      "Товар має сильну позицію у поточній категорійній видачі українського маркетплейсу."
  },

  popular: {
    label: "Популярний товар українського маркетплейсу",
    description:
      "Товар знайдений серед популярних пропозицій українського маркетплейсу."
  }
};

const pageCache = new Map();

const CACHE_TTL_MS =
  20 * 60 * 1000;

function cleanText(
  value,
  maxLength = 300
) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function matchesExclusions(
  title,
  exclusions
) {
  const normalizedTitle =
    cleanText(title)
      .toLocaleLowerCase(
        "uk-UA"
      );

  const phrases =
    cleanText(exclusions)
      .split(/[,;\n]+/)
      .map(value =>
        value
          .trim()
          .toLocaleLowerCase(
            "uk-UA"
          )
      )
      .filter(Boolean);

  return phrases.some(
    phrase =>
      normalizedTitle.includes(
        phrase
      )
  );
}

function buildQueries({
  refinementKey,
  refinementOptions,
  searchDetails
}) {
  const options =
    (
      Array.isArray(
        refinementOptions
      )
        ? refinementOptions
        : []
    )
      .map(option => ({
        key:
          cleanText(
            option?.key,
            80
          ),
        label:
          cleanText(
            option?.label,
            140
          )
      }))
      .filter(
        option =>
          option.key &&
          option.label
      )
      .filter(
        option =>
          !refinementKey ||
          option.key ===
            refinementKey
      );

  const details =
    cleanText(
      searchDetails,
      120
    );

  return options
    .slice(
      0,
      24
    )
    .map(option => ({
      subgroup:
        option.key,

      searchQuery:
        cleanText(
          [
            option.label,
            details
          ]
            .filter(Boolean)
            .join(" "),
          220
        )
    }));
}

function buildSearchUrl(
  sourceConfig,
  searchQuery,
  signalType,
  page
) {
  if (
    sourceConfig.code ===
    "prom"
  ) {
    const url =
      new URL(
        "/ua/search",
        sourceConfig.domain
      );

    url.searchParams.set(
      "search_term",
      searchQuery
    );

    if (page > 1) {
      url.searchParams.set(
        "page",
        String(page)
      );
    }

    if (
      signalType === "new"
    ) {
      url.searchParams.set(
        "sort",
        "-date_created"
      );
    } else if (
      signalType === "trends" ||
      signalType === "popular"
    ) {
      url.searchParams.set(
        "sort",
        "-popularity"
      );
    }

    return url.toString();
  }

  const url =
    new URL(
      "/ua/search/",
      sourceConfig.domain
    );

  url.searchParams.set(
    "text",
    searchQuery
  );

  if (page > 1) {
    url.searchParams.set(
      "page",
      String(page)
    );
  }

  if (
    signalType === "new"
  ) {
    url.searchParams.set(
      "sort",
      "novelty"
    );
  }

  return url.toString();
}

function normalizeProductLink(
  value,
  sourceConfig
) {
  try {
    const url =
      new URL(
        String(value || ""),
        sourceConfig.domain
      );

    const hostname =
      url.hostname
        .toLocaleLowerCase(
          "en-US"
        );

    if (
      sourceConfig.code ===
        "prom" &&
      hostname !== "prom.ua"
    ) {
      return null;
    }

    if (
      sourceConfig.code ===
        "rozetka" &&
      hostname !==
        "rozetka.com.ua" &&
      !hostname.endsWith(
        ".rozetka.com.ua"
      )
    ) {
      return null;
    }

    url.hash = "";

    [
      "primacyToken",
      "primacySource",
      "srsltid"
    ].forEach(key => {
      url.searchParams.delete(
        key
      );
    });

    return url.toString();
  } catch {
    return null;
  }
}

function getProductId(
  link,
  sourceConfig
) {
  const sourceLink =
    String(link || "");

  if (
    sourceConfig.code ===
    "prom"
  ) {
    return (
      sourceLink.match(
        /\/p(\d+)/i
      )?.[1] ||
      sourceLink.match(
        /[?&]p=(\d+)/i
      )?.[1] ||
      sourceLink.match(
        /\/m-(\d+)/i
      )?.[1] ||
      null
    );
  }

  return (
    sourceLink.match(
      /\/p(\d+)\//i
    )?.[1] ||
    null
  );
}

function normalizeProductImage(
  value,
  sourceConfig
) {
  try {
    const url =
      new URL(
        String(value || "")
          .replace(
            /\\\//g,
            "/"
          )
      );

    const hostname =
      url.hostname
        .toLocaleLowerCase(
          "en-US"
        );

    const normalized =
      url.toString()
        .toLocaleLowerCase(
          "en-US"
        );

    if (
      sourceConfig.code ===
        "prom" &&
      hostname !==
        "images.prom.ua"
    ) {
      return null;
    }

    if (
      sourceConfig.code ===
        "rozetka" &&
      (
        !hostname.startsWith(
          "content"
        ) ||
        !hostname.endsWith(
          ".rozetka.com.ua"
        )
      )
    ) {
      return null;
    }

    if (
      [
        "logo",
        "icon",
        "sprite",
        "placeholder",
        "loading",
        "goods_tags"
      ].some(part =>
        normalized.includes(
          part
        )
      )
    ) {
      return null;
    }

    if (
      /\.(?:svg|gif)(?:[?#]|$)/i
        .test(normalized)
    ) {
      return null;
    }

    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeProduct({
  title,
  imageUrl,
  link,
  sourceConfig,
  sourcePosition
}) {
  const normalizedLink =
    normalizeProductLink(
      link,
      sourceConfig
    );

  const productId =
    getProductId(
      normalizedLink,
      sourceConfig
    );

  const normalizedTitle =
    cleanText(
      String(title || "")
        .replace(
          /\\(["'()[\]])/g,
          "$1"
        )
        .replace(
          /[*_`#]+/g,
          " "
        ),
      300
    );

  const normalizedImageUrl =
    normalizeProductImage(
      imageUrl,
      sourceConfig
    );

  if (
    !normalizedLink ||
    !productId ||
    normalizedTitle.length < 8 ||
    !normalizedImageUrl
  ) {
    return null;
  }

  return {
    productId,
    title:
      normalizedTitle,
    imageUrl:
      normalizedImageUrl,
    link:
      normalizedLink,
    sourcePosition:
      Number(
        sourcePosition
      ) || 999
  };
}

function extractProductsFromMarkdown(
  text,
  sourceConfig
) {
  const pattern =
    sourceConfig.code ===
      "prom"
      ? /\[!\[Image\s+\d+\s*:\s*([^\]]{6,600})\]\((https?:\/\/images\.prom\.ua\/[^)\s]+)\)[\s\S]{0,700}?\]\((https?:\/\/prom\.ua\/ua\/(?:p\d+|m-)[^)\s]*)/gi
      : /\[!\[Image\s+\d+\s*:\s*([^\]]{6,600})\]\((https?:\/\/content\d*\.rozetka\.com\.ua\/goods\/images\/[^)\s]+)\)[\s\S]{0,900}?\]\((https?:\/\/(?:[a-z0-9-]+\.)?rozetka\.com\.ua\/ua\/[^)\s]*\/p\d+\/[^)\s]*)/gi;

  const products = [];

  const seenIds =
    new Set();

  for (
    const match
    of String(
      text || ""
    ).matchAll(
      pattern
    )
  ) {
    const product =
      normalizeProduct({
        title:
          match[1],
        imageUrl:
          match[2],
        link:
          match[3],
        sourceConfig,
        sourcePosition:
          products.length + 1
      });

    if (
      !product ||
      seenIds.has(
        product.productId
      )
    ) {
      continue;
    }

    seenIds.add(
      product.productId
    );

    products.push(
      product
    );
  }

  return products.slice(
    0,
    80
  );
}

function extractPromProductsFromHtml(
  html,
  sourceConfig
) {
  const productObjects = [];

  function collectProducts(
    value
  ) {
    if (Array.isArray(value)) {
      value.forEach(
        collectProducts
      );
      return;
    }

    if (
      !value ||
      typeof value !==
        "object"
    ) {
      return;
    }

    const type =
      value["@type"];

    if (
      type === "Product" ||
      (
        Array.isArray(type) &&
        type.includes(
          "Product"
        )
      )
    ) {
      productObjects.push(
        value
      );
    }

    Object.values(value)
      .forEach(
        collectProducts
      );
  }

  const scriptPattern =
    /<script\b[^>]*type=(?:["'])application\/ld\+json(?:["'])[^>]*>([\s\S]*?)<\/script>/gi;

  for (
    const match
    of String(
      html || ""
    ).matchAll(
      scriptPattern
    )
  ) {
    try {
      collectProducts(
        JSON.parse(
          match[1].trim()
        )
      );
    } catch {
      // Пропускаємо службовий JSON-LD.
    }
  }

  const products = [];

  const seenIds =
    new Set();

  for (
    const productObject
    of productObjects
  ) {
    const offers =
      Array.isArray(
        productObject.offers
      )
        ? productObject.offers
        : productObject.offers
          ? [
              productObject.offers
            ]
          : [];

    const imageValue =
      Array.isArray(
        productObject.image
      )
        ? productObject.image[0]
        : productObject.image;

    const imageUrl =
      typeof imageValue ===
        "string"
        ? imageValue
        : imageValue?.url ||
          imageValue?.contentUrl;

    const link =
      productObject.url ||
      offers
        .map(offer =>
          offer?.url
        )
        .find(Boolean);

    const product =
      normalizeProduct({
        title:
          productObject.name,
        imageUrl,
        link,
        sourceConfig,
        sourcePosition:
          products.length + 1
      });

    if (
      !product ||
      seenIds.has(
        product.productId
      )
    ) {
      continue;
    }

    seenIds.add(
      product.productId
    );

    products.push(
      product
    );
  }

  return products.slice(
    0,
    80
  );
}

async function loadPage({
  sourceConfig,
  searchQuery,
  signalType,
  page,
  skipDirectProm = false
}) {
  const sourceUrl =
    buildSearchUrl(
      sourceConfig,
      searchQuery,
      signalType,
      page
    );

  const cacheKey =
    `${sourceConfig.code}|${signalType}|${sourceUrl}`;

  const cached =
    pageCache.get(
      cacheKey
    );

  if (
    cached &&
    Date.now() -
      cached.savedAt <
        CACHE_TTL_MS
  ) {
    return cached.result;
  }

  let products = [];

  const gateways = [];

  if (
    sourceConfig.code ===
      "prom" &&
    !skipDirectProm
  ) {
    try {
      const response =
        await fetch(
          sourceUrl,
          {
            headers: {
              Accept:
                "text/html,application/xhtml+xml",

              "Accept-Language":
                "uk-UA,uk;q=0.9,en;q=0.7",

              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                "AppleWebKit/537.36 Chrome/124 Safari/537.36"
            },

            signal:
              AbortSignal.timeout(
                6000
              )
          }
        );

      if (!response.ok) {
        throw new Error(
          `PROM_DIRECT_${response.status}`
        );
      }

      products =
        extractPromProductsFromHtml(
          await response.text(),
          sourceConfig
        );

      gateways.push(
        "direct"
      );
    } catch (error) {
      console.warn(
        "[Prom.ua] direct search failed:",
        error?.message ||
        error
      );
    }
  }

  if (
    products.length < 12
  ) {
    try {
      const response =
        await fetch(
          `https://r.jina.ai/${sourceUrl}`,
          {
            headers: {
              Accept:
                "text/plain,text/markdown,*/*",

              "User-Agent":
                "Mozilla/5.0",

              "X-Retain-Images":
                "all"
            },

            signal:
              AbortSignal.timeout(
                20000
              )
          }
        );

      if (!response.ok) {
        throw new Error(
          `${sourceConfig.code.toUpperCase()}_JINA_${response.status}`
        );
      }

      const jinaProducts =
        extractProductsFromMarkdown(
          await response.text(),
          sourceConfig
        );

      const productsById =
        new Map(
          products.map(
            product => [
              product.productId,
              product
            ]
          )
        );

      for (
        const product
        of jinaProducts
      ) {
        if (
          !productsById.has(
            product.productId
          )
        ) {
          productsById.set(
            product.productId,
            product
          );
        }
      }

      products = [
        ...productsById.values()
      ];

      gateways.push(
        "jina"
      );
    } catch (error) {
      console.warn(
        `[${sourceConfig.sourceName}] Jina search failed:`,
        error?.message ||
        error
      );
    }
  }

  const result = {
    sourceUrl,

    gateway:
      gateways.join("+") ||
      "failed",

    products
  };

  pageCache.set(
    cacheKey,
    {
      savedAt:
        Date.now(),
      result
    }
  );

  return result;
}

async function runTasks(
  tasks,
  concurrency = 3
) {
  const results =
    new Array(
      tasks.length
    );

  let cursor = 0;

  async function worker() {
    while (
      cursor <
      tasks.length
    ) {
      const currentIndex =
        cursor;

      cursor += 1;

      try {
        results[
          currentIndex
        ] =
          await tasks[
            currentIndex
          ]();
      } catch (error) {
        results[
          currentIndex
        ] = {
          sourceUrl:
            null,

          gateway:
            "failed",

          products:
            [],

          error
        };
      }
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            concurrency,
            tasks.length
          )
      },
      () =>
        worker()
    )
  );

  return results;
}

function selectBalancedProducts(
  products,
  limit
) {
  const buckets =
    new Map();

  for (
    const product
    of products
  ) {
    const subgroup =
      product.subgroup ||
      "other";

    if (
      !buckets.has(
        subgroup
      )
    ) {
      buckets.set(
        subgroup,
        []
      );
    }

    buckets
      .get(subgroup)
      .push(product);
  }

  const bucketValues =
    [
      ...buckets.values()
    ].map(bucket =>
      bucket.sort(
        (first, second) =>
          second.relevanceScore -
            first.relevanceScore ||
          first.sourcePosition -
            second.sourcePosition
      )
    );

  const selected = [];

  let round = 0;

  while (
    selected.length <
    limit
  ) {
    let added = false;

    for (
      const bucket
      of bucketValues
    ) {
      const product =
        bucket[round];

      if (!product) {
        continue;
      }

      selected.push(
        product
      );

      added = true;

      if (
        selected.length >=
        limit
      ) {
        break;
      }
    }

    if (!added) {
      break;
    }

    round += 1;
  }

  return selected;
}

async function loadSource({
  sourceConfig,
  category,
  signalType,
  refinementKey,
  refinementOptions,
  searchDetails,
  exclusions
}) {
  const queries =
    buildQueries({
      refinementKey,
      refinementOptions,
      searchDetails
    });

  if (!queries.length) {
    return {
      source:
        sourceConfig.sourceName,

      sourceType:
        signalType,

      status:
        "no_results",

      totalExtracted:
        0,

      refinementKey,

      products:
        []
    };
  }

  const pages =
    refinementKey
      ? [1, 2]
      : [1];

  const tasks = [];

  for (
    const queryItem
    of queries
  ) {
    for (
      const page
      of pages
    ) {
      tasks.push(
        async () => ({
          ...await loadPage({
            sourceConfig,

            searchQuery:
              queryItem.searchQuery,

            signalType,

            page,

            skipDirectProm:
              !refinementKey
          }),

          searchQuery:
            queryItem.searchQuery,

          subgroup:
            queryItem.subgroup,

          page
        })
      );
    }
  }

  const queryResults =
    await runTasks(
      tasks,
      3
    );

  const productsById =
    new Map();

  let totalExtracted = 0;

  for (
    const queryResult
    of queryResults
  ) {
    totalExtracted +=
      queryResult.products.length;

    for (
      const product
      of queryResult.products
    ) {
      if (
        matchesExclusions(
          product.title,
          exclusions
        )
      ) {
        continue;
      }

      const existing =
        productsById.get(
          product.productId
        );

      const effectivePosition =
        product.sourcePosition +
        (
          queryResult.page - 1
        ) * 80;

      if (existing) {
        existing.occurrenceCount +=
          1;

        existing.sourcePosition =
          Math.min(
            existing.sourcePosition,
            effectivePosition
          );

        if (
          !existing
            .matchedQueries
            .includes(
              queryResult.searchQuery
            )
        ) {
          existing
            .matchedQueries
            .push(
              queryResult.searchQuery
            );
        }

        if (
          !existing
            .matchedSubgroups
            .includes(
              queryResult.subgroup
            )
        ) {
          existing
            .matchedSubgroups
            .push(
              queryResult.subgroup
            );
        }

        continue;
      }

      productsById.set(
        product.productId,
        {
          ...product,

          subgroup:
            queryResult.subgroup,

          sourcePosition:
            effectivePosition,

          matchedQueries: [
            queryResult.searchQuery
          ],

          matchedSubgroups: [
            queryResult.subgroup
          ],

          occurrenceCount:
            1
        }
      );
    }
  }

  const rankedProducts =
    [
      ...productsById.values()
    ]
      .map(product => ({
        ...product,

        relevanceScore:
          Math.max(
            1,

            110 -
              product.sourcePosition +
              (
                product.occurrenceCount -
                1
              ) * 12
          )
      }))
      .sort(
        (first, second) =>
          second.relevanceScore -
            first.relevanceScore ||
          first.sourcePosition -
            second.sourcePosition
      );

  const sourceLimit =
    refinementKey
      ? 75
      : 150;

  const products =
    selectBalancedProducts(
      rankedProducts,
      sourceLimit
    )
      .map(
        (product, index) => ({
          ...product,

          sourcePosition:
            index + 1
        })
      );

  return {
    source:
      sourceConfig.sourceName,

    sourceType:
      signalType,

    status:
      products.length
        ? "ok"
        : "no_results",

    totalExtracted,

    refinementKey,

    checkedSources:
      queryResults
        .map(result =>
          result.sourceUrl
        )
        .filter(Boolean),

    products
  };
}

function buildIdeas(
  sourceResult,
  sourceConfig
) {
  const signalConfig =
    UKRAINE_SIGNAL_CONFIG[
      sourceResult.sourceType
    ] ||
    UKRAINE_SIGNAL_CONFIG.all;

  return sourceResult.products.map(
    product => ({
      id:
        `ukraine-${sourceConfig.code}-${product.productId}`,

      title:
        product.title,

      imageUrl:
        product.imageUrl,

      description:
        signalConfig.description,

      signal:
        signalConfig.label,

      signalType:
        sourceResult.sourceType,

      geography:
        sourceConfig.geography,

      sources: [
        sourceConfig.sourceName
      ],

      categoryVerified:
        true,

      refinementVerified:
        Boolean(
          sourceResult.refinementKey &&
          product.matchedSubgroups
            .includes(
              sourceResult.refinementKey
            )
        ),

      links: [
        {
          label:
            `Відкрити на ${sourceConfig.sourceName}`,

          url:
            product.link
        }
      ],

      sourcePosition:
        product.sourcePosition,

      relevanceScore:
        product.relevanceScore,

      subgroup:
        product.subgroup ||
        product.matchedSubgroups[0] ||
        null,

      varietyKeys:
        product.matchedQueries
    })
  );
}

export async function searchUkraineMarketplaceTrends(
  request
) {
  const tasks =
    UKRAINE_SOURCE_CONFIGS.map(
      sourceConfig =>
        async () => {
          try {
            const sourceResult =
              await loadSource({
                sourceConfig,
                ...request
              });

            return {
              sourceResult,

              ideas:
                buildIdeas(
                  sourceResult,
                  sourceConfig
                )
            };
          } catch (error) {
            console.error(
              `[${sourceConfig.sourceName}]`,
              error
            );

            return {
              sourceResult: {
                source:
                  sourceConfig.sourceName,

                sourceType:
                  request.signalType,

                status:
                  "error",

                message:
                  `${sourceConfig.sourceName} тимчасово не повернув товарну видачу.`,

                products:
                  []
              },

              ideas:
                []
            };
          }
        }
    );

  const results =
    await runTasks(
      tasks,
      2
    );

  return {
    sources:
      results.map(
        result =>
          result.sourceResult
      ),

    ideas:
      results.flatMap(
        result =>
          result.ideas
      )
  };
}
