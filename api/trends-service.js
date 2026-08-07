import { createHash } from "node:crypto";

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

const ALIBABA_SOURCE_CONFIG = {
  code:
    "alibaba",
  sourceName:
    "Alibaba",
  geography:
    "Китай",
  domain:
    "https://www.alibaba.com",
  supportedMarkets:
    new Set([
      "world",
      "china"
    ])
};

const CHINA_1688_SOURCE_CONFIG = {
  code:
    "1688",
  sourceName:
    "1688",
  geography:
    "Китай",
  domain:
    "https://www.1688.com",
  apiDomain:
    "https://h5api.m.1688.com",
  supportedMarkets:
    new Set([
      "world",
      "china"
    ])
};

const CHINA_1688_SIGNAL_CONFIG = {
  all: {
    sortType:
      "",
    label:
      "Товарний сигнал 1688"
  },

  new: {
    sortType:
      "newOffer",
    label:
      "Новинка 1688"
  },

  trends: {
    sortType:
      "booked",
    label:
      "Трендовий сигнал 1688"
  },

  popular: {
    sortType:
      "booked",
    label:
      "Популярний товар 1688"
  }
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

const ALIBABA_SIGNAL_CONFIG = {
  all: {
    prefix:
      "",
    label:
      "Товарний сигнал Alibaba"
  },

  new: {
    prefix:
      "new arrival",
    label:
      "Новинка Alibaba"
  },

  trends: {
    prefix:
      "trending hot selling",
    label:
      "Трендовий сигнал Alibaba"
  },

  popular: {
    prefix:
      "best selling top selling",
    label:
      "Популярний сигнал Alibaba"
  }
};

const CHINA_1688_GROUP_QUERIES = {
  "kitchen-gadgets":
    "厨房小工具",
  "food-storage":
    "食品收纳盒",
  "tableware":
    "创意餐具",
  "baking":
    "烘焙工具",
  "sink-accessories":
    "厨房水槽用品",

  "wardrobe-storage":
    "衣柜收纳",
  "drawer-desktop":
    "桌面抽屉收纳",
  "bathroom-storage":
    "浴室收纳",
  "kitchen-storage":
    "厨房收纳",
  "boxes-baskets":
    "家用收纳盒",

  "vases-planters":
    "创意花瓶摆件",
  "candles-holders":
    "烛台香薰摆件",
  "figurines-ornaments":
    "家居装饰摆件",
  "trays-stands":
    "装饰托盘",
  "frames-wall-decor":
    "相框墙面装饰",
  "textile-decor":
    "家居软装饰品",

  "cleaning-tools":
    "家用清洁工具",
  "laundry-care":
    "洗衣护理用品",
  "bathroom-daily-use":
    "浴室日用品",
  "waste-disposal":
    "家用垃圾用品",
  "home-care-gadgets":
    "家居实用小工具",

  "skincare":
    "护肤品",
  "masks-patches":
    "面膜眼膜",
  "makeup":
    "彩妆化妆品",
  "makeup-accessories":
    "化妆工具",
  "beauty-devices":
    "美容仪按摩器",
  "hair-care":
    "护发用品",
  "body-care":
    "身体护理",
  "nail-care":
    "美甲用品",

  "feeding":
    "婴童喂养用品",
  "hygiene":
    "婴童护理用品",
  "safety":
    "儿童安全用品",
  "travel":
    "婴童出行用品",
  "sleep-nursery":
    "婴童睡眠用品",

  "educational":
    "益智玩具",
  "sensory-fidget":
    "解压感官玩具",
  "building-puzzles":
    "积木拼图玩具",
  "creative-sets":
    "儿童DIY玩具",
  "role-play":
    "儿童角色扮演玩具",
  "interactive":
    "互动智能玩具",

  "writing":
    "创意文具笔",
  "notebooks-planners":
    "笔记本手账",
  "stickers-paper":
    "文具贴纸便签",
  "cases-organizers":
    "笔袋文具收纳",
  "art-supplies":
    "美术绘画用品",

  "hair-accessories":
    "时尚发饰",
  "jewelry":
    "时尚饰品",
  "wallets-holders":
    "钱包卡包",
  "bag-accessories":
    "包包挂件",
  "phone-fashion":
    "手机挂件",
  "eyewear":
    "时尚眼镜",

  "toys":
    "宠物玩具",
  "walking":
    "宠物牵引用品",
  "grooming":
    "宠物美容用品",
  "beds-travel":
    "宠物窝外出用品",

  "christmas":
    "圣诞装饰用品",
  "halloween":
    "万圣节装饰",
  "easter":
    "复活节装饰",
  "party":
    "派对生日装饰",
  "summer":
    "夏季创意用品",
  "back-to-school":
    "开学季用品",

  "gift-sets":
    "创意礼品套装",
  "candles-aroma":
    "香薰蜡烛礼品",
  "frames-keepsakes":
    "相框纪念礼品",
  "figurines-souvenirs":
    "创意摆件礼品",
  "personal-gifts":
    "个性创意礼品",
  "novelty-gifts":
    "新奇创意礼品",

  "charging":
    "手机充电配件",
  "phone-holders":
    "手机支架",
  "audio":
    "耳机音频配件",
  "smart-trackers":
    "智能防丢器",
  "lighting-gadgets":
    "创意小夜灯",
  "computer-accessories":
    "电脑桌面配件",

  "daily-use":
    "创意日用品",
  "novelty":
    "新奇创意产品"
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
    const categoryQuery =
      group.queries[0];

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

  return queryItems.slice(
    0,
    8
  );
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

const chinaProductImageCache =
  new Map();

const CHINA_PRODUCT_IMAGE_CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

const CHINA_IMAGE_BLOCKED_WORDS = [
  "logo",
  "icon",
  "sprite",
  "avatar",
  "banner",
  "company",
  "factory",
  "certificate",
  "certification",
  "report",
  "audit",
  "inspection",
  "profile",
  "contact",
  "qrcode",
  "qr-code",
  "placeholder",
  "loading",
  "default",
  "blank",
  "supplier",
  "license",
  "document",
  "manual",
  "instruction",
  "catalog",
  "brochure",
  "business-card",
  "business_card",
  "company-display",
  "company_display",
  "size-chart",
  "size_chart"
];

const CHINA_IMAGE_PENALTY_WORDS = [
  "packaging",
  "packing",
  "package",
  "carton",
  "certificate",
  "factory",
  "workshop",
  "production",
  "detail",
  "dimension",
  "specification",
  "instruction",
  "installation",
  "comparison"
];

const CHINA_IMAGE_GENERIC_TITLE_WORDS =
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
    "wholesale",
    "quality",
    "china",
    "factory",
    "manufacturer",
    "supplier"
  ]);

function getChinaImageTitleWords(
  title
) {
  return getChinaWords(
    title
  ).filter(word =>
    word.length >= 4 &&
    !CHINA_IMAGE_GENERIC_TITLE_WORDS
      .has(word)
  );
}

