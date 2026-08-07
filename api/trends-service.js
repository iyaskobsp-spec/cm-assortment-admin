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

const MADE_IN_CHINA_SOURCE_CONFIG = {
  code:
    "made-in-china",
  sourceName:
    "Made-in-China",
  geography:
    "Китай",
  domain:
    "https://www.made-in-china.com",
  supportedMarkets:
    new Set([
      "world",
      "china"
    ])
};

const MADE_IN_CHINA_SIGNAL_CONFIG = {
  all: {
    queryWords:
      "consumer products",
    label:
      "Товарний сигнал Made-in-China"
  },

  new: {
    queryWords:
      "new product latest design",
    label:
      "Новинка Made-in-China"
  },

  trends: {
    queryWords:
      "hot product trending design",
    label:
      "Трендовий сигнал Made-in-China"
  },

  popular: {
    queryWords:
      "hot sale best selling",
    label:
      "Популярний сигнал Made-in-China"
  }
};

const MADE_IN_CHINA_CATEGORY_CONFIG = {
  "home-kitchen": {
    groups: [
      {
        key: "kitchen-gadgets",
        queries: [
          "small kitchen gadgets",
          "creative kitchen tools"
        ],
        include: [
          "kitchen gadget",
          "kitchen tool",
          "cooking tool",
          "peeler",
          "slicer",
          "chopper",
          "grater",
          "opener",
          "measuring spoon"
        ]
      },
      {
        key: "food-storage",
        queries: [
          "food storage containers",
          "kitchen food organizer"
        ],
        include: [
          "food container",
          "storage container",
          "lunch box",
          "spice jar",
          "seasoning box",
          "fresh keeping",
          "food storage"
        ]
      },
      {
        key: "tableware",
        queries: [
          "modern tableware accessories",
          "creative serving tableware"
        ],
        include: [
          "tableware",
          "plate",
          "bowl",
          "cup",
          "mug",
          "cutlery",
          "serving tray",
          "coaster"
        ]
      },
      {
        key: "baking",
        queries: [
          "small baking accessories",
          "creative baking tools"
        ],
        include: [
          "baking",
          "bakeware",
          "cake mold",
          "cookie cutter",
          "pastry tool",
          "silicone mold",
          "rolling pin"
        ]
      },
      {
        key: "sink-accessories",
        queries: [
          "small kitchen sink accessories",
          "kitchen cleaning accessories"
        ],
        include: [
          "sink organizer",
          "soap dispenser",
          "sponge holder",
          "dish rack",
          "drain basket",
          "dish brush"
        ]
      }
    ],
    exclude: [
      "commercial kitchen",
      "restaurant equipment",
      "industrial",
      "production line",
      "commercial sink",
      "stainless steel sink",
      "kitchen cabinet",
      "countertop",
      "machine",
      "factory equipment"
    ]
  },

  "storage-organization": {
    groups: [
      {
        key: "wardrobe-storage",
        queries: [
          "wardrobe storage organizer",
          "closet organization products"
        ],
        include: [
          "wardrobe organizer",
          "closet organizer",
          "clothes storage",
          "hanger organizer",
          "underwear organizer",
          "shoe organizer"
        ]
      },
      {
        key: "drawer-desktop",
        queries: [
          "drawer desktop organizer",
          "small desk storage"
        ],
        include: [
          "drawer organizer",
          "desktop organizer",
          "desk organizer",
          "storage drawer",
          "pen holder",
          "document organizer"
        ]
      },
      {
        key: "bathroom-storage",
        queries: [
          "bathroom storage organizer",
          "bathroom shelf holder"
        ],
        include: [
          "bathroom organizer",
          "shower caddy",
          "toiletry organizer",
          "toothbrush holder",
          "bathroom shelf"
        ]
      },
      {
        key: "kitchen-storage",
        queries: [
          "kitchen storage organizer",
          "pantry organization products"
        ],
        include: [
          "kitchen organizer",
          "pantry organizer",
          "spice rack",
          "fridge organizer",
          "cabinet organizer"
        ]
      },
      {
        key: "boxes-baskets",
        queries: [
          "home storage boxes baskets",
          "foldable storage containers"
        ],
        include: [
          "storage box",
          "storage basket",
          "foldable box",
          "organizer bin",
          "storage container"
        ]
      }
    ],
    exclude: [
      "warehouse",
      "pallet",
      "industrial rack",
      "server rack",
      "garage shelving",
      "commercial shelving",
      "metal cabinet",
      "logistics",
      "storage cage"
    ]
  },

  "decor": {
    groups: [
      {
        key: "vases-planters",
        queries: [
          "decorative vase home decor",
          "small flower pot planter decor"
        ],
        include: [
          "vase",
          "flower vase",
          "decorative vase",
          "flower pot",
          "planter",
          "ceramic pot"
        ]
      },
      {
        key: "candles-holders",
        queries: [
          "decorative candle holder",
          "home candle accessories decor"
        ],
        include: [
          "candle holder",
          "candlestick",
          "tealight holder",
          "candle jar",
          "incense holder",
          "aroma burner"
        ]
      },
      {
        key: "figurines-ornaments",
        queries: [
          "small decorative figurines",
          "tabletop ornament sculpture"
        ],
        include: [
          "figurine",
          "ornament",
          "sculpture",
          "statue",
          "desktop decor",
          "table decor",
          "resin craft"
        ]
      },
      {
        key: "trays-stands",
        queries: [
          "decorative tray home",
          "small display tray home decor"
        ],
        include: [
          "decorative tray",
          "jewelry tray",
          "vanity tray",
          "display tray",
          "cake stand",
          "decorative stand"
        ]
      },
      {
        key: "frames-wall-decor",
        queries: [
          "small wall decor photo frame",
          "decorative mirror wall art"
        ],
        include: [
          "photo frame",
          "picture frame",
          "wall decor",
          "wall hanging",
          "decorative mirror",
          "wall art",
          "poster"
        ]
      },
      {
        key: "textile-decor",
        queries: [
          "decorative cushion home",
          "small textile home decor"
        ],
        include: [
          "cushion cover",
          "decorative pillow",
          "table runner",
          "decorative cloth",
          "tapestry"
        ]
      }
    ],
    exclude: [
      "led panel",
      "wall panel",
      "acoustic panel",
      "ceiling panel",
      "lighting panel",
      "shop lighting",
      "store lighting",
      "commercial lighting",
      "signage",
      "advertising display",
      "light box",
      "exhibition stand",
      "building material",
      "construction",
      "wall cladding",
      "marble slab",
      "floor tile",
      "prefabricated",
      "machine",
      "equipment"
    ]
  },

  "household": {
    groups: [
      {
        key: "cleaning-tools",
        queries: [
          "small household cleaning tools",
          "creative home cleaning products"
        ],
        include: [
          "cleaning brush",
          "cleaning sponge",
          "scrubber",
          "dust brush",
          "window cleaner",
          "cleaning cloth",
          "mop accessory"
        ]
      },
      {
        key: "laundry-care",
        queries: [
          "laundry care accessories",
          "clothing care household products"
        ],
        include: [
          "laundry bag",
          "laundry basket",
          "washing bag",
          "lint remover",
          "clothes brush",
          "ironing mat",
          "drying rack"
        ]
      },
      {
        key: "bathroom-daily-use",
        queries: [
          "bathroom daily use products",
          "small bathroom accessories"
        ],
        include: [
          "soap dispenser",
          "toothbrush holder",
          "toilet brush",
          "bathroom mat",
          "shower cap",
          "soap dish"
        ]
      },
      {
        key: "waste-disposal",
        queries: [
          "household waste disposal products",
          "small trash accessories"
        ],
        include: [
          "trash bag",
          "garbage bag",
          "waste bin",
          "dustbin",
          "trash can",
          "garbage holder"
        ]
      },
      {
        key: "home-care-gadgets",
        queries: [
          "useful household gadgets",
          "small home care devices"
        ],
        include: [
          "fabric shaver",
          "lint remover",
          "mini sealer",
          "shoe dryer",
          "odor remover",
          "home care"
        ]
      }
    ],
    exclude: [
      "industrial cleaner",
      "commercial cleaning",
      "floor scrubber",
      "pressure washer",
      "cleaning machine",
      "production equipment",
      "factory",
      "automotive"
    ]
  },

  "beauty-care": {
    groups: [
      {
        key: "skincare",
        queries: [
          "facial skincare products",
          "serum cream face care"
        ],
        include: [
          "serum",
          "facial cream",
          "face cream",
          "moisturizer",
          "cleanser",
          "toner",
          "essence",
          "sunscreen",
          "skin care",
          "skincare"
        ]
      },
      {
        key: "masks-patches",
        queries: [
          "facial mask eye patch skincare",
          "beauty mask skin care"
        ],
        include: [
          "face mask",
          "facial mask",
          "sheet mask",
          "eye patch",
          "eye mask",
          "lip mask",
          "nose patch"
        ]
      },
      {
        key: "makeup",
        queries: [
          "decorative makeup cosmetics",
          "popular color cosmetics"
        ],
        include: [
          "lipstick",
          "lip gloss",
          "lip tint",
          "mascara",
          "eyeliner",
          "eyeshadow",
          "blush",
          "foundation",
          "concealer",
          "makeup palette"
        ]
      },
      {
        key: "makeup-accessories",
        queries: [
          "makeup accessories beauty",
          "cosmetic applicator accessories"
        ],
        include: [
          "beauty sponge",
          "makeup sponge",
          "makeup puff",
          "makeup brush",
          "cosmetic brush",
          "powder puff",
          "brush cleaner"
        ]
      },
      {
        key: "beauty-devices",
        queries: [
          "small beauty devices",
          "facial beauty massager"
        ],
        include: [
          "facial massager",
          "face massager",
          "eye massager",
          "beauty device",
          "facial cleansing brush",
          "skin scrubber",
          "face roller",
          "gua sha",
          "microcurrent"
        ]
      },
      {
        key: "hair-care",
        queries: [
          "hair care products beauty",
          "hair styling accessories"
        ],
        include: [
          "hair mask",
          "hair serum",
          "hair oil",
          "hair treatment",
          "scalp massager",
          "hair brush",
          "heatless curler",
          "hair roller"
        ]
      },
      {
        key: "body-care",
        queries: [
          "body care cosmetics",
          "bath body personal care"
        ],
        include: [
          "body lotion",
          "body cream",
          "body scrub",
          "hand cream",
          "foot cream",
          "bath salt",
          "shower gel"
        ]
      },
      {
        key: "nail-care",
        queries: [
          "nail care beauty products",
          "nail art accessories"
        ],
        include: [
          "nail polish",
          "gel polish",
          "nail sticker",
          "nail art sticker",
          "press on nail",
          "nail patch",
          "nail decoration"
        ]
      }
    ],
    exclude: [
      "scissor",
      "scissors",
      "nipper",
      "clipper",
      "cutter",
      "cuticle pusher",
      "forceps",
      "tweezer",
      "tweezers",
      "razor blade",
      "knife",
      "manicure tool set",
      "pedicure tool set",
      "surgical",
      "medical equipment",
      "hospital",
      "tattoo machine",
      "salon furniture",
      "barber chair",
      "hair cutting",
      "laser machine",
      "large beauty equipment"
    ]
  },

  "kids": {
    groups: [
      {
        key: "feeding",
        queries: [
          "baby feeding products",
          "toddler tableware feeding"
        ],
        include: [
          "baby bottle",
          "feeding bottle",
          "baby bib",
          "baby bowl",
          "baby plate",
          "sippy cup",
          "feeding spoon"
        ]
      },
      {
        key: "hygiene",
        queries: [
          "baby hygiene products",
          "baby bath care accessories"
        ],
        include: [
          "baby bath",
          "baby towel",
          "baby brush",
          "diaper changing",
          "baby care",
          "baby grooming"
        ]
      },
      {
        key: "safety",
        queries: [
          "child safety products",
          "baby home safety accessories"
        ],
        include: [
          "child safety",
          "baby safety",
          "corner protector",
          "cabinet lock",
          "door stopper",
          "safety gate"
        ]
      },
      {
        key: "travel",
        queries: [
          "baby travel accessories",
          "stroller travel products"
        ],
        include: [
          "stroller accessory",
          "stroller organizer",
          "baby carrier",
          "travel changing mat",
          "car seat accessory"
        ]
      },
      {
        key: "sleep-nursery",
        queries: [
          "baby sleep nursery accessories",
          "nursery daily products"
        ],
        include: [
          "baby pillow",
          "baby blanket",
          "crib accessory",
          "nursery organizer",
          "baby night light",
          "sleep soother"
        ]
      }
    ],
    exclude: [
      "children clothing",
      "baby clothing",
      "children shoes",
      "playground equipment",
      "school furniture",
      "baby furniture factory",
      "industrial",
      "machine"
    ]
  },

  "toys": {
    groups: [
      {
        key: "educational",
        queries: [
          "educational toys children",
          "learning toys kids"
        ],
        include: [
          "educational toy",
          "learning toy",
          "montessori toy",
          "alphabet toy",
          "math toy",
          "science toy"
        ]
      },
      {
        key: "sensory-fidget",
        queries: [
          "sensory toys kids",
          "fidget toys children"
        ],
        include: [
          "sensory toy",
          "fidget toy",
          "stress toy",
          "squishy toy",
          "pop toy"
        ]
      },
      {
        key: "building-puzzles",
        queries: [
          "building blocks puzzles",
          "construction toys kids"
        ],
        include: [
          "building blocks",
          "construction toy",
          "puzzle",
          "jigsaw",
          "magnetic blocks"
        ]
      },
      {
        key: "creative-sets",
        queries: [
          "creative craft toys kids",
          "art activity toy set"
        ],
        include: [
          "craft kit",
          "art set",
          "drawing toy",
          "diy toy",
          "modeling clay",
          "sticker set"
        ]
      },
      {
        key: "role-play",
        queries: [
          "role play toys children",
          "pretend play toy set"
        ],
        include: [
          "role play toy",
          "pretend play",
          "kitchen toy",
          "doctor set",
          "makeup toy",
          "tool toy"
        ]
      },
      {
        key: "interactive",
        queries: [
          "interactive toys kids",
          "electronic learning toys"
        ],
        include: [
          "interactive toy",
          "electronic toy",
          "talking toy",
          "robot toy",
          "musical toy"
        ]
      }
    ],
    exclude: [
      "playground equipment",
      "amusement equipment",
      "inflatable park",
      "arcade machine",
      "vending machine",
      "weapon",
      "knife",
      "airsoft",
      "industrial"
    ]
  },

  "stationery": {
    groups: [
      {
        key: "writing",
        queries: [
          "creative pens pencils stationery",
          "writing stationery products"
        ],
        include: [
          "pen",
          "pencil",
          "marker",
          "highlighter",
          "crayon",
          "writing set"
        ]
      },
      {
        key: "notebooks-planners",
        queries: [
          "notebook planner stationery",
          "journal diary office supplies"
        ],
        include: [
          "notebook",
          "journal",
          "planner",
          "diary",
          "notepad",
          "memo pad"
        ]
      },
      {
        key: "stickers-paper",
        queries: [
          "stationery stickers paper products",
          "memo sticker office supplies"
        ],
        include: [
          "sticker",
          "sticky note",
          "memo paper",
          "note paper",
          "decorative paper",
          "washi tape"
        ]
      },
      {
        key: "cases-organizers",
        queries: [
          "pencil case desk organizer",
          "stationery storage accessories"
        ],
        include: [
          "pencil case",
          "pen case",
          "desk organizer",
          "stationery organizer",
          "document folder",
          "file folder"
        ]
      },
      {
        key: "art-supplies",
        queries: [
          "small art supplies stationery",
          "drawing painting stationery set"
        ],
        include: [
          "drawing set",
          "painting set",
          "art supplies",
          "paint brush",
          "color pencil",
          "sketchbook"
        ]
      }
    ],
    exclude: [
      "printing machine",
      "paper machine",
      "thermal printer",
      "copier",
      "scanner",
      "projector",
      "office furniture",
      "school furniture",
      "industrial"
    ]
  },

  "accessories": {
    groups: [
      {
        key: "hair-accessories",
        queries: [
          "fashion hair accessories",
          "trending hair clips headbands"
        ],
        include: [
          "hair clip",
          "hair claw",
          "headband",
          "scrunchie",
          "hair band",
          "hair pin"
        ]
      },
      {
        key: "jewelry",
        queries: [
          "fashion jewelry accessories",
          "small costume jewelry"
        ],
        include: [
          "earring",
          "necklace",
          "bracelet",
          "ring",
          "brooch",
          "fashion jewelry"
        ]
      },
      {
        key: "wallets-holders",
        queries: [
          "small wallets card holders",
          "personal card accessories"
        ],
        include: [
          "wallet",
          "card holder",
          "coin purse",
          "passport holder",
          "key holder"
        ]
      },
      {
        key: "bag-accessories",
        queries: [
          "bag charms accessories",
          "small bag accessories"
        ],
        include: [
          "bag charm",
          "bag strap",
          "purse accessory",
          "keychain",
          "key ring"
        ]
      },
      {
        key: "phone-fashion",
        queries: [
          "phone charms fashion accessories",
          "decorative phone accessories"
        ],
        include: [
          "phone charm",
          "phone strap",
          "phone lanyard",
          "phone chain"
        ]
      },
      {
        key: "eyewear",
        queries: [
          "fashion eyewear accessories",
          "trending sunglasses"
        ],
        include: [
          "sunglasses",
          "eyeglass chain",
          "glasses case",
          "eyewear"
        ]
      }
    ],
    exclude: [
      "t-shirt",
      "shirt",
      "dress",
      "pants",
      "trousers",
      "jeans",
      "jacket",
      "coat",
      "shoe",
      "slipper",
      "swimsuit",
      "uniform",
      "fabric roll",
      "promotional clothing"
    ]
  },

  "pets": {
    groups: [
      {
        key: "feeding",
        queries: [
          "pet feeding products",
          "cat dog bowls feeders"
        ],
        include: [
          "pet bowl",
          "dog bowl",
          "cat bowl",
          "pet feeder",
          "automatic feeder",
          "pet water fountain"
        ]
      },
      {
        key: "toys",
        queries: [
          "pet toys cat dog",
          "interactive pet toys"
        ],
        include: [
          "pet toy",
          "cat toy",
          "dog toy",
          "chew toy",
          "interactive pet toy",
          "cat teaser"
        ]
      },
      {
        key: "walking",
        queries: [
          "pet walking accessories",
          "dog collar leash harness"
        ],
        include: [
          "pet collar",
          "dog collar",
          "pet leash",
          "dog leash",
          "pet harness",
          "pet walking"
        ]
      },
      {
        key: "grooming",
        queries: [
          "pet grooming products",
          "cat dog grooming accessories"
        ],
        include: [
          "pet grooming",
          "grooming brush",
          "pet comb",
          "pet bath",
          "paw cleaner",
          "pet hair remover"
        ]
      },
      {
        key: "hygiene",
        queries: [
          "pet hygiene products",
          "cat litter accessories"
        ],
        include: [
          "cat litter",
          "litter mat",
          "waste bag",
          "poop bag",
          "litter scoop",
          "pet toilet"
        ]
      },
      {
        key: "beds-travel",
        queries: [
          "pet beds travel accessories",
          "cat dog carrier products"
        ],
        include: [
          "pet bed",
          "cat bed",
          "dog bed",
          "pet carrier",
          "pet travel bag",
          "pet blanket"
        ]
      }
    ],
    exclude: [
      "livestock",
      "poultry",
      "farm equipment",
      "veterinary machine",
      "animal cage factory",
      "large kennel",
      "industrial"
    ]
  },

  "seasonal": {
    groups: [
      {
        key: "christmas",
        queries: [
          "christmas decorations gifts",
          "small christmas ornaments"
        ],
        include: [
          "christmas ornament",
          "christmas decoration",
          "christmas stocking",
          "christmas garland",
          "christmas gift"
        ]
      },
      {
        key: "halloween",
        queries: [
          "halloween decorations party",
          "small halloween accessories"
        ],
        include: [
          "halloween decoration",
          "halloween ornament",
          "halloween party",
          "halloween gift"
        ]
      },
      {
        key: "easter",
        queries: [
          "easter decorations gifts",
          "easter party supplies"
        ],
        include: [
          "easter decoration",
          "easter egg",
          "easter basket",
          "easter gift"
        ]
      },
      {
        key: "party",
        queries: [
          "party table decorations",
          "birthday party supplies"
        ],
        include: [
          "party decoration",
          "birthday decoration",
          "party banner",
          "cake topper",
          "party tableware",
          "balloon"
        ]
      },
      {
        key: "summer",
        queries: [
          "small summer seasonal products",
          "summer leisure accessories"
        ],
        include: [
          "summer accessory",
          "beach accessory",
          "picnic accessory",
          "cooling towel",
          "portable fan"
        ]
      },
      {
        key: "back-to-school",
        queries: [
          "back to school products",
          "school season accessories"
        ],
        include: [
          "back to school",
          "school set",
          "school accessory",
          "lunch bag",
          "pencil case"
        ]
      }
    ],
    exclude: [
      "commercial display",
      "advertising inflatable",
      "large inflatable",
      "stage equipment",
      "event equipment",
      "commercial lighting",
      "large outdoor structure",
      "machine"
    ]
  },

  "gifts": {
    groups: [
      {
        key: "gift-sets",
        queries: [
          "small gift sets",
          "home gift set"
        ],
        include: [
          "gift set",
          "gift collection",
          "present set",
          "gift hamper",
          "home gift"
        ]
      },
      {
        key: "candles-aroma",
        queries: [
          "candle gifts home",
          "aroma gift products"
        ],
        include: [
          "scented candle",
          "candle gift",
          "aroma gift",
          "reed diffuser",
          "fragrance gift",
          "wax melt"
        ]
      },
      {
        key: "frames-keepsakes",
        queries: [
          "photo frame keepsake gifts",
          "memory gifts home"
        ],
        include: [
          "photo frame",
          "picture frame",
          "keepsake",
          "memory box",
          "jewelry box",
          "music box"
        ]
      },
      {
        key: "figurines-souvenirs",
        queries: [
          "small figurine souvenir gifts",
          "decorative collectible gifts"
        ],
        include: [
          "figurine",
          "souvenir",
          "collectible",
          "ornament gift",
          "resin gift",
          "decorative gift"
        ]
      },
      {
        key: "personal-gifts",
        queries: [
          "small personalized gifts",
          "personal keepsake gifts"
        ],
        include: [
          "personalized mug",
          "personalized frame",
          "personalized jewelry",
          "name necklace",
          "engraved gift",
          "custom keepsake"
        ]
      },
      {
        key: "novelty-gifts",
        queries: [
          "small novelty gifts",
          "fun desk gifts"
        ],
        include: [
          "novelty gift",
          "funny gift",
          "desk gift",
          "stress relief toy",
          "mini gift",
          "creative gift"
        ]
      }
    ],
    exclude: [
      "promotional product",
      "promotional gift",
      "corporate gift",
      "corporate events",
      "advertising gift",
      "branding",
      "brand logo",
      "custom logo",
      "printed logo",
      "company logo",
      "promotional pen",
      "promotional bag",
      "non woven bag",
      "shopping bag",
      "t-shirt",
      "polo shirt",
      "uniform",
      "baseball cap",
      "swimming cap",
      "umbrella",
      "lanyard",
      "badge",
      "packaging machine",
      "gift box machine",
      "commercial equipment",
      "large display",
      "cardboard display",
      "industrial"
    ]
  },

  "electronics-accessories": {
    groups: [
      {
        key: "charging",
        queries: [
          "mobile charging accessories",
          "small charging products"
        ],
        include: [
          "charger",
          "wireless charger",
          "charging cable",
          "usb cable",
          "charging station",
          "power bank"
        ]
      },
      {
        key: "phone-holders",
        queries: [
          "phone stand holder accessories",
          "desk phone accessories"
        ],
        include: [
          "phone stand",
          "phone holder",
          "tablet stand",
          "foldable stand",
          "desk holder"
        ]
      },
      {
        key: "audio",
        queries: [
          "small audio accessories",
          "wireless earphone accessories"
        ],
        include: [
          "earphone",
          "headphone",
          "bluetooth speaker",
          "audio adapter",
          "earbud case"
        ]
      },
      {
        key: "smart-trackers",
        queries: [
          "smart tracker accessories",
          "small tracking devices"
        ],
        include: [
          "smart tracker",
          "bluetooth tracker",
          "key finder",
          "gps tracker",
          "anti lost"
        ]
      },
      {
        key: "lighting-gadgets",
        queries: [
          "small electronic lights",
          "portable mini light gadgets"
        ],
        include: [
          "mini light",
          "reading light",
          "night light",
          "cabinet light",
          "portable lamp"
        ]
      },
      {
        key: "computer-accessories",
        queries: [
          "small computer desk accessories",
          "usb computer accessories"
        ],
        include: [
          "usb hub",
          "mouse pad",
          "keyboard accessory",
          "laptop stand",
          "cable organizer"
        ]
      }
    ],
    exclude: [
      "industrial computer",
      "motherboard",
      "server",
      "network cabinet",
      "car electronics",
      "automotive",
      "production line",
      "electronic component",
      "circuit board",
      "machine"
    ]
  },

  "other": {
    groups: [
      {
        key: "daily-use",
        queries: [
          "innovative daily use products",
          "creative household consumer products"
        ],
        include: [
          "daily use",
          "household product",
          "consumer product",
          "portable",
          "compact"
        ]
      },
      {
        key: "novelty",
        queries: [
          "creative novelty products",
          "small innovative gifts"
        ],
        include: [
          "novelty",
          "creative product",
          "innovative product",
          "new design"
        ]
      },
      {
        key: "travel",
        queries: [
          "small travel accessories",
          "portable travel products"
        ],
        include: [
          "travel accessory",
          "portable organizer",
          "travel bottle",
          "travel pouch"
        ]
      }
    ],
    exclude: [
      "industrial",
      "commercial equipment",
      "machine",
      "production line",
      "construction",
      "building material",
      "vehicle part",
      "raw material"
    ]
  }
};