function normalizeChinaImageUrl(
  rawUrl,
  baseUrl
) {
  let value =
    decodeHtmlEntities(
      String(rawUrl || "")
    )
      .replace(/&quot;/gi, "")
      .replace(/\\u002F/gi, "/")
      .replace(/\\u0026/gi, "&")
      .replace(/\\u003D/gi, "=")
      .replace(/\\\//g, "/")
      .replace(/^["']+|["']+$/g, "")
      .trim();

  if (!value) {
    return null;
  }

  try {
    value =
      decodeURIComponent(
        value
      );
  } catch {
    // URL не був закодований.
  }

  try {
    const imageUrl =
      value.startsWith("//")
        ? `https:${value}`
        : new URL(
            value,
            baseUrl
          ).toString();

    const normalized =
      imageUrl.toLocaleLowerCase(
        "en-US"
      );

    if (
      !/^https?:/i.test(
        imageUrl
      )
    ) {
      return null;
    }

    if (
      CHINA_IMAGE_BLOCKED_WORDS.some(
        word =>
          normalized.includes(
            word
          )
      )
    ) {
      return null;
    }

    if (
      normalized.endsWith(".svg") ||
      normalized.endsWith(".gif")
    ) {
      return null;
    }

    return imageUrl;
  } catch {
    return null;
  }
}

function getChinaImageCandidateScore({
  imageUrl,
  text,
  productTitle,
  baseScore = 0,
  width = 0
}) {
  const normalizedUrl =
    String(imageUrl || "")
      .toLocaleLowerCase(
        "en-US"
      );

  const normalizedText =
    normalizeChinaText(
      text
    );

  const normalizedTitle =
    normalizeChinaText(
      productTitle
    );

  const titleWords =
    getChinaImageTitleWords(
      productTitle
    );

  const matchingWords =
    titleWords.filter(word =>
      normalizedText.includes(
        word
      ) ||
      normalizedUrl.includes(
        word
      )
    ).length;

  const coverage =
    titleWords.length
      ? matchingWords /
        titleWords.length
      : 0;

  let score =
    baseScore +
    matchingWords * 14 +
    coverage * 45;

  if (
    normalizedText &&
    normalizedTitle &&
    (
      normalizedText.includes(
        normalizedTitle
      ) ||
      normalizedTitle.includes(
        normalizedText
      )
    )
  ) {
    score += 35;
  }

  if (
    /\b(main|primary|product|gallery|photo)\b/i
      .test(normalizedText)
  ) {
    score += 18;
  }

  if (
    /product|gallery|main|photo/i
      .test(normalizedUrl)
  ) {
    score += 8;
  }

  if (
    Number(width) >= 400
  ) {
    score += 8;
  }

  if (
    Number(width) >= 700
  ) {
    score += 6;
  }

  const penaltyText =
    `${normalizedText} ${normalizedUrl}`;

  for (
    const word
    of CHINA_IMAGE_PENALTY_WORDS
  ) {
    if (
      penaltyText.includes(
        word
      )
    ) {
      score -= 28;
    }
  }

  return {
    score,
    coverage
  };
}

function extractChinaImageCandidatesFromHtml({
  html,
  productTitle,
  baseUrl
}) {
  const sourceHtml =
    String(html || "");

  const candidates = [];

  function addCandidate(
    rawUrl,
    text,
    baseScore,
    width = 0,
    source = "img"
  ) {
    const imageUrl =
      normalizeChinaImageUrl(
        rawUrl,
        baseUrl
      );

    if (!imageUrl) {
      return;
    }

    const rating =
      getChinaImageCandidateScore({
        imageUrl,
        text,
        productTitle,
        baseScore,
        width
      });

    candidates.push({
      imageUrl,
      score:
        rating.score,
      coverage:
        rating.coverage,
      source
    });
  }

  for (
    const imageMatch
    of sourceHtml.matchAll(
      /<img\b[^>]*>/gi
    )
  ) {
    const imageTag =
      imageMatch[0];

    const alt =
      decodeHtmlEntities(
        imageTag.match(
          /\balt=["']([^"']*)["']/i
        )?.[1] || ""
      );

    const imageTitle =
      decodeHtmlEntities(
        imageTag.match(
          /\btitle=["']([^"']*)["']/i
        )?.[1] || ""
      );

    const className =
      imageTag.match(
        /\bclass=["']([^"']*)["']/i
      )?.[1] || "";

    const id =
      imageTag.match(
        /\bid=["']([^"']*)["']/i
      )?.[1] || "";

    const text =
      [
        alt,
        imageTitle,
        className,
        id
      ]
        .filter(Boolean)
        .join(" ");

    const attributes = [
      "data-original",
      "data-original-src",
      "data-src",
      "data-lazy-src",
      "data-lazy",
      "data-image",
      "data-image-url",
      "data-image-src",
      "data-img",
      "data-zoom-image",
      "data-large",
      "data-large-image",
      "src"
    ];

    for (
      const attribute
      of attributes
    ) {
      const match =
        imageTag.match(
          new RegExp(
            `\\b${attribute}=["']([^"']+)["']`,
            "i"
          )
        );

      if (!match?.[1]) {
        continue;
      }

      addCandidate(
        match[1],
        text,
        28,
        0,
        "img"
      );
    }

    const srcsetAttributes = [
      "srcset",
      "data-srcset"
    ];

    for (
      const attribute
      of srcsetAttributes
    ) {
      const srcset =
        imageTag.match(
          new RegExp(
            `\\b${attribute}=["']([^"']+)["']`,
            "i"
          )
        )?.[1];

      if (!srcset) {
        continue;
      }

      for (
        const item
        of srcset.split(",")
      ) {
        const parts =
          item
            .trim()
            .split(/\s+/);

        const widthMatch =
          String(
            parts[1] || ""
          ).match(
            /(\d+)w/i
          );

        addCandidate(
          parts[0],
          text,
          34,
          Number(
            widthMatch?.[1]
          ) || 0,
          "srcset"
        );
      }
    }

    const style =
      imageTag.match(
        /\bstyle=["']([^"']+)["']/i
      )?.[1] || "";

    const styleImage =
      style.match(
        /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/i
      )?.[1];

    if (styleImage) {
      addCandidate(
        styleImage,
        text,
        30,
        0,
        "style"
      );
    }
  }

  /*
   * Картинка іноді лежить не в IMG,
   * а в style="background-image".
   */
  for (
    const styleMatch
    of sourceHtml.matchAll(
      /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi
    )
  ) {
    addCandidate(
      styleMatch?.[1],
      "",
      24,
      0,
      "background"
    );
  }

  /*
   * Китайські каталоги часто кладуть URL
   * картинки просто в JSON/data-поля HTML.
   */
  const jsonImagePatterns = [
    /"(?:imageUrl|imageURL|imageSrc|imagePath)"\s*:\s*"([^"]+)"/gi,
    /"(?:mainImage|mainImageUrl|mainImg|mainImgUrl)"\s*:\s*"([^"]+)"/gi,
    /"(?:productImage|productImageUrl)"\s*:\s*"([^"]+)"/gi,
    /"(?:originalImage|originalImageUrl)"\s*:\s*"([^"]+)"/gi,
    /"(?:thumb|thumbUrl|thumbnail|thumbnailUrl)"\s*:\s*"([^"]+)"/gi
  ];

  for (
    const pattern
    of jsonImagePatterns
  ) {
    for (
      const match
      of sourceHtml.matchAll(
        pattern
      )
    ) {
      addCandidate(
        match?.[1],
        productTitle,
        36,
        0,
        "json"
      );
    }
  }

  /*
   * Останній fallback:
   * прямі jpg/png/webp URL у межах
   * конкретної картки товару.
   */
  const rawImagePattern =
    /(?:https?:)?(?:\\u002F|\\\/|\/){2}[^"'<> ]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<> ]*)?/gi;

  for (
    const match
    of sourceHtml.matchAll(
      rawImagePattern
    )
  ) {
    addCandidate(
      match[0],
      "",
      20,
      0,
      "raw"
    );
  }

  const uniqueCandidates = [];
  const seen =
    new Set();

  for (
    const candidate
    of candidates.sort(
      (first, second) =>
        second.score -
        first.score
    )
  ) {
    const key =
      candidate.imageUrl
        .replace(
          /_[0-9]+x[0-9]+[^/?]*/gi,
          ""
        )
        .split("?")[0];

    if (
      seen.has(
        key
      )
    ) {
      continue;
    }

    seen.add(
      key
    );

    uniqueCandidates.push(
      candidate
    );
  }

  return uniqueCandidates;
}

function getChinaImageFromHtml(
  html,
  productTitle,
  baseUrl
) {
  const candidates =
    extractChinaImageCandidatesFromHtml({
      html,
      productTitle,
      baseUrl
    });

  if (!candidates.length) {
    return null;
  }

  /*
   * Спочатку беремо семантично сильне фото.
   */
  const strongCandidate =
    candidates.find(
      candidate =>
        candidate.score >= 42 ||
        candidate.coverage >= 0.25
    );

  if (strongCandidate) {
    return strongCandidate.imageUrl;
  }

  /*
   * Якщо це HTML конкретної товарної картки,
   * краще взяти нормальне незаблоковане фото,
   * навіть коли у нього немає alt/title,
   * ніж повернути null.
   */
  const fallbackCandidate =
    candidates.find(
      candidate =>
        candidate.score >= 18
    );

  return (
    fallbackCandidate
      ?.imageUrl ||
    null
  );
}