const ALIEXPRESS_CACHE_TTL_MS =
  20 * 60 * 1000;

const aliexpressPageCache =
  new Map();

const aliexpressImageCache =
  new Map();

const ALIEXPRESS_IMAGE_CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

const madeInChinaImageCache =
  new Map();

const MADE_IN_CHINA_IMAGE_CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

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

  const signalWords =
    signalConfig.queryWords[0];

  const queryCandidates =
    categoryConfig.queries.map(
      categoryQuery =>
        [
          categoryQuery,
          signalWords,
          details
        ]
          .filter(Boolean)
          .join(" ")
    );

  return [
    ...new Set(
      queryCandidates.map(query =>
        cleanTrendText(query, 240)
      )
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
        Authorization:
          `Bearer ${process.env.JINA_API_KEY}`,
        Accept:
          "application/json",
        "X-Respond-With":
          "markdown",
        "X-With-Links-Summary":
          "false",
        "X-With-Images-Summary":
          "true",
        "X-Retain-Images":
          "all",
        "X-Timeout":
          "20"
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

  const responseData =
    await response.json();

  const searchResults =
    Array.isArray(responseData?.data)
      ? responseData.data
      : [];

  if (!searchResults.length) {
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
    html:
      JSON.stringify(searchResults),
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
  let searchResults = [];

  try {
    const parsed =
      JSON.parse(
        String(html || "[]")
      );

    searchResults =
      Array.isArray(parsed)
        ? parsed
        : [];
  } catch {
    return [];
  }

  const products = [];
  const seenProductIds =
    new Set();

  const blockedTitles = [
    "i'm shopping for",
    "feedback",
    "aliexpress",
    "shop now",
    "sign in",
    "register",
    "help center",
    "buyer protection",
    "download app",
    "customer service"
  ];

  for (
    const searchResult
    of searchResults
  ) {
    const rawUrl =
      String(
        searchResult?.url || ""
      );

    const productMatch =
      rawUrl.match(
        /aliexpress\.[^/]+\/item\/(\d+)\.html/i
      );

    if (!productMatch?.[1]) {
      continue;
    }

    const productId =
      productMatch[1];

    if (
      seenProductIds.has(
        productId
      )
    ) {
      continue;
    }

    const title =
      cleanTrendText(
        decodeHtmlEntities(
          searchResult?.title || ""
        ),
        300
      );

    const normalizedTitle =
      normalizeChinaText(
        title
      );

    if (
      !title ||
      title.length < 12 ||
      blockedTitles.some(
        blockedTitle =>
          normalizedTitle ===
            blockedTitle ||
          normalizedTitle.startsWith(
            `${blockedTitle} `
          )
      )
    ) {
      continue;
    }

    const description =
      cleanTrendText(
        decodeHtmlEntities(
          searchResult?.description ||
          searchResult?.content ||
          ""
        ),
        500
      );

    const imageCandidates = [];

    if (Array.isArray(searchResult?.images)) {
      imageCandidates.push(
        ...searchResult.images
      );
    } else if (
      searchResult?.images &&
      typeof searchResult.images === "object"
    ) {
      imageCandidates.push(
        ...Object.values(
          searchResult.images
        )
      );
    }

    if (searchResult?.image) {
      imageCandidates.push(
        searchResult.image
      );
    }

    const resultContent =
      String(
        searchResult?.content ||
        searchResult?.description ||
        ""
      );

    for (
      const imageMatch
      of resultContent.matchAll(
        /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi
      )
    ) {
      imageCandidates.push(
        imageMatch[1]
      );
    }

    const imageUrl =
      imageCandidates
        .map(candidate =>
          typeof candidate === "string"
            ? candidate
            : (
                candidate?.url ||
                candidate?.src ||
                ""
              )
        )
        .map(candidate =>
          decodeHtmlEntities(
            String(candidate || "")
          )
            .replace(/\\u002F/g, "/")
            .replace(/\\\//g, "/")
        )
        .find(candidate => {
          const normalized =
            candidate.toLocaleLowerCase(
              "en-US"
            );

          return (
            (
              normalized.includes(
                "alicdn"
              ) ||
              normalized.includes(
                "aliexpress-media"
              )
            ) &&
            !normalized.includes(
              "48x48"
            ) &&
            !normalized.includes(
              "32x32"
            ) &&
            !normalized.includes(
              "16x16"
            ) &&
            !normalized.includes(
              "logo"
            ) &&
            !normalized.includes(
              "icon"
            ) &&
            !normalized.includes(
              "avatar"
            )
          );
        }) || null;

    const link =
      `${chinaConfig.domain}/item/${productId}.html`;

    seenProductIds.add(
      productId
    );

    products.push({
      productId,
      title,
      description,
      link,
      imageUrl:
        imageUrl &&
        (
          imageUrl.includes(
            "alicdn"
          ) ||
          imageUrl.includes(
            "aliexpress-media"
          )
        )
          ? imageUrl
          : null,
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

async function loadAliExpressProductImage(
  product
) {
  if (product.imageUrl) {
    return product;
  }

  const cachedImage =
    aliexpressImageCache.get(
      product.productId
    );

  if (
    cachedImage &&
    Date.now() -
      cachedImage.savedAt <
      ALIEXPRESS_IMAGE_CACHE_TTL_MS
  ) {
    return {
      ...product,
      imageUrl:
        cachedImage.imageUrl || null
    };
  }

  const metadataUrl =
    new URL(
      "https://api.microlink.io"
    );

  metadataUrl.searchParams.set(
    "url",
    product.link
  );

  metadataUrl.searchParams.set(
    "screenshot",
    "true"
  );

  metadataUrl.searchParams.set(
    "screenshot.type",
    "jpeg"
  );

  metadataUrl.searchParams.set(
    "screenshot.fullPage",
    "false"
  );

  metadataUrl.searchParams.set(
    "viewport.width",
    "1000"
  );

  metadataUrl.searchParams.set(
    "viewport.height",
    "800"
  );

  metadataUrl.searchParams.set(
    "video",
    "false"
  );

  metadataUrl.searchParams.set(
    "audio",
    "false"
  );

  metadataUrl.searchParams.set(
    "palette",
    "false"
  );

  try {
    const response = await fetch(
      metadataUrl,
      {
        method:
          "GET",
        headers: {
          Accept:
            "application/json"
        },
        signal:
          AbortSignal.timeout(
            15000
          )
      }
    );

    if (!response.ok) {
      aliexpressImageCache.set(
        product.productId,
        {
          savedAt:
            Date.now(),
          imageUrl:
            null
        }
      );

      return product;
    }

    const responseData =
      await response.json();

    const pageData =
      responseData?.data || {};

    const imageCandidates = [
      pageData?.image,
      pageData?.screenshot
    ]
      .map(imageValue =>
        typeof imageValue === "string"
          ? imageValue
          : (
              imageValue?.url ||
              imageValue?.src ||
              ""
            )
      )
      .map(imageUrl =>
        String(imageUrl || "")
          .replace(/\\u002F/g, "/")
          .replace(/\\\//g, "/")
          .trim()
      )
      .filter(Boolean);

    const imageUrl =
      imageCandidates.find(
        candidate => {
          try {
            const parsedUrl =
              new URL(candidate);

            return (
              parsedUrl.protocol ===
                "https:" ||
              parsedUrl.protocol ===
                "http:"
            );
          } catch {
            return false;
          }
        }
      ) || null;

    aliexpressImageCache.set(
      product.productId,
      {
        savedAt:
          Date.now(),
        imageUrl
      }
    );

    return {
      ...product,
      imageUrl
    };
  } catch {
    aliexpressImageCache.set(
      product.productId,
      {
        savedAt:
          Date.now(),
        imageUrl:
          null
      }
    );

    return product;
  }
}

function buildChinaProductFingerprint(
  title
) {
  const ignoredWords =
    new Set([
      "new",
      "arrival",
      "arrivals",
      "latest",
      "creative",
      "smart",
      "fashion",
      "portable",
      "modern",
      "cute",
      "home",
      "kitchen",
      "pet",
      "dog",
      "cat",
      "gift",
      "gifts",
      "decor",
      "products",
      "product",
      "supplies",
      "accessories",
      "accessory"
    ]);

  return getChinaWords(title)
    .filter(word =>
      word.length >= 4 &&
      !ignoredWords.has(word)
    )
    .slice(0, 6)
    .join(" ");
}

function selectDiverseChinaProducts(
  rankedProducts,
  limit
) {
  const selectedProducts = [];
  const selectedIds =
    new Set();
  const seenFingerprints =
    new Set();

  for (
    const product
    of rankedProducts
  ) {
    const fingerprint =
      buildChinaProductFingerprint(
        product.title
      );

    const productWords =
      getChinaWords(
        product.title
      ).filter(word =>
        word.length >= 4
      );

    const hasNearDuplicate =
      selectedProducts.some(
        selectedProduct => {
          const selectedWords =
            getChinaWords(
              selectedProduct.title
            ).filter(word =>
              word.length >= 4
            );

          const overlap =
            productWords.filter(word =>
              selectedWords.includes(
                word
              )
            ).length;

          return overlap >= 4;
        }
      );

    if (
      selectedIds.has(
        product.productId
      ) ||
      (
        fingerprint &&
        seenFingerprints.has(
          fingerprint
        )
      ) ||
      hasNearDuplicate
    ) {
      continue;
    }

    selectedProducts.push(
      product
    );

    selectedIds.add(
      product.productId
    );

    if (fingerprint) {
      seenFingerprints.add(
        fingerprint
      );
    }

    if (
      selectedProducts.length >=
      limit
    ) {
      return selectedProducts;
    }
  }

  for (
    const product
    of rankedProducts
  ) {
    if (
      selectedIds.has(
        product.productId
      )
    ) {
      continue;
    }

    selectedProducts.push(
      product
    );

    selectedIds.add(
      product.productId
    );

    if (
      selectedProducts.length >=
      limit
    ) {
      break;
    }
  }

  return selectedProducts;
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
        const searchableText =
          [
            product.title,
            product.description
          ]
            .filter(Boolean)
            .join(" ");

        if (
          matchesExclusions(
            searchableText,
            exclusions
          )
        ) {
          continue;
        }

        const categoryScore =
          getChinaCategoryScore(
            searchableText,
            category
          );

        if (categoryScore <= 1) {
          continue;
        }

        const queryScore =
          getChinaQueryScore(
            searchableText,
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

        if (
          !currentProduct.imageUrl &&
          product.imageUrl
        ) {
          currentProduct.imageUrl =
            product.imageUrl;
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

  const rankedProducts = [
    ...productsById.values()
  ]
    .map(product => {
      const positionScore =
        Math.max(
          0,
          30 -
          Number(
            product.bestPosition || 30
          )
        );

      const diversityBonus =
        Math.min(
          product.matchedQueries.length,
          3
        ) * 6;

      const relevanceScore =
        product.categoryScore * 20 +
        product.queryScore * 10 +
        product.occurrenceCount * 8 +
        positionScore +
        diversityBonus +
        (
          product.imageUrl
            ? 4
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
        second.categoryScore -
        first.categoryScore ||
        second.queryScore -
        first.queryScore ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(0, 40);

  const selectedProducts =
    selectDiverseChinaProducts(
      rankedProducts,
      15
    );

  const productsWithImages =
    new Array(
      selectedProducts.length
    );

  let nextProductIndex = 0;

  async function loadNextProductImage() {
    while (
      nextProductIndex <
      selectedProducts.length
    ) {
      const currentIndex =
        nextProductIndex;

      nextProductIndex += 1;

      productsWithImages[
        currentIndex
      ] =
        await loadAliExpressProductImage(
          selectedProducts[
            currentIndex
          ]
        );
    }
  }

  const imageWorkers =
    Array.from(
      {
        length:
          Math.min(
            8,
            selectedProducts.length
          )
      },
      () =>
        loadNextProductImage()
    );

  await Promise.all(
    imageWorkers
  );

  const products =
    productsWithImages.map(
      (product, index) => ({
        ...product,
        sourcePosition:
          index + 1
      })
    );

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

function buildMadeInChinaQueries(
  category,
  signalType,
  searchDetails
) {
  const categoryConfig =
    MADE_IN_CHINA_CATEGORY_CONFIG[
      category
    ] ||
    MADE_IN_CHINA_CATEGORY_CONFIG.other;

  const signalConfig =
    MADE_IN_CHINA_SIGNAL_CONFIG[
      signalType
    ] ||
    MADE_IN_CHINA_SIGNAL_CONFIG.all;

  const details =
    cleanTrendText(
      searchDetails,
      160
    );

  const queryItems = [];

  for (
    const group
    of categoryConfig.groups
  ) {
    for (
      const categoryQuery
      of group.queries
    ) {
      const searchQuery =
        cleanTrendText(
          [
            categoryQuery,
            signalConfig.queryWords,
            details
          ]
            .filter(Boolean)
            .join(" "),
          220
        );

      if (!searchQuery) {
        continue;
      }

      queryItems.push({
        searchQuery,
        subgroup:
          group.key
      });
    }
  }

  const uniqueItems = [];
  const seenQueries =
    new Set();

  for (
    const queryItem
    of queryItems
  ) {
    const queryKey =
      queryItem.searchQuery
        .toLocaleLowerCase(
          "en-US"
        );

    if (
      seenQueries.has(
        queryKey
      )
    ) {
      continue;
    }

    seenQueries.add(
      queryKey
    );

    uniqueItems.push(
      queryItem
    );
  }

  return uniqueItems;
}

function buildMadeInChinaSearchUrl(
  searchQuery
) {
  const slug =
    cleanTrendText(
      searchQuery,
      220
    )
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
      )
      .join("_");

  return (
    `${MADE_IN_CHINA_SOURCE_CONFIG.domain}` +
    `/products-search/hot-china-products/` +
    `${slug || "Consumer_Products"}.html`
  );
}

function getMadeInChinaImageUrl(
  productHtml,
  productTitle
) {
  const imageCandidates = [];

  const normalizedTitle =
    normalizeChinaText(
      productTitle
    );

  const titleWords =
    getChinaWords(
      productTitle
    );

  const imageTags = [
    ...String(
      productHtml || ""
    ).matchAll(
      /<img\b[^>]*>/gi
    )
  ];

  for (
    const imageMatch
    of imageTags
  ) {
    const imageTag =
      imageMatch[0];

    const altMatch =
      imageTag.match(
        /\balt=["']([^"']*)["']/i
      );

    const altText =
      cleanTrendText(
        decodeHtmlEntities(
          altMatch?.[1] || ""
        ),
        300
      );

    const normalizedAlt =
      normalizeChinaText(
        altText
      );

    const sources = [];

    const srcsetMatch =
      imageTag.match(
        /\bsrcset=["']([^"']+)["']/i
      );

    if (srcsetMatch?.[1]) {
      const srcsetSources =
        srcsetMatch[1]
          .split(",")
          .map(item => {
            const parts =
              item.trim().split(/\s+/);

            const widthMatch =
              String(
                parts[1] || ""
              ).match(
                /(\d+)w/i
              );

            return {
              url:
                parts[0],
              width:
                Number(
                  widthMatch?.[1]
                ) || 0
            };
          });

      sources.push(
        ...srcsetSources
      );
    }

    const attributeNames = [
      "data-original",
      "data-src",
      "data-lazy-src",
      "data-image",
      "src"
    ];

    for (
      const attributeName
      of attributeNames
    ) {
      const attributeMatch =
        imageTag.match(
          new RegExp(
            `\\b${attributeName}=["']([^"']+)["']`,
            "i"
          )
        );

      if (attributeMatch?.[1]) {
        sources.push({
          url:
            attributeMatch[1],
          width:
            0
        });
      }
    }

    for (
      const source
      of sources
    ) {
      try {
        const rawUrl =
          decodeHtmlEntities(
            source.url
          )
            .replace(/\\u002F/g, "/")
            .replace(/\\\//g, "/");

        const imageUrl =
          rawUrl.startsWith("//")
            ? `https:${rawUrl}`
            : new URL(
                rawUrl,
                MADE_IN_CHINA_SOURCE_CONFIG.domain
              ).toString();

        const normalizedUrl =
          imageUrl.toLocaleLowerCase(
            "en-US"
          );

        const blockedImage =
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
            "avatar"
          ) ||
          normalizedUrl.includes(
            "blank"
          ) ||
          normalizedUrl.includes(
            "loading"
          ) ||
          normalizedUrl.includes(
            "default"
          ) ||
          normalizedUrl.includes(
            "company"
          ) ||
          normalizedUrl.endsWith(
            ".gif"
          ) ||
          normalizedUrl.endsWith(
            ".svg"
          );

        if (blockedImage) {
          continue;
        }

        const matchingWords =
          titleWords.filter(word =>
            normalizedAlt.includes(
              word
            ) ||
            normalizedUrl.includes(
              word
            )
          ).length;

        const exactTitleBonus =
          normalizedAlt &&
          normalizedTitle &&
          (
            normalizedAlt.includes(
              normalizedTitle
            ) ||
            normalizedTitle.includes(
              normalizedAlt
            )
          )
            ? 20
            : 0;

        const productImageBonus =
          normalizedUrl.includes(
            "product"
          ) ||
          normalizedUrl.includes(
            "photo"
          ) ||
          normalizedUrl.includes(
            "image"
          )
            ? 5
            : 0;

        imageCandidates.push({
          imageUrl,
          score:
            exactTitleBonus +
            matchingWords * 5 +
            productImageBonus +
            Math.min(
              Number(source.width) || 0,
              1000
            ) / 100
        });
      } catch {
        continue;
      }
    }
  }

  imageCandidates.sort(
    (first, second) =>
      second.score -
      first.score
  );

  return (
    imageCandidates[0]
      ?.imageUrl ||
    null
  );
}

function getMadeInChinaProductProfile(
  title,
  category,
  preferredSubgroup
) {
  const categoryConfig =
    MADE_IN_CHINA_CATEGORY_CONFIG[
      category
    ] ||
    MADE_IN_CHINA_CATEGORY_CONFIG.other;

  const normalizedTitle =
    normalizeChinaText(
      title
    );

  const isExcluded =
    categoryConfig.exclude.some(
      phrase =>
        normalizedTitle.includes(
          normalizeChinaText(
            phrase
          )
        )
    );

  if (isExcluded) {
    return {
      retailScore:
        -20,
      subgroup:
        null
    };
  }

  let bestGroup =
    null;

  let bestScore =
    0;

  for (
    const group
    of categoryConfig.groups
  ) {
    const matchedPhrases =
      group.include.filter(
        phrase =>
          normalizedTitle.includes(
            normalizeChinaText(
              phrase
            )
          )
      );

    if (!matchedPhrases.length) {
      continue;
    }

    const exactPhraseBonus =
      matchedPhrases.some(
        phrase =>
          normalizedTitle ===
            normalizeChinaText(
              phrase
            ) ||
          normalizedTitle.startsWith(
            `${normalizeChinaText(
              phrase
            )} `
          )
      )
        ? 4
        : 0;

    const preferredBonus =
      group.key ===
        preferredSubgroup
        ? 3
        : 0;

    const groupScore =
      5 +
      matchedPhrases.length * 3 +
      exactPhraseBonus +
      preferredBonus;

    if (
      groupScore >
      bestScore
    ) {
      bestScore =
        groupScore;

      bestGroup =
        group.key;
    }
  }

  return {
    retailScore:
      Math.min(
        bestScore,
        20
      ),
    subgroup:
      bestGroup
  };
}

function extractMadeInChinaProducts(
  html,
  category,
  searchQuery,
  preferredSubgroup,
  exclusions
) {
  const sourceHtml =
    String(html || "");

  const products = [];
  const seenLinks =
    new Set();

  const anchorPattern =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  const blockedTitles = [
    "view more",
    "view more 008",
    "view larger video image",
    "send inquiry",
    "start order",
    "contact now",
    "add to inquiry basket",
    "favorites",
    "product list",
    "supplier list",
    "gallery view",
    "list view",
    "learn more",
    "details",
    "more",
    "inquiry now"
  ];

  for (
    const anchorMatch
    of sourceHtml.matchAll(
      anchorPattern
    )
  ) {
    const rawLink =
      decodeHtmlEntities(
        anchorMatch[1]
      );

    const anchorHtml =
      String(
        anchorMatch[2] || ""
      );

    const title =
      cleanTrendText(
        stripHtml(
          anchorHtml
        ),
        300
      )
        .replace(
          /&#x?[0-9a-f]+;?/gi,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    if (
      !title ||
      title.length < 18
    ) {
      continue;
    }

    const normalizedTitle =
      normalizeChinaText(
        title
      );

    if (
      blockedTitles.some(
        blockedTitle =>
          normalizedTitle ===
            blockedTitle ||
          normalizedTitle.startsWith(
            `${blockedTitle} `
          )
      ) ||
      /^view more\b/i.test(
        normalizedTitle
      )
    ) {
      continue;
    }

    let link;

    try {
      link =
        new URL(
          rawLink,
          MADE_IN_CHINA_SOURCE_CONFIG.domain
        ).toString();
    } catch {
      continue;
    }

    const normalizedLink =
      link.toLocaleLowerCase(
        "en-US"
      );

    const isProductLink =
      normalizedLink.includes(
        "made-in-china.com"
      ) &&
      normalizedLink.includes(
        ".html"
      ) &&
      !normalizedLink.includes(
        "/products-search/"
      ) &&
      !normalizedLink.includes(
        "/company-"
      ) &&
      !normalizedLink.includes(
        "/help/"
      ) &&
      !normalizedLink.includes(
        "/info/"
      ) &&
      !normalizedLink.includes(
        "/service/"
      );

    if (!isProductLink) {
      continue;
    }

    if (
      seenLinks.has(
        normalizedLink
      )
    ) {
      continue;
    }

    const anchorIndex =
      Number(anchorMatch.index) || 0;

    const previousCardStart =
      Math.max(
        sourceHtml.lastIndexOf(
          '<div class="product',
          anchorIndex
        ),
        sourceHtml.lastIndexOf(
          '<div class="item',
          anchorIndex
        ),
        sourceHtml.lastIndexOf(
          "<li",
          anchorIndex
        )
      );

    const contextStart =
      previousCardStart >= 0 &&
      anchorIndex -
        previousCardStart <
        5000
        ? previousCardStart
        : Math.max(
            0,
            anchorIndex - 900
          );

    const nextCardIndexes = [
      sourceHtml.indexOf(
        '<div class="product',
        anchorIndex + 1
      ),
      sourceHtml.indexOf(
        '<div class="item',
        anchorIndex + 1
      ),
      sourceHtml.indexOf(
        "<li",
        anchorIndex + 1
      )
    ]
      .filter(index =>
        index > anchorIndex
      );

    const nearestNextCard =
      nextCardIndexes.length
        ? Math.min(
            ...nextCardIndexes
          )
        : -1;

    const contextEnd =
      nearestNextCard > anchorIndex &&
      nearestNextCard -
        anchorIndex <
        6000
        ? nearestNextCard
        : Math.min(
            sourceHtml.length,
            anchorIndex + 2600
          );

    const contextHtml =
      sourceHtml.slice(
        contextStart,
        contextEnd
      );

    const contextText =
      cleanTrendText(
        stripHtml(
          contextHtml
        ),
        1400
      );

    if (
      matchesExclusions(
        title,
        exclusions
      )
    ) {
      continue;
    }

    const productProfile =
      getMadeInChinaProductProfile(
        title,
        category,
        preferredSubgroup
      );

    if (
      productProfile.retailScore <= 0 ||
      !productProfile.subgroup
    ) {
      continue;
    }

    const retailScore =
      productProfile.retailScore;

    const subgroup =
      productProfile.subgroup;

    const categoryScore =
      getChinaCategoryScore(
        title,
        category
      );

    const queryScore =
      getChinaQueryScore(
        title,
        searchQuery
      );
    
    const priceMatch =
      contextText.match(
        /US\$\s*[\d.,]+(?:\s*-\s*[\d.,]+)?/i
      );

    const moqMatch =
      contextText.match(
        /\d[\d,\s]*\s+(?:Piece|Pieces|Set|Sets|Unit|Units|Pair|Pairs)\s+\(MOQ\)/i
      );

    const companyMatch =
      contextText.match(
        /([A-Z][A-Za-z0-9&.,'()\-\s]{6,120}(?:Co\.,?\s*Ltd\.?|Company Limited|Corporation))/i
      );

    const descriptionParts = [];

    if (priceMatch?.[0]) {
      descriptionParts.push(
        priceMatch[0]
      );
    }

    if (moqMatch?.[0]) {
      descriptionParts.push(
        moqMatch[0]
      );
    }

    if (companyMatch?.[1]) {
      descriptionParts.push(
        cleanTrendText(
          companyMatch[1],
          160
        )
      );
    }

    const directImageUrl =
      getMadeInChinaImageUrl(
        anchorHtml,
        title
      );

    const contextImageUrl =
      directImageUrl ||
      getMadeInChinaImageUrl(
        contextHtml,
        title
      );

    seenLinks.add(
      normalizedLink
    );

    products.push({
      productId:
        normalizedLink,
      title,
      description:
        descriptionParts.join(" · ") ||
        "Товар знайдений у каталозі китайських виробників.",
      link,
      imageUrl:
        contextImageUrl,
      categoryScore,
      retailScore,
      queryScore,
      subgroup,
      sourcePosition:
        products.length + 1
    });

    if (
      products.length >= 50
    ) {
      break;
    }
  }

  return products;
}

async function loadMadeInChinaProductImage(
  product
) {
  const cachedImage =
    madeInChinaImageCache.get(
      product.productId
    );

  if (
    cachedImage &&
    Date.now() -
      cachedImage.savedAt <
      MADE_IN_CHINA_IMAGE_CACHE_TTL_MS
  ) {
    return {
      ...product,
      imageUrl:
        cachedImage.imageUrl ||
        product.imageUrl ||
        null
    };
  }

  try {
    const response = await fetch(
      product.link,
      {
        method:
          "GET",
        headers: {
          Accept:
            "text/html,application/xhtml+xml",
          "Accept-Language":
            "en-US,en;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/124 Safari/537.36"
        },
        redirect:
          "follow",
        signal:
          AbortSignal.timeout(
            8000
          )
      }
    );

    if (!response.ok) {
      throw new Error(
        `MADE_IN_CHINA_IMAGE_${response.status}`
      );
    }

    const finalPageUrl =
      response.url ||
      product.link;

    const productHtml =
      await response.text();

    const imageCandidates = [];

    const contentImageUrl =
      getMadeInChinaImageUrl(
        productHtml,
        product.title
      );

    if (contentImageUrl) {
      imageCandidates.push({
        url:
          contentImageUrl,
        priority:
          100
      });
    }

    const metaPatterns = [
      /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i,
      /<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i,
      /<link\b[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["'][^>]*>/i,
      /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']image_src["'][^>]*>/i
    ];

    for (
      const pattern
      of metaPatterns
    ) {
      const match =
        productHtml.match(
          pattern
        );

      if (match?.[1]) {
        imageCandidates.push({
          url:
            match[1],
          priority:
            70
        });
      }
    }

    const jsonLdPattern =
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

    for (
      const jsonMatch
      of productHtml.matchAll(
        jsonLdPattern
      )
    ) {
      try {
        const parsed =
          JSON.parse(
            jsonMatch[1]
          );

        const jsonItems =
          Array.isArray(parsed)
            ? parsed
            : (
                Array.isArray(
                  parsed?.["@graph"]
                )
                  ? parsed["@graph"]
                  : [parsed]
              );

        for (
          const jsonItem
          of jsonItems
        ) {
          const imageValue =
            jsonItem?.image;

          if (
            typeof imageValue ===
            "string"
          ) {
            imageCandidates.push({
              url:
                imageValue,
              priority:
                90
            });
          } else if (
            Array.isArray(
              imageValue
            )
          ) {
            for (
              const imageItem
              of imageValue
            ) {
              imageCandidates.push({
                url:
                  typeof imageItem ===
                    "string"
                    ? imageItem
                    : (
                        imageItem?.url ||
                        imageItem?.contentUrl ||
                        ""
                      ),
                priority:
                  90
              });
            }
          } else if (
            imageValue?.url ||
            imageValue?.contentUrl
          ) {
            imageCandidates.push({
              url:
                imageValue.url ||
                imageValue.contentUrl,
              priority:
                90
            });
          }
        }
      } catch {
        continue;
      }
    }

    const preparedImages =
      imageCandidates
        .map(candidate => {
          const rawUrl =
            decodeHtmlEntities(
              String(
                candidate.url || ""
              )
            )
              .replace(/\\u002F/g, "/")
              .replace(/\\\//g, "/")
              .trim();

          if (!rawUrl) {
            return null;
          }

          try {
            const imageUrl =
              rawUrl.startsWith("//")
                ? `https:${rawUrl}`
                : new URL(
                    rawUrl,
                    finalPageUrl
                  ).toString();

            const normalizedUrl =
              imageUrl.toLocaleLowerCase(
                "en-US"
              );

            const blockedImage =
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
                "avatar"
              ) ||
              normalizedUrl.includes(
                "default"
              ) ||
              normalizedUrl.includes(
                "loading"
              ) ||
              normalizedUrl.includes(
                "placeholder"
              ) ||
              normalizedUrl.includes(
                "banner"
              ) ||
              normalizedUrl.endsWith(
                ".svg"
              ) ||
              normalizedUrl.endsWith(
                ".gif"
              );

            if (blockedImage) {
              return null;
            }

            return {
              imageUrl,
              priority:
                candidate.priority
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort(
          (first, second) =>
            second.priority -
            first.priority
        );

    const imageUrl =
      preparedImages[0]
        ?.imageUrl ||
      product.imageUrl ||
      null;

    madeInChinaImageCache.set(
      product.productId,
      {
        savedAt:
          Date.now(),
        imageUrl
      }
    );

    return {
      ...product,
      imageUrl
    };
  } catch {
    const imageUrl =
      product.imageUrl ||
      null;

    madeInChinaImageCache.set(
      product.productId,
      {
        savedAt:
          Date.now(),
        imageUrl
      }
    );

    return {
      ...product,
      imageUrl
    };
  }
}

function selectBalancedMadeInChinaProducts(
  rankedProducts,
  limit
) {
  const selectedProducts = [];
  const selectedIds =
    new Set();

  const subgroupCounts =
    new Map();

  const maxPerSubgroup =
    3;

  const blockedLargeProductPhrases = [
    "cold storage room",
    "cold room",
    "storage room",
    "container room",
    "container house",
    "modular house",
    "prefabricated house",
    "prefab house",
    "portable house",
    "mobile house",
    "warehouse",
    "warehouse rack",
    "storage warehouse",
    "industrial storage",
    "commercial storage",
    "walk in freezer",
    "walk in cooler",
    "refrigeration room",
    "refrigerated room",
    "production line",
    "processing line",
    "assembly line",
    "conveyor",
    "conveyor belt",
    "chain conveyor",
    "injection mould",
    "injection mold",
    "plastic mould",
    "plastic mold",
    "molding machine",
    "moulding machine",
    "industrial machine",
    "commercial machine",
    "factory equipment",
    "industrial equipment",
    "commercial equipment",
    "workshop equipment",
    "restaurant equipment",
    "hotel equipment",
    "supermarket equipment",
    "large capacity",
    "heavy duty",
    "customized project",
    "turnkey project"
  ];

  const genericTitleWords =
    new Set([
      "new",
      "latest",
      "design",
      "product",
      "products",
      "custom",
      "customized",
      "creative",
      "modern",
      "popular",
      "best",
      "selling",
      "sale",
      "high",
      "quality",
      "home",
      "household",
      "kitchen",
      "accessory",
      "accessories"
    ]);

  function isBlockedLargeProduct(
    product
  ) {
    const normalizedTitle =
      normalizeChinaText(
        product.title
      );

    return blockedLargeProductPhrases.some(
      phrase =>
        normalizedTitle.includes(
          normalizeChinaText(
            phrase
          )
        )
    );
  }

  function getComparableWords(
    title
  ) {
    return getChinaWords(
      title
    ).filter(word =>
      word.length >= 4 &&
      !genericTitleWords.has(
        word
      )
    );
  }

  function isNearDuplicate(
    product
  ) {
    const productTitle =
      normalizeChinaText(
        product.title
      );

    const productWords =
      getComparableWords(
        product.title
      );

    return selectedProducts.some(
      selectedProduct => {
        const selectedTitle =
          normalizeChinaText(
            selectedProduct.title
          );

        if (
          productTitle ===
          selectedTitle
        ) {
          return true;
        }

        if (
          productTitle.length >= 18 &&
          selectedTitle.length >= 18 &&
          (
            productTitle.includes(
              selectedTitle
            ) ||
            selectedTitle.includes(
              productTitle
            )
          )
        ) {
          return true;
        }

        const selectedWords =
          getComparableWords(
            selectedProduct.title
          );

        const overlap =
          productWords.filter(word =>
            selectedWords.includes(
              word
            )
          ).length;

        const shorterLength =
          Math.min(
            productWords.length,
            selectedWords.length
          );

        if (shorterLength < 2) {
          return false;
        }

        const overlapRatio =
          overlap /
          shorterLength;

        if (
          product.subgroup ===
            selectedProduct.subgroup &&
          overlapRatio >= 0.5
        ) {
          return true;
        }

        return (
          shorterLength >= 3 &&
          overlapRatio >= 0.65
        );
      }
    );
  }

  function canAddProduct(
    product,
    checkSubgroupLimit
  ) {
    if (
      selectedIds.has(
        product.productId
      ) ||
      isBlockedLargeProduct(
        product
      ) ||
      isNearDuplicate(
        product
      )
    ) {
      return false;
    }

    if (!checkSubgroupLimit) {
      return true;
    }

    const subgroup =
      product.subgroup ||
      "other";

    const subgroupCount =
      subgroupCounts.get(
        subgroup
      ) || 0;

    return (
      subgroupCount <
      maxPerSubgroup
    );
  }

  function addProduct(
    product
  ) {
    const subgroup =
      product.subgroup ||
      "other";

    selectedProducts.push(
      product
    );

    selectedIds.add(
      product.productId
    );

    subgroupCounts.set(
      subgroup,
      (
        subgroupCounts.get(
          subgroup
        ) || 0
      ) + 1
    );
  }

  for (
    const product
    of rankedProducts
  ) {
    if (
      !canAddProduct(
        product,
        true
      )
    ) {
      continue;
    }

    addProduct(
      product
    );

    if (
      selectedProducts.length >=
      limit
    ) {
      return selectedProducts;
    }
  }

  for (
    const product
    of rankedProducts
  ) {
    if (
      !canAddProduct(
        product,
        false
      )
    ) {
      continue;
    }

    addProduct(
      product
    );

    if (
      selectedProducts.length >=
      limit
    ) {
      break;
    }
  }

  return selectedProducts;
}

async function loadMadeInChinaSignal({
  category,
  signalType,
  searchDetails,
  exclusions
}) {
  const searchQueries =
    buildMadeInChinaQueries(
      category,
      signalType,
      searchDetails
    );

  const productsById =
    new Map();

  const checkedSources = [];
  let totalExtracted = 0;
  let successfulRequests = 0;
  let firstError = null;

  for (
    const queryItem
    of searchQueries
  ) {
    const searchQuery =
      queryItem.searchQuery;

    const preferredSubgroup =
      queryItem.subgroup;

    const sourceUrl =
      buildMadeInChinaSearchUrl(
        searchQuery
      );

    try {
      const response = await fetch(
        sourceUrl,
        {
          method:
            "GET",
          headers: {
            Accept:
              "text/html,application/xhtml+xml",
            "Accept-Language":
              "en-US,en;q=0.9",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
              "AppleWebKit/537.36 Chrome/124 Safari/537.36"
          },
          redirect:
            "follow",
          signal:
            AbortSignal.timeout(
              15000
            )
        }
      );

      if (!response.ok) {
        throw new Error(
          `MADE_IN_CHINA_REQUEST_FAILED_${response.status}`
        );
      }

      const html =
        await response.text();

      if (html.length < 5000) {
        throw new Error(
          "MADE_IN_CHINA_EMPTY_PAGE"
        );
      }

      successfulRequests += 1;

      checkedSources.push({
        query:
          searchQuery,
        url:
          sourceUrl
      });

      const extractedProducts =
        extractMadeInChinaProducts(
          html,
          category,
          searchQuery,
          preferredSubgroup,
          exclusions
        );

      totalExtracted +=
        extractedProducts.length;

      for (
        const product
        of extractedProducts
      ) {
        const currentProduct =
          productsById.get(
            product.productId
          );

        if (!currentProduct) {
          productsById.set(
            product.productId,
            {
              ...product,
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

        currentProduct.retailScore =
          Math.max(
            currentProduct.retailScore,
            product.retailScore
          );

        currentProduct.categoryScore =
          Math.max(
            currentProduct.categoryScore,
            product.categoryScore
          );

        currentProduct.queryScore =
          Math.max(
            currentProduct.queryScore,
            product.queryScore
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

        if (
          !currentProduct.imageUrl &&
          product.imageUrl
        ) {
          currentProduct.imageUrl =
            product.imageUrl;
        }
      }
    } catch (error) {
      firstError ||= error;

      console.error(
        `[Made-in-China ${searchQuery}]`,
        error
      );
    }
  }

  if (
    !successfulRequests &&
    firstError
  ) {
    firstError.statusCode = 502;
    throw firstError;
  }

  const rankedProducts = [
    ...productsById.values()
  ]
    .map(product => {
      const positionScore =
        Math.max(
          0,
          40 -
          Number(
            product.bestPosition || 40
          )
        );

      const repeatedQueryBonus =
        Math.min(
          product.matchedQueries.length,
          3
        ) * 10;

      const relevanceScore =
        product.retailScore * 25 +
        product.categoryScore * 8 +
        product.queryScore * 10 +
        product.occurrenceCount * 8 +
        repeatedQueryBonus +
        positionScore +
        (
          product.imageUrl
            ? 6
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
        second.retailScore -
        first.retailScore ||
        second.queryScore -
        first.queryScore ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(0, 45);

  const selectedProducts =
    selectBalancedMadeInChinaProducts(
      rankedProducts,
      15
    );

  const productsWithImages =
    await Promise.all(
      selectedProducts.map(
        product =>
          loadMadeInChinaProductImage(
            product
          )
      )
    );

  const products =
    productsWithImages.map(
      (product, index) => ({
        ...product,
        sourcePosition:
          index + 1
      })
    );

  return {
    source:
      MADE_IN_CHINA_SOURCE_CONFIG.sourceName,
    sourceType:
      signalType,
    status:
      products.length
        ? "ok"
        : "no_results",
    checkedSources,
    totalExtracted,
    products
  };
}

function buildIdeasFromMadeInChina(
  sourceResult
) {
  const signalConfig =
    MADE_IN_CHINA_SIGNAL_CONFIG[
      sourceResult.sourceType
    ] ||
    MADE_IN_CHINA_SIGNAL_CONFIG.all;

  return sourceResult.products.map(
    product => ({
      id:
        `made-in-china-${product.sourcePosition}-${product.productId}`,
      title:
        product.title,
      imageUrl:
        product.imageUrl || null,
      description:
        product.description,
      signal:
        signalConfig.label,
      signalType:
        sourceResult.sourceType,
      geography:
        MADE_IN_CHINA_SOURCE_CONFIG.geography,
      sources: [
        MADE_IN_CHINA_SOURCE_CONFIG.sourceName
      ],
      links: [
        {
          label:
            "Відкрити на Made-in-China",
          url:
            product.link
        }
      ],
      sourcePosition:
        product.sourcePosition
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

  if (
    MADE_IN_CHINA_SOURCE_CONFIG
      .supportedMarkets
      .has(market)
  ) {
    try {
      const madeInChinaResult =
        await loadMadeInChinaSignal({
          category,
          signalType,
          searchDetails,
          exclusions
        });

      sources.push(
        madeInChinaResult
      );

      ideas = ideas.concat(
        buildIdeasFromMadeInChina(
          madeInChinaResult
        )
      );
    } catch (error) {
      console.error(
        "[Made-in-China]",
        error
      );

      sources.push({
        source:
          MADE_IN_CHINA_SOURCE_CONFIG
            .sourceName,
        sourceType:
          signalType,
        status:
          "error",
        message:
          "Made-in-China тимчасово не повернув товарну видачу.",
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