function getMadeInChinaImageUrl(
  productHtml,
  productTitle
) {
  return getChinaImageFromHtml(
    productHtml,
    productTitle,
    MADE_IN_CHINA_SOURCE_CONFIG.domain
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

function getChinaGalleryImageQualityScore(
  imageUrl
) {
  const normalizedUrl =
    String(imageUrl || "")
      .toLocaleLowerCase(
        "en-US"
      );

  let score = 0;

  const dimensionMatches = [
    ...normalizedUrl.matchAll(
      /(\d{3,4})[xX](\d{3,4})/g
    )
  ];

  for (
    const dimensionMatch
    of dimensionMatches
  ) {
    const width =
      Number(
        dimensionMatch[1]
      );

    const height =
      Number(
        dimensionMatch[2]
      );

    const shortestSide =
      Math.min(
        width,
        height
      );

    if (shortestSide >= 1000) {
      score = Math.max(
        score,
        34
      );
    } else if (
      shortestSide >= 800
    ) {
      score = Math.max(
        score,
        30
      );
    } else if (
      shortestSide >= 600
    ) {
      score = Math.max(
        score,
        24
      );
    } else if (
      shortestSide >= 400
    ) {
      score = Math.max(
        score,
        17
      );
    } else if (
      shortestSide >= 250
    ) {
      score = Math.max(
        score,
        8
      );
    } else {
      score -= 18;
    }
  }

  if (
    normalizedUrl.includes(
      "original"
    ) ||
    normalizedUrl.includes(
      "large"
    ) ||
    normalizedUrl.includes(
      "big"
    )
  ) {
    score += 12;
  }

  if (
    normalizedUrl.includes(
      "thumbnail"
    ) ||
    normalizedUrl.includes(
      "thumb"
    ) ||
    normalizedUrl.includes(
      "small"
    )
  ) {
    score -= 20;
  }

  return score;
}

function prepareChinaGalleryImageUrl(
  rawUrl,
  baseUrl,
  sourceConfig
) {
  const normalizedUrl =
    normalizeChinaImageUrl(
      rawUrl,
      baseUrl
    );

  if (!normalizedUrl) {
    return null;
  }

  try {
    const url =
      new URL(
        normalizedUrl
      );

    if (
      sourceConfig.code ===
      "alibaba"
    ) {
      url.pathname =
        url.pathname
          .replace(
            /(\.(?:jpe?g|png|webp))_[^/]+\.(?:jpe?g|png|webp)$/i,
            "$1"
          )
          .replace(
            /(\.(?:jpe?g|png|webp))_[^/]+$/i,
            "$1"
          );

      url.searchParams.delete(
        "x-oss-process"
      );
    }

    [
      "width",
      "height",
      "w",
      "h",
      "resize",
      "quality"
    ].forEach(parameter =>
      url.searchParams.delete(
        parameter
      )
    );

    return url.toString();
  } catch {
    return normalizedUrl;
  }
}

function extractChinaProductGallery({
  html,
  productTitle,
  baseUrl,
  sourceConfig
}) {
  const sourceHtml =
    String(html || "");

  const candidates = [];
  const seenUrls =
    new Set();

  function addCandidate(
    rawUrl,
    {
      galleryIndex = 99,
      source = "unknown",
      baseScore = 0,
      context = ""
    } = {}
  ) {
    const imageUrl =
      prepareChinaGalleryImageUrl(
        rawUrl,
        baseUrl,
        sourceConfig
      );

    if (!imageUrl) {
      return;
    }

    const normalizedUrl =
      imageUrl.toLocaleLowerCase(
        "en-US"
      );

    const normalizedContext =
      normalizeChinaText(
        context
      );

    const blockedWords = [
      "logo",
      "icon",
      "avatar",
      "sprite",
      "certificate",
      "certification",
      "audit",
      "report",
      "factory",
      "company",
      "supplier",
      "profile",
      "qrcode",
      "qr code",
      "manual",
      "instruction",
      "size chart",
      "packing list"
    ];

    if (
      blockedWords.some(
        word =>
          normalizedUrl.includes(
            word
          ) ||
          normalizedContext.includes(
            word
          )
      )
    ) {
      return;
    }

    const videoWords = [
      "video",
      "video poster",
      "video cover",
      "video thumbnail",
      "videocover",
      "videoimage",
      "media video"
    ];

    if (
      videoWords.some(
        word =>
          normalizedContext.includes(
            word
          )
      )
    ) {
      return;
    }

    if (
      seenUrls.has(
        normalizedUrl
      )
    ) {
      return;
    }

    seenUrls.add(
      normalizedUrl
    );

    let positionScore = 0;

    if (galleryIndex === 0) {
      positionScore = 32;
    } else if (
      galleryIndex === 1
    ) {
      positionScore = 38;
    } else if (
      galleryIndex === 2
    ) {
      positionScore = 35;
    } else if (
      galleryIndex === 3
    ) {
      positionScore = 30;
    } else if (
      galleryIndex === 4
    ) {
      positionScore = 15;
    } else if (
      galleryIndex <= 6
    ) {
      positionScore = 5;
    } else {
      positionScore = -12;
    }

    /*
     * Саме 2–4 позиції отримують невелику
     * перевагу, але це НЕ жорстке правило.
     */
    let score =
      baseScore +
      positionScore +
      getChinaGalleryImageQualityScore(
        imageUrl
      );

    const normalizedTitle =
      normalizeChinaText(
        productTitle
      );

    const productWords =
      getChinaImageTitleWords(
        productTitle
      );

    const matchedWords =
      productWords.filter(word =>
        normalizedContext.includes(
          word
        )
      ).length;

    if (
      productWords.length
    ) {
      score +=
        (
          matchedWords /
          productWords.length
        ) *
        24;
    }

    if (
      normalizedTitle &&
      normalizedContext.includes(
        normalizedTitle
      )
    ) {
      score += 18;
    }

    const packagingWords = [
      "package",
      "packaging",
      "packing",
      "carton",
      "box size",
      "delivery",
      "shipping"
    ];

    if (
      packagingWords.some(
        word =>
          normalizedContext.includes(
            word
          )
      )
    ) {
      score -= 25;
    }

    candidates.push({
      imageUrl,
      score,
      galleryIndex,
      source
    });
  }

  /*
   * 1. Alibaba main_image.
   */
  const mainImagePatterns = [
    /"(?:main_image|mainImage|mainImageUrl|mainImg|mainImgUrl)"\s*:\s*"([^"]+)"/gi,
    /"(?:originalImage|originalImageUrl)"\s*:\s*"([^"]+)"/gi,
    /"(?:productImage|productImageUrl)"\s*:\s*"([^"]+)"/gi
  ];

  for (
    const pattern
    of mainImagePatterns
  ) {
    for (
      const match
      of sourceHtml.matchAll(
        pattern
      )
    ) {
      addCandidate(
        match?.[1],
        {
          galleryIndex:
            0,
          source:
            "main-image",
          baseScore:
            65,
          context:
            sourceHtml.slice(
              Math.max(
                0,
                Number(match.index) -
                  180
              ),
              Math.min(
                sourceHtml.length,
                Number(match.index) +
                  300
              )
            )
        }
      );
    }
  }

  /*
   * 2. Масиви товарної галереї.
   */
  const galleryArrayPatterns = [
    /"(?:images|imageList|imageUrls|imagePathList|productImages|galleryImages|mainImages)"\s*:\s*\[([\s\S]*?)\]/gi,
    /"(?:originalImages|productImageList|galleryList)"\s*:\s*\[([\s\S]*?)\]/gi
  ];

  for (
    const arrayPattern
    of galleryArrayPatterns
  ) {
    for (
      const arrayMatch
      of sourceHtml.matchAll(
        arrayPattern
      )
    ) {
      const arrayText =
        String(
          arrayMatch?.[1] || ""
        );

      let galleryIndex = 0;

      for (
        const urlMatch
        of arrayText.matchAll(
          /["']((?:https?:)?(?:\\?\/){2}[^"']+\.(?:jpe?g|png|webp)[^"']*)["']/gi
        )
      ) {
        addCandidate(
          urlMatch?.[1],
          {
            galleryIndex,
            source:
              "gallery-array",
            baseScore:
              55,
            context:
              arrayText.slice(
                Math.max(
                  0,
                  Number(urlMatch.index) -
                    120
                ),
                Math.min(
                  arrayText.length,
                  Number(urlMatch.index) +
                    220
                )
              )
          }
        );

        galleryIndex += 1;

        /*
         * Нам потрібна верхня частина
         * товарної галереї.
         * Далі частіше йдуть деталі,
         * упаковка та сертифікати.
         */
        if (galleryIndex >= 7) {
          break;
        }
      }
    }
  }

  /*
   * 3. JSON-LD Product.image.
   */
  const jsonLdPattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (
    const jsonMatch
    of sourceHtml.matchAll(
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
        const type =
          jsonItem?.["@type"];

        const isProduct =
          type === "Product" ||
          (
            Array.isArray(type) &&
            type.includes(
              "Product"
            )
          );

        if (!isProduct) {
          continue;
        }

        const imageValue =
          jsonItem?.image;

        const imageItems =
          typeof imageValue ===
            "string"
            ? [imageValue]
            : Array.isArray(
                imageValue
              )
              ? imageValue
              : imageValue
                ? [
                    imageValue.url ||
                    imageValue.contentUrl
                  ]
                : [];

        imageItems
          .slice(
            0,
            6
          )
          .forEach(
            (
              imageItem,
              index
            ) => {
              const rawUrl =
                typeof imageItem ===
                  "string"
                  ? imageItem
                  : (
                      imageItem?.url ||
                      imageItem
                        ?.contentUrl
                    );

              addCandidate(
                rawUrl,
                {
                  galleryIndex:
                    index,
                  source:
                    "jsonld-product",
                  baseScore:
                    58,
                  context:
                    productTitle
                }
              );
            }
          );
      }
    } catch {
      continue;
    }
  }

  /*
   * 4. Галерея, описана IMG-тегами.
   * Беремо лише картинки, біля яких
   * є ознаки gallery/product/media.
   */
  let galleryImageIndex = 0;

  for (
    const imageMatch
    of sourceHtml.matchAll(
      /<img\b[^>]*>/gi
    )
  ) {
    const imageTag =
      imageMatch[0];

    const tagContext =
      sourceHtml.slice(
        Math.max(
          0,
          Number(imageMatch.index) -
            240
        ),
        Math.min(
          sourceHtml.length,
          Number(imageMatch.index) +
            imageTag.length +
            240
        )
      );

    const normalizedContext =
      normalizeChinaText(
        tagContext
      );

    if (
      !(
        normalizedContext.includes(
          "gallery"
        ) ||
        normalizedContext.includes(
          "product image"
        ) ||
        normalizedContext.includes(
          "product-image"
        ) ||
        normalizedContext.includes(
          "main image"
        ) ||
        normalizedContext.includes(
          "main-image"
        ) ||
        normalizedContext.includes(
          "thumb"
        ) ||
        normalizedContext.includes(
          "media"
        )
      )
    ) {
      continue;
    }

    const sourceAttributes = [
      "data-original",
      "data-src",
      "data-lazy-src",
      "data-image",
      "data-image-src",
      "data-big",
      "data-large",
      "src"
    ];

    let foundImage = false;

    for (
      const attribute
      of sourceAttributes
    ) {
      const rawUrl =
        imageTag.match(
          new RegExp(
            `\\b${attribute}=["']([^"']+)["']`,
            "i"
          )
        )?.[1];

      if (!rawUrl) {
        continue;
      }

      addCandidate(
        rawUrl,
        {
          galleryIndex:
            galleryImageIndex,
          source:
            "gallery-img",
          baseScore:
            36,
          context:
            tagContext
        }
      );

      foundImage = true;
    }

    if (foundImage) {
      galleryImageIndex += 1;
    }

    if (
      galleryImageIndex >= 7
    ) {
      break;
    }
  }

  return candidates
    .sort(
      (first, second) =>
        second.score -
        first.score ||
        first.galleryIndex -
        second.galleryIndex
    );
}

async function resolveChinaProductImage(
  product,
  sourceConfig
) {
  const cacheKey =
    `gallery-v2:${sourceConfig.code}:${product.productId}`;

  const cached =
    chinaProductImageCache.get(
      cacheKey
    );

  if (
    cached &&
    Date.now() -
      cached.savedAt <
      CHINA_PRODUCT_IMAGE_CACHE_TTL_MS
  ) {
    return {
      ...product,
      imageUrl:
        cached.imageUrl ||
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
            10000
          )
      }
    );

    if (!response.ok) {
      throw new Error(
        `CHINA_IMAGE_${response.status}`
      );
    }

    const finalPageUrl =
      response.url ||
      product.link;

    const html =
      await response.text();

    const galleryCandidates =
      extractChinaProductGallery({
        html,
        productTitle:
          product.title,
        baseUrl:
          finalPageUrl,
        sourceConfig
      });

    /*
     * Вимагаємо достатньо сильний
     * товарний кандидат.
     */
    const bestGalleryImage =
      galleryCandidates.find(
        candidate =>
          candidate.score >= 55
      );

    let imageUrl =
      bestGalleryImage
        ?.imageUrl ||
      null;

    /*
     * Якщо структуровану галерею
     * не знайшли, залишаємо фото,
     * яке вже було прив'язане
     * до конкретної search-card.
     */
    if (
      !imageUrl &&
      product.imageUrl
    ) {
      imageUrl =
        prepareChinaGalleryImageUrl(
          product.imageUrl,
          finalPageUrl,
          sourceConfig
        );
    }

    chinaProductImageCache.set(
      cacheKey,
      {
        savedAt:
          Date.now(),
        imageUrl:
          imageUrl ||
          null
      }
    );

    return {
      ...product,
      imageUrl:
        imageUrl ||
        null
    };
  } catch {
    return {
      ...product,
      imageUrl:
        product.imageUrl ||
        null
    };
  }
}

async function loadMadeInChinaProductImage(
  product
) {
  return resolveChinaProductImage(
    product,
    MADE_IN_CHINA_SOURCE_CONFIG
  );
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

  const totalQueryCount =
    Math.max(
      searchQueries.length,
      1
    );

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

      const queryCoverage =
        Math.min(
          product.matchedQueries.length /
            totalQueryCount,
          1
        );

      const relevanceScore =
        product.retailScore * 3 +
        product.categoryScore * 2 +
        product.queryScore * 3 +
        queryCoverage * 20 +
        positionScore;

      return {
        ...product,
        sourceSignalScore:
          relevanceScore
      };
    })
    .sort(
      (first, second) =>
        second.sourceSignalScore -
        first.sourceSignalScore ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(
      0,
      45
    );

  const bestSourceScore =
    Math.max(
      ...rankedProducts.map(
        product =>
          product.sourceSignalScore || 0
      ),
      1
    );

  for (
    const product
    of rankedProducts
  ) {
    product.relevanceScore =
      Math.round(
        (
          product.sourceSignalScore /
          bestSourceScore
        ) *
        1000
      ) / 10;
  }

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
        product.sourcePosition,
      relevanceScore:
        product.relevanceScore || 0,
      subgroup:
        product.subgroup || null
    })
  );
}

function buildAlibabaSearchQueries(
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
    ALIBABA_SIGNAL_CONFIG[
      signalType
    ] ||
    ALIBABA_SIGNAL_CONFIG.all;

  const details =
    cleanTrendText(
      searchDetails,
      140
    );

  const queryItems = [];

  for (
    const group
    of categoryConfig.groups
  ) {
    const baseQuery =
      group.queries[0];

    const searchQuery =
      cleanTrendText(
        [
          signalConfig.prefix,
          baseQuery,
          details
        ]
          .filter(Boolean)
          .join(" "),
        200
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

  return queryItems.slice(
    0,
    8
  );
}

function buildAlibabaSearchUrl(
  searchQuery
) {
  const slug =
    cleanTrendText(
      searchQuery,
      200
    )
      .toLocaleLowerCase(
        "en-US"
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return (
    `${ALIBABA_SOURCE_CONFIG.domain}` +
    `/countrysearch/CN/` +
    `${slug || "consumer-products"}.html`
  );
}

function getAlibabaImageUrl(
  contextHtml,
  productTitle
) {
  return getChinaImageFromHtml(
    contextHtml,
    productTitle,
    ALIBABA_SOURCE_CONFIG.domain
  );
}

function extractAlibabaProducts(
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

    let link;

    try {
      link =
        new URL(
          rawLink,
          ALIBABA_SOURCE_CONFIG.domain
        ).toString();
    } catch {
      continue;
    }

    const normalizedLink =
      link.toLocaleLowerCase(
        "en-US"
      );

    if (
      !normalizedLink.includes(
        "alibaba.com"
      ) ||
      !normalizedLink.includes(
        ".html"
      ) ||
      (
        !normalizedLink.includes(
          "/product-detail/"
        ) &&
        !normalizedLink.includes(
          "/product/"
        )
      )
    ) {
      continue;
    }

    if (
      seenLinks.has(
        normalizedLink
      )
    ) {
      continue;
    }

    const anchorHtml =
      String(
        anchorMatch[2] || ""
      );

    let title =
      cleanTrendText(
        stripHtml(
          anchorHtml
        ),
        320
      );

    const anchorIndex =
      Number(
        anchorMatch.index
      ) || 0;

    const contextStart =
      Math.max(
        0,
        anchorIndex - 1200
      );

    const contextEnd =
      Math.min(
        sourceHtml.length,
        anchorIndex + 3500
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
        1800
      );

    if (
      !title ||
      title.length < 18
    ) {
      const titleMatch =
        contextHtml.match(
          /\btitle=["']([^"']{18,320})["']/i
        ) ||
        contextHtml.match(
          /\balt=["']([^"']{18,320})["']/i
        );

      title =
        cleanTrendText(
          decodeHtmlEntities(
            titleMatch?.[1] || ""
          ),
          320
        );
    }

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
      normalizedTitle.includes(
        "contact supplier"
      ) ||
      normalizedTitle.includes(
        "chat now"
      ) ||
      normalizedTitle.includes(
        "send inquiry"
      ) ||
      normalizedTitle.includes(
        "view more"
      )
    ) {
      continue;
    }

    if (
      matchesExclusions(
        `${title} ${contextText}`,
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
        /(?:US\s*)?\$\s*[\d.,]+(?:\s*-\s*[\d.,]+)?/i
      );

    const moqMatch =
      contextText.match(
        /(?:MOQ|Min\.?\s*order)\s*:?\s*[\d,.\s]+\s*[A-Za-z]+/i
      );

    const soldMatch =
      contextText.match(
        /[\d,.]+\s+sold\b/i
      );

    const ratingMatch =
      contextText.match(
        /\b[1-5](?:\.\d)?\s*\/\s*5(?:\.0)?\b/i
      );

    const descriptionParts = [];

    if (priceMatch?.[0]) {
      descriptionParts.push(
        cleanTrendText(
          priceMatch[0],
          80
        )
      );
    }

    if (moqMatch?.[0]) {
      descriptionParts.push(
        cleanTrendText(
          moqMatch[0],
          100
        )
      );
    }

    if (soldMatch?.[0]) {
      descriptionParts.push(
        cleanTrendText(
          soldMatch[0],
          80
        )
      );
    }

    if (ratingMatch?.[0]) {
      descriptionParts.push(
        `Rating ${ratingMatch[0]}`
      );
    }

    let soldCount = 0;

    if (soldMatch?.[0]) {
      soldCount =
        Number(
          soldMatch[0]
            .replace(
              /sold/gi,
              ""
            )
            .replace(
              /,/g,
              ""
            )
            .trim()
        ) || 0;
    }

    seenLinks.add(
      normalizedLink
    );

    products.push({
      productId:
        normalizedLink,
      title,
      description:
        descriptionParts.join(
          " · "
        ) ||
        "Товар знайдений у китайській видачі Alibaba.",
      link,
      imageUrl:
        getAlibabaImageUrl(
          contextHtml,
          title
        ),
      categoryScore,
      retailScore:
        productProfile.retailScore,
      queryScore,
      subgroup:
        productProfile.subgroup,
      soldCount,
      sourcePosition:
        products.length + 1
    });

    if (
      products.length >=
      60
    ) {
      break;
    }
  }

  return products;
}

async function loadAlibabaProductImage(
  product
) {
  return resolveChinaProductImage(
    product,
    ALIBABA_SOURCE_CONFIG
  );
}

async function loadAlibabaSignal({
  category,
  signalType,
  searchDetails,
  exclusions
}) {
  const searchQueries =
    buildAlibabaSearchQueries(
      category,
      signalType,
      searchDetails
    );

  const checkedSources = [];

  const requestResults =
    await Promise.allSettled(
      searchQueries.map(
        async queryItem => {
          const sourceUrl =
            buildAlibabaSearchUrl(
              queryItem.searchQuery
            );

          const response =
            await fetch(
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
              `ALIBABA_REQUEST_FAILED_${response.status}`
            );
          }

          const html =
            await response.text();

          if (
            html.length < 5000
          ) {
            throw new Error(
              "ALIBABA_EMPTY_PAGE"
            );
          }

          return {
            queryItem,
            sourceUrl,
            html
          };
        }
      )
    );

  const productsById =
    new Map();

  let successfulRequests = 0;
  let totalExtracted = 0;
  let firstError = null;

  for (
    const requestResult
    of requestResults
  ) {
    if (
      requestResult.status !==
      "fulfilled"
    ) {
      firstError ||=
        requestResult.reason;

      continue;
    }

    successfulRequests += 1;

    const {
      queryItem,
      sourceUrl,
      html
    } =
      requestResult.value;

    checkedSources.push({
      query:
        queryItem.searchQuery,
      url:
        sourceUrl
    });

    const extractedProducts =
      extractAlibabaProducts(
        html,
        category,
        queryItem.searchQuery,
        queryItem.subgroup,
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
              queryItem.searchQuery
            ],
            bestPosition:
              product.sourcePosition
          }
        );

        continue;
      }

      currentProduct.occurrenceCount +=
        1;

      currentProduct.retailScore =
        Math.max(
          currentProduct.retailScore,
          product.retailScore
        );

      currentProduct.queryScore =
        Math.max(
          currentProduct.queryScore,
          product.queryScore
        );

      currentProduct.categoryScore =
        Math.max(
          currentProduct.categoryScore,
          product.categoryScore
        );

      currentProduct.soldCount =
        Math.max(
          currentProduct.soldCount || 0,
          product.soldCount || 0
        );

      currentProduct.bestPosition =
        Math.min(
          currentProduct.bestPosition,
          product.sourcePosition
        );

      if (
        !currentProduct.imageUrl &&
        product.imageUrl
      ) {
        currentProduct.imageUrl =
          product.imageUrl;
      }

      if (
        !currentProduct.matchedQueries.includes(
          queryItem.searchQuery
        )
      ) {
        currentProduct.matchedQueries.push(
          queryItem.searchQuery
        );
      }
    }
  }

  if (
    !successfulRequests &&
    firstError
  ) {
    firstError.statusCode = 502;
    throw firstError;
  }

  const totalQueryCount =
    Math.max(
      searchQueries.length,
      1
    );

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

      const queryCoverage =
        Math.min(
          product.matchedQueries.length /
            totalQueryCount,
          1
        );

      let marketSignalScore = 0;

      if (
        product.soldCount > 0 &&
        (
          signalType === "popular" ||
          signalType === "trends" ||
          signalType === "all"
        )
      ) {
        marketSignalScore =
          Math.min(
            30,
            Math.log10(
              product.soldCount + 1
            ) * 10
          );
      }

      const relevanceScore =
        product.retailScore * 3 +
        product.categoryScore * 2 +
        product.queryScore * 3 +
        queryCoverage * 20 +
        positionScore +
        marketSignalScore;

      return {
        ...product,
        marketSignalScore,
        sourceSignalScore:
          relevanceScore
      };
    })
    .sort(
      (first, second) =>
        second.sourceSignalScore -
        first.sourceSignalScore ||
        second.marketSignalScore -
        first.marketSignalScore ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(
      0,
      50
    );

  const bestSourceScore =
    Math.max(
      ...rankedProducts.map(
        product =>
          product.sourceSignalScore || 0
      ),
      1
    );

  for (
    const product
    of rankedProducts
  ) {
    product.relevanceScore =
      Math.round(
        (
          product.sourceSignalScore /
          bestSourceScore
        ) *
        1000
      ) / 10;
  }

  const selectedProducts =
    selectBalancedMadeInChinaProducts(
      rankedProducts,
      15
    );

  const productsWithImages =
    await Promise.all(
      selectedProducts.map(
        product =>
          loadAlibabaProductImage(
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
      ALIBABA_SOURCE_CONFIG.sourceName,
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

function buildIdeasFromAlibaba(
  sourceResult
) {
  const signalConfig =
    ALIBABA_SIGNAL_CONFIG[
      sourceResult.sourceType
    ] ||
    ALIBABA_SIGNAL_CONFIG.all;

  return sourceResult.products.map(
    product => ({
      id:
        `alibaba-${product.productId}`,
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
        ALIBABA_SOURCE_CONFIG.geography,
      sources: [
        ALIBABA_SOURCE_CONFIG.sourceName
      ],
      links: [
        {
          label:
            "Відкрити на Alibaba",
          url:
            product.link
        }
      ],
      sourcePosition:
        product.sourcePosition,
      relevanceScore:
        product.relevanceScore || 0,
      subgroup:
        product.subgroup || null
    })
  );
}

const china1688Session = {
  token:
    "",
  tokenCookie:
    "",
  tokenEncCookie:
    "",
  expiresAt:
    0,
  bootstrapPromise:
    null
};

function md5China1688(
  value
) {
  return createHash(
    "md5"
  )
    .update(
      String(value),
      "utf8"
    )
    .digest(
      "hex"
    );
}

function getChina1688SetCookies(
  response
) {
  if (
    typeof response.headers
      .getSetCookie ===
    "function"
  ) {
    return response.headers
      .getSetCookie();
  }

  const combinedCookie =
    response.headers.get(
      "set-cookie"
    );

  if (!combinedCookie) {
    return [];
  }

  return String(
    combinedCookie
  )
    .split(
      /,(?=\s*[_A-Za-z0-9-]+=)/
    )
    .map(cookie =>
      cookie.trim()
    )
    .filter(Boolean);
}

function extractChina1688Cookie(
  cookies,
  cookieName
) {
  for (
    const cookie
    of cookies
  ) {
    const match =
      String(cookie).match(
        new RegExp(
          `(?:^|;\\s*)${cookieName}=([^;]+)`,
          "i"
        )
      );

    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

function resetChina1688Session() {
  china1688Session.token =
    "";

  china1688Session.tokenCookie =
    "";

  china1688Session.tokenEncCookie =
    "";

  china1688Session.expiresAt =
    0;
}

async function performChina1688Bootstrap() {
  const bootstrapUrl =
    new URL(
      "/h5/mtop.relationrecommend.wirelessrecommend.recommend/2.0/",
      CHINA_1688_SOURCE_CONFIG.apiDomain
    );

  bootstrapUrl.searchParams.set(
    "jsv",
    "2.5.1"
  );

  bootstrapUrl.searchParams.set(
    "appKey",
    "12574478"
  );

  bootstrapUrl.searchParams.set(
    "t",
    String(
      Date.now()
    )
  );

  bootstrapUrl.searchParams.set(
    "sign",
    "x"
  );

  bootstrapUrl.searchParams.set(
    "api",
    "mtop.relationrecommend.WirelessRecommend.recommend"
  );

  bootstrapUrl.searchParams.set(
    "v",
    "2.0"
  );

  bootstrapUrl.searchParams.set(
    "data",
    "{}"
  );

  const response =
    await fetch(
      bootstrapUrl,
      {
        method:
          "GET",
        headers: {
          Accept:
            "application/json,text/plain,*/*",
          "Accept-Language":
            "zh-CN,zh;q=0.9,en;q=0.6",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/124 Safari/537.36",
          Referer:
            "https://www.1688.com/",
          Origin:
            "https://www.1688.com"
        },
        redirect:
          "follow",
        signal:
          AbortSignal.timeout(
            5000
          )
      }
    );

  const cookies =
    getChina1688SetCookies(
      response
    );

  const tokenCookie =
    extractChina1688Cookie(
      cookies,
      "_m_h5_tk"
    );

  const tokenEncCookie =
    extractChina1688Cookie(
      cookies,
      "_m_h5_tk_enc"
    );

  if (!tokenCookie) {
    const responseText =
      await response
        .text()
        .catch(() => "");

    throw new Error(
      `1688_TOKEN_NOT_RECEIVED ${
        cleanTrendText(
          responseText,
          180
        )
      }`
    );
  }

  china1688Session.tokenCookie =
    tokenCookie;

  china1688Session.tokenEncCookie =
    tokenEncCookie;

  china1688Session.token =
    tokenCookie.split(
      "_"
    )[0];

  china1688Session.expiresAt =
    Date.now() +
    75 * 60 * 1000;
}

async function bootstrapChina1688Session(
  force = false
) {
  if (
    !force &&
    china1688Session.token &&
    Date.now() <
      china1688Session.expiresAt
  ) {
    return;
  }

  if (
    force
  ) {
    resetChina1688Session();
  }

  if (
    china1688Session.bootstrapPromise
  ) {
    await china1688Session
      .bootstrapPromise;

    return;
  }

  china1688Session.bootstrapPromise =
    performChina1688Bootstrap();

  try {
    await china1688Session
      .bootstrapPromise;
  } finally {
    china1688Session.bootstrapPromise =
      null;
  }
}

async function executeChina1688Request(
  searchQuery,
  signalType
) {
  const signalConfig =
    CHINA_1688_SIGNAL_CONFIG[
      signalType
    ] ||
    CHINA_1688_SIGNAL_CONFIG.all;

  const params = {
    keywords:
      searchQuery,
    beginPage:
      1,
    pageSize:
      40,
    method:
      "getOfferList",
    verticalProductFlag:
      "pcmarket",
    searchScene:
      "pcOfferSearch",
    charset:
      "GBK"
  };

  if (
    signalConfig.sortType
  ) {
    params.sortType =
      signalConfig.sortType;
  }

  const data =
    JSON.stringify({
      appId:
        "32517",
      params:
        JSON.stringify(
          params
        )
    });

  const timestamp =
    String(
      Date.now()
    );

  const token =
    china1688Session.token;

  const tokenCookie =
    china1688Session.tokenCookie;

  const tokenEncCookie =
    china1688Session.tokenEncCookie;

  const sign =
    md5China1688(
      token +
      "&" +
      timestamp +
      "&12574478&" +
      data
    );

  const requestUrl =
    new URL(
      "/h5/mtop.relationrecommend.wirelessrecommend.recommend/2.0/",
      CHINA_1688_SOURCE_CONFIG.apiDomain
    );

  requestUrl.searchParams.set(
    "jsv",
    "2.5.1"
  );

  requestUrl.searchParams.set(
    "appKey",
    "12574478"
  );

  requestUrl.searchParams.set(
    "t",
    timestamp
  );

  requestUrl.searchParams.set(
    "sign",
    sign
  );

  requestUrl.searchParams.set(
    "api",
    "mtop.relationrecommend.WirelessRecommend.recommend"
  );

  requestUrl.searchParams.set(
    "v",
    "2.0"
  );

  requestUrl.searchParams.set(
    "data",
    data
  );

  const cookieHeader = [
    `_m_h5_tk=${tokenCookie}`,
    tokenEncCookie
      ? `_m_h5_tk_enc=${tokenEncCookie}`
      : ""
  ]
    .filter(Boolean)
    .join("; ");

  const response =
    await fetch(
      requestUrl,
      {
        method:
          "GET",
        headers: {
          Accept:
            "application/json,text/plain,*/*",
          "Accept-Language":
            "zh-CN,zh;q=0.9,en;q=0.6",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/124 Safari/537.36",
          Referer:
            "https://www.1688.com/",
          Origin:
            "https://www.1688.com",
          Cookie:
            cookieHeader
        },
        redirect:
          "follow",
        signal:
          AbortSignal.timeout(
            7000
          )
      }
    );

  if (!response.ok) {
    throw new Error(
      `1688_HTTP_${response.status}`
    );
  }

  const payload =
    await response.json();

  const returnCode =
    String(
      payload?.ret?.[0] || ""
    );

  return {
    payload,
    returnCode
  };
}

function buildChina1688Queries(
  category,
  searchDetails
) {
  const categoryConfig =
    MADE_IN_CHINA_CATEGORY_CONFIG[
      category
    ] ||
    MADE_IN_CHINA_CATEGORY_CONFIG.other;

  const queries = [];

  for (
    const group
    of categoryConfig.groups
  ) {
    const chineseQuery =
      CHINA_1688_GROUP_QUERIES[
        group.key
      ];

    if (!chineseQuery) {
      continue;
    }

    queries.push({
      searchQuery:
        chineseQuery,
      subgroup:
        group.key
    });
  }

  const details =
    cleanTrendText(
      searchDetails,
      120
    );

  if (
    details &&
    queries.length
  ) {
    queries.push({
      searchQuery:
        `${queries[0].searchQuery} ${details}`,
      subgroup:
        queries[0].subgroup
    });
  }

  return queries.slice(
    0,
    3
  );
}

async function fetchChina1688Offers(
  searchQuery,
  signalType
) {
  await bootstrapChina1688Session();

  let result =
    await executeChina1688Request(
      searchQuery,
      signalType
    );

  if (
    result.returnCode.startsWith(
      "FAIL_"
    ) &&
    (
      result.returnCode.includes(
        "TOKEN"
      ) ||
      result.returnCode.includes(
        "ILLEGAL_ACCESS"
      ) ||
      result.returnCode.includes(
        "EXOIRED"
      ) ||
      result.returnCode.includes(
        "EXPIRED"
      )
    )
  ) {
    await bootstrapChina1688Session(
      true
    );

    result =
      await executeChina1688Request(
        searchQuery,
        signalType
      );
  }

  if (
    result.returnCode.startsWith(
      "FAIL_"
    )
  ) {
    throw new Error(
      `1688_API_${result.returnCode}`
    );
  }

  const offerList =
    result.payload
      ?.data
      ?.data
      ?.offerList;

  if (
    !Array.isArray(
      offerList
    )
  ) {
    throw new Error(
      `1688_OFFER_LIST_MISSING ${
        cleanTrendText(
          JSON.stringify(
            result.payload?.data ||
            {}
          ),
          240
        )
      }`
    );
  }

  return {
    payload:
      result.payload,
    requestUrl:
      `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(
        searchQuery
      )}`
  };
}

function getChina1688ImageUrl(
  offer
) {
  const preferredKeys = [
    "imageUrl",
    "image",
    "imgUrl",
    "picUrl",
    "mainImage",
    "mainImageUrl",
    "offerImg",
    "offerImage"
  ];

  for (
    const key
    of preferredKeys
  ) {
    const value =
      offer?.[key];

    if (
      typeof value ===
        "string" &&
      value.includes(
        "http"
      )
    ) {
      return prepareChinaGalleryImageUrl(
        value,
        CHINA_1688_SOURCE_CONFIG.domain,
        CHINA_1688_SOURCE_CONFIG
      );
    }
  }

  const jsonText =
    JSON.stringify(
      offer || {}
    );

  const imageMatch =
    jsonText.match(
      /https?:\\?\/\\?\/[^"\\]+(?:alicdn|aliimg)[^"\\]+\.(?:jpg|jpeg|png|webp)[^"\\]*/i
    );

  if (!imageMatch?.[0]) {
    return null;
  }

  return prepareChinaGalleryImageUrl(
    imageMatch[0]
      .replace(
        /\\\//g,
        "/"
      ),
    CHINA_1688_SOURCE_CONFIG.domain,
    CHINA_1688_SOURCE_CONFIG
  );
}

function extractChina1688Price(
  offer
) {
  const directPrice =
    Number(
      offer?.priceInfo?.price ??
      offer?.price
    );

  if (
    Number.isFinite(
      directPrice
    ) &&
    directPrice > 0
  ) {
    return directPrice;
  }

  const priceRange =
    offer?.priceInfo?.priceRange;

  if (
    Array.isArray(
      priceRange
    )
  ) {
    const prices =
      priceRange
        .map(item =>
          Number(
            item?.price ??
            item
          )
        )
        .filter(price =>
          Number.isFinite(
            price
          ) &&
          price > 0
        );

    if (prices.length) {
      return Math.min(
        ...prices
      );
    }
  }

  return null;
}

function extractChina1688Products(
  payload,
  preferredSubgroup,
  searchQuery,
  exclusions
) {
  const offerList =
    payload?.data?.data?.offerList;

  if (
    !Array.isArray(
      offerList
    )
  ) {
    return [];
  }

  const products = [];

  for (
    const offer
    of offerList
  ) {
    const offerId =
      String(
        offer?.id ||
        offer?.offerId ||
        ""
      ).trim();

    const title =
      cleanTrendText(
        stripHtml(
          offer?.subject ||
          offer?.title ||
          ""
        ),
        320
      );

    if (
      !offerId ||
      !title
    ) {
      continue;
    }

    if (
      matchesExclusions(
        title,
        exclusions
      )
    ) {
      continue;
    }

    const blockedChineseWords = [
      "工业设备",
      "生产线",
      "大型设备",
      "工程机械",
      "集装箱房",
      "活动板房",
      "冷库",
      "仓储设备",
      "工厂设备",
      "商用设备"
    ];

    if (
      blockedChineseWords.some(
        word =>
          title.includes(
            word
          )
      )
    ) {
      continue;
    }

    const price =
      extractChina1688Price(
        offer
      );

    const transactionCount =
      Number(
        offer?.tradeInfo
          ?.tradeNumber ??
        offer?.monthSold ??
        0
      ) || 0;

    const moq =
      offer?.tradeInfo?.moq ??
      offer?.tradeInfo
        ?.minOrderQuantity ??
      null;

    const unit =
      cleanTrendText(
        offer?.tradeInfo?.unit,
        30
      );

    const supplier =
      cleanTrendText(
        offer?.company?.name,
        120
      );

    const descriptionParts =
      [];

    if (price) {
      descriptionParts.push(
        `¥${price}`
      );
    }

    if (moq) {
      descriptionParts.push(
        `MOQ ${moq}${unit || ""}`
      );
    }

    if (
      transactionCount > 0
    ) {
      descriptionParts.push(
        `成交 ${transactionCount}`
      );
    }

    if (supplier) {
      descriptionParts.push(
        supplier
      );
    }

    const queryScore =
      10;

    const categoryScore =
      10;

    const retailScore =
      15;

    products.push({
      productId:
        offerId,
      title,
      description:
        descriptionParts.join(
          " · "
        ) ||
        "Товар знайдений у внутрішній китайській видачі 1688.",
      link:
        `https://detail.1688.com/offer/${offerId}.html`,
      imageUrl:
        getChina1688ImageUrl(
          offer
        ),
      subgroup:
        preferredSubgroup,
      categoryScore,
      retailScore,
      queryScore,
      soldCount:
        transactionCount,
      sourcePosition:
        products.length + 1,
      matchedQuery:
        searchQuery
    });

    if (
      products.length >=
      40
    ) {
      break;
    }
  }

  return products;
}

async function loadChina1688Signal({
  category,
  signalType,
  searchDetails,
  exclusions
}) {
  const searchQueries =
    buildChina1688Queries(
      category,
      searchDetails
    );

  const requestResults =
    await Promise.allSettled(
      searchQueries.map(
        async queryItem => {
          const result =
            await fetchChina1688Offers(
              queryItem.searchQuery,
              signalType
            );

          return {
            ...result,
            queryItem
          };
        }
      )
    );

  const productsById =
    new Map();

  const checkedSources =
    [];

  let successfulRequests = 0;
  let totalExtracted = 0;
  let firstError = null;

  for (
    const requestResult
    of requestResults
  ) {
    if (
      requestResult.status !==
      "fulfilled"
    ) {
      firstError ||=
        requestResult.reason;

      continue;
    }

    successfulRequests += 1;

    const {
      payload,
      requestUrl,
      queryItem
    } =
      requestResult.value;

    checkedSources.push({
      query:
        queryItem.searchQuery,
      url:
        requestUrl
    });

    const products =
      extractChina1688Products(
        payload,
        queryItem.subgroup,
        queryItem.searchQuery,
        exclusions
      );

    totalExtracted +=
      products.length;

    for (
      const product
      of products
    ) {
      const current =
        productsById.get(
          product.productId
        );

      if (!current) {
        productsById.set(
          product.productId,
          {
            ...product,
            occurrenceCount:
              1,
            matchedQueries: [
              queryItem.searchQuery
            ],
            bestPosition:
              product.sourcePosition
          }
        );

        continue;
      }

      current.occurrenceCount +=
        1;

      current.soldCount =
        Math.max(
          current.soldCount || 0,
          product.soldCount || 0
        );

      current.bestPosition =
        Math.min(
          current.bestPosition,
          product.sourcePosition
        );

      if (
        !current.matchedQueries.includes(
          queryItem.searchQuery
        )
      ) {
        current.matchedQueries.push(
          queryItem.searchQuery
        );
      }
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

      const marketSignalScore =
        product.soldCount > 0
          ? Math.min(
              35,
              Math.log10(
                product.soldCount + 1
              ) * 12
            )
          : 0;

      const sourceSignalScore =
        product.retailScore * 3 +
        product.categoryScore * 2 +
        product.queryScore * 3 +
        positionScore +
        marketSignalScore;

      return {
        ...product,
        marketSignalScore,
        sourceSignalScore
      };
    })
    .sort(
      (first, second) =>
        second.sourceSignalScore -
        first.sourceSignalScore ||
        second.soldCount -
        first.soldCount ||
        first.bestPosition -
        second.bestPosition
    )
    .slice(
      0,
      50
    );

  const bestSourceScore =
    Math.max(
      ...rankedProducts.map(
        product =>
          product.sourceSignalScore ||
          0
      ),
      1
    );

  for (
    const product
    of rankedProducts
  ) {
    product.relevanceScore =
      Math.round(
        (
          product.sourceSignalScore /
          bestSourceScore
        ) *
        1000
      ) / 10;
  }

  const products =
    selectBalancedMadeInChinaProducts(
      rankedProducts,
      15
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
      CHINA_1688_SOURCE_CONFIG.sourceName,
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

function buildIdeasFromChina1688(
  sourceResult
) {
  const signalConfig =
    CHINA_1688_SIGNAL_CONFIG[
      sourceResult.sourceType
    ] ||
    CHINA_1688_SIGNAL_CONFIG.all;

  return sourceResult.products.map(
    product => ({
      id:
        `1688-${product.productId}`,
      title:
        product.title,
      imageUrl:
        product.imageUrl ||
        null,
      description:
        product.description,
      signal:
        signalConfig.label,
      signalType:
        sourceResult.sourceType,
      geography:
        CHINA_1688_SOURCE_CONFIG
          .geography,
      sources: [
        CHINA_1688_SOURCE_CONFIG
          .sourceName
      ],
      links: [
        {
          label:
            "Відкрити на 1688",
          url:
            product.link
        }
      ],
      sourcePosition:
        product.sourcePosition,
      relevanceScore:
        product.relevanceScore ||
        0,
      subgroup:
        product.subgroup ||
        null
    })
  );
}

function applyChinaCrossSourceRanking(
  ideas
) {
  const chinaIdeas =
    ideas.filter(idea =>
      Array.isArray(
        idea.sources
      ) &&
      (
        idea.sources.includes(
          "Made-in-China"
        ) ||
        idea.sources.includes(
          "Alibaba"
        ) ||
        idea.sources.includes(
          "1688"
        )
      )
    );

  function getComparableWords(
    title
  ) {
    const ignoredWords =
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
        "hot",
        "wholesale",
        "china",
        "quality"
      ]);

    return getChinaWords(
      title
    ).filter(word =>
      word.length >= 4 &&
      !ignoredWords.has(
        word
      )
    );
  }

  for (
    const idea
    of chinaIdeas
  ) {
    const ideaSource =
      idea.sources?.[0] || "";

    const ideaWords =
      getComparableWords(
        idea.title
      );

    let crossSourceMatches = 0;

    for (
      const otherIdea
      of chinaIdeas
    ) {
      const otherSource =
        otherIdea.sources?.[0] || "";

      if (
        otherIdea === idea ||
        otherSource === ideaSource ||
        (
          idea.subgroup &&
          otherIdea.subgroup &&
          idea.subgroup !==
            otherIdea.subgroup
        )
      ) {
        continue;
      }

      const otherWords =
        getComparableWords(
          otherIdea.title
        );

      const shorterLength =
        Math.min(
          ideaWords.length,
          otherWords.length
        );

      if (shorterLength < 2) {
        continue;
      }

      const overlap =
        ideaWords.filter(word =>
          otherWords.includes(
            word
          )
        ).length;

      if (
        overlap /
          shorterLength >=
        0.5
      ) {
        crossSourceMatches += 1;
      }
    }

    const crossSourceBonus =
      Math.min(
        crossSourceMatches,
        2
      ) * 12;

    idea.relevanceScore =
      Math.min(
        130,
        Number(
          idea.relevanceScore || 0
        ) +
        crossSourceBonus
      );

    idea.crossSourceMatches =
      crossSourceMatches;
  }

  return ideas;
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

  if (
    ALIBABA_SOURCE_CONFIG
      .supportedMarkets
      .has(market)
  ) {
    try {
      const alibabaResult =
        await loadAlibabaSignal({
          category,
          signalType,
          searchDetails,
          exclusions
        });

      sources.push(
        alibabaResult
      );

      ideas = ideas.concat(
        buildIdeasFromAlibaba(
          alibabaResult
        )
      );
    } catch (error) {
      console.error(
        "[Alibaba]",
        error
      );

      sources.push({
        source:
          ALIBABA_SOURCE_CONFIG
            .sourceName,
        sourceType:
          signalType,
        status:
          "error",
        message:
          "Alibaba тимчасово не повернув товарну видачу.",
        products:
          []
      });
    }
  }

  if (
    CHINA_1688_SOURCE_CONFIG
      .supportedMarkets
      .has(market)
  ) {
    try {
      const china1688Result =
        await loadChina1688Signal({
          category,
          signalType,
          searchDetails,
          exclusions
        });

      sources.push(
        china1688Result
      );

      ideas = ideas.concat(
        buildIdeasFromChina1688(
          china1688Result
        )
      );
    } catch (error) {
      console.error(
        "[1688]",
        error
      );

      sources.push({
        source:
          CHINA_1688_SOURCE_CONFIG
            .sourceName,
        sourceType:
          signalType,
        status:
          "error",
        message:
          "1688 тимчасово не повернув товарну видачу.",
        products:
          []
      });
    }
  }  

  ideas =
    applyChinaCrossSourceRanking(
      ideas
    );  

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
        Number(
          second.relevanceScore || 0
        ) -
        Number(
          first.relevanceScore || 0
        ) ||
        Number(
          first.sourcePosition || 99
        ) -
        Number(
          second.sourcePosition || 99
        )
    )
    .slice(
      0,
      36
    );

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
