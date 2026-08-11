const trendCategorySelect = document.getElementById(
  "trendCategorySelect"
);

const trendRefinementSelect =
  document.getElementById(
    "trendRefinementSelect"
  );

const trendSearchType = document.getElementById(
  "trendSearchType"
);

const trendMarketSelect = document.getElementById(
  "trendMarketSelect"
);

const trendSearchInput = document.getElementById(
  "trendSearchInput"
);

const trendExcludeInput = document.getElementById(
  "trendExcludeInput"
);

const trendSearchButton = document.getElementById(
  "trendSearchButton"
);

const trendIdeasList = document.getElementById(
  "trendIdeasList"
);

const trendSearchResult = document.getElementById(
  "trendSearchResult"
);

const trendResultsModal = document.getElementById(
  "trendResultsModal"
);

const trendResultsCount = document.getElementById(
  "trendResultsCount"
);

const trendResultsSummary = document.getElementById(
  "trendResultsSummary"
);

const trendResultsGrid = document.getElementById(
  "trendResultsGrid"
);

const closeTrendResultsButton = document.getElementById(
  "closeTrendResultsButton"
);

const TREND_REFINEMENT_OPTIONS = {
  "home-kitchen": [
    ["kitchen-gadgets", "Кухонні гаджети та інструменти"],
    ["food-storage", "Зберігання продуктів"],
    ["tableware", "Посуд і сервірування"],
    ["baking", "Випічка"],
    ["sink-accessories", "Аксесуари для мийки"]
  ],

  "storage-organization": [
    ["wardrobe-storage", "Шафа та гардероб"],
    ["drawer-desktop", "Шухляди та робочий стіл"],
    ["bathroom-storage", "Зберігання у ванній"],
    ["kitchen-storage", "Зберігання на кухні"],
    ["boxes-baskets", "Короби, кошики та контейнери"]
  ],

  "decor": [
    ["vases-planters", "Вази та кашпо"],
    ["candles-holders", "Свічники та аромадекор"],
    ["figurines-ornaments", "Статуетки та декоративні фігури"],
    ["trays-stands", "Декоративні таці та підставки"],
    ["frames-wall-decor", "Рамки та настінний декор"],
    ["textile-decor", "Текстильний декор"]
  ],

  "household": [
    ["cleaning-tools", "Прибирання"],
    ["laundry-care", "Прання та догляд за одягом"],
    ["bathroom-daily-use", "Побутові товари для ванної"],
    ["waste-disposal", "Сміття та утилізація"],
    ["home-care-gadgets", "Корисні побутові гаджети"]
  ],

  "beauty-care": [
    ["skincare", "Догляд за шкірою"],
    ["masks-patches", "Маски та патчі"],
    ["makeup", "Декоративна косметика"],
    ["makeup-accessories", "Аксесуари для макіяжу"],
    ["beauty-devices", "Б'юті-пристрої та масажери"],
    ["hair-care", "Догляд за волоссям"],
    ["body-care", "Догляд за тілом"],
    ["nail-care", "Догляд за нігтями"]
  ],

  "kids": [
    ["feeding", "Годування"],
    ["hygiene", "Гігієна та догляд"],
    ["safety", "Безпека"],
    ["travel", "Прогулянки та подорожі"],
    ["sleep-nursery", "Сон та дитяча кімната"]
  ],

  "toys": [
    ["educational", "Розвивальні та навчальні"],
    ["sensory-fidget", "Сенсорні та антистрес"],
    ["building-puzzles", "Конструктори та пазли"],
    ["creative-sets", "Творчі набори"],
    ["role-play", "Сюжетно-рольові"],
    ["interactive", "Інтерактивні та електронні"]
  ],

  "stationery": [
    ["writing", "Ручки, олівці та маркери"],
    ["notebooks-planners", "Блокноти та планери"],
    ["stickers-paper", "Стікери, папір та нотатки"],
    ["cases-organizers", "Пенали та органайзери"],
    ["art-supplies", "Товари для малювання і творчості"]
  ],

  "accessories": [
    ["hair-accessories", "Аксесуари для волосся"],
    ["jewelry", "Біжутерія та прикраси"],
    ["wallets-holders", "Гаманці та кардхолдери"],
    ["bag-accessories", "Аксесуари для сумок"],
    ["phone-fashion", "Модні аксесуари для телефону"],
    ["eyewear", "Окуляри та аксесуари"]
  ],

  "pets": [
    ["toys", "Іграшки для тварин"],
    ["walking", "Прогулянки"],
    ["grooming", "Грумінг та догляд"],
    ["beds-travel", "Лежанки та подорожі"]
  ],

  "seasonal": [
    ["christmas", "Різдво та Новий рік"],
    ["halloween", "Halloween"],
    ["easter", "Великдень"],
    ["party", "Свята та вечірки"],
    ["summer", "Літні товари"],
    ["back-to-school", "Back to school"]
  ],

  "gifts": [
    ["gift-sets", "Подарункові набори"],
    ["candles-aroma", "Свічки та аромаподарунки"],
    ["frames-keepsakes", "Рамки та пам'ятні подарунки"],
    ["figurines-souvenirs", "Сувеніри та декоративні подарунки"],
    ["personal-gifts", "Персоналізовані подарунки"],
    ["novelty-gifts", "Незвичайні та креативні подарунки"]
  ],

  "electronics-accessories": [
    ["charging", "Зарядки та кабелі"],
    ["phone-holders", "Тримачі та підставки"],
    ["audio", "Аудіоаксесуари"],
    ["smart-trackers", "Трекери та smart-аксесуари"],
    ["lighting-gadgets", "Невеликі світлові гаджети"],
    ["computer-accessories", "Комп'ютерні аксесуари"]
  ],

  "other": [
    ["daily-use", "Корисні товари щоденного використання"],
    ["novelty", "Нові та незвичайні товари"]
  ]
};

function updateTrendRefinementOptions() {
  const category =
    trendCategorySelect.value;

  const options =
    TREND_REFINEMENT_OPTIONS[
      category
    ] || [];

  trendRefinementSelect.innerHTML =
    "";

  const defaultOption =
    document.createElement(
      "option"
    );

  defaultOption.value = "";

  defaultOption.textContent =
    options.length
      ? "Уся категорія"
      : "Немає уточнень";

  trendRefinementSelect.appendChild(
    defaultOption
  );

  for (
    const [
      value,
      label
    ]
    of options
  ) {
    const option =
      document.createElement(
        "option"
      );

    option.value =
      value;

    option.textContent =
      label;

    trendRefinementSelect.appendChild(
      option
    );
  }

  trendRefinementSelect.disabled =
    !options.length;
}

trendCategorySelect.addEventListener(
  "change",
  updateTrendRefinementOptions
);

function escapeTrendHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSafeTrendUrl(value) {
  try {
    const url = new URL(String(value || ""));

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function showTrendMessage(title, message) {
  trendIdeasList.innerHTML = `
    <article class="idea-card empty-state">
      <strong>${escapeTrendHtml(title)}</strong>
      <p>${escapeTrendHtml(message)}</p>
    </article>
  `;
}

function openTrendResultsModal() {
  trendResultsModal.hidden = false;
  document.body.classList.add("trend-modal-open");
}

function closeTrendResultsModal() {
  trendResultsModal.hidden = true;
  document.body.classList.remove("trend-modal-open");
}

function getTrendPrimaryLink(idea) {
  const links = Array.isArray(idea.links)
    ? idea.links
    : [];

  const firstValidLink = links.find(link =>
    getSafeTrendUrl(link?.url)
  );

  if (!firstValidLink) {
    return null;
  }

  return {
    label:
      String(firstValidLink.label || "").trim() ||
      "Відкрити товар",
    url: getSafeTrendUrl(firstValidLink.url)
  };
}

function renderTrendResults(ideas, summary) {
  trendResultsCount.textContent =
    `Знайдено товарних ідей: ${ideas.length}`;

  trendResultsSummary.textContent =
    summary ||
    "Знайдені товари варто переглянути детальніше перед рішенням щодо асортименту.";

  trendResultsGrid.innerHTML = ideas
    .map((idea, index) => {
      const title = escapeTrendHtml(
        idea.title || "Товарна ідея"
      );

      const description = escapeTrendHtml(
        idea.description ||
        "Опис поки відсутній."
      );

      const signal = escapeTrendHtml(
        idea.signal ||
        "Сигнал не визначено"
      );

      const geography = escapeTrendHtml(
        idea.geography ||
        "Ринок не визначено"
      );

      const sourceNames = Array.isArray(
        idea.sources
      )
        ? idea.sources
            .map(source =>
              escapeTrendHtml(source)
            )
            .join(", ")
        : "Джерела не вказані";

      const sourcePosition =
        Number(idea.sourcePosition) > 0
          ? Number(idea.sourcePosition)
          : index + 1;

      const imageUrl = getSafeTrendUrl(
        idea.imageUrl
      );

      const primaryLink =
        getTrendPrimaryLink(idea);

      const imageContent = imageUrl
        ? `
          <img
            class="trend-product-image"
            src="${escapeTrendHtml(imageUrl)}"
            alt="${title}"
            loading="lazy"
            referrerpolicy="no-referrer"
          >
        `
        : `
          <div class="trend-product-image-placeholder">
            Фото товару з’явиться після підключення зображень джерела
          </div>
        `;

      const linkContent = primaryLink
        ? `
          <a
            class="trend-product-link"
            href="${escapeTrendHtml(primaryLink.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${escapeTrendHtml(primaryLink.label)}
          </a>
        `
        : "";

      return `
        <article class="trend-product-card">
          <div class="trend-product-image-wrap">
            <span class="trend-product-position">
              №${sourcePosition}
            </span>

            ${imageContent}
          </div>

          <div class="trend-product-content">
            <h3 class="trend-product-title">
              ${title}
            </h3>

            <p class="trend-product-description">
              ${description}
            </p>

            <div class="trend-product-meta">
              <span>
                <strong>Сигнал:</strong>
                ${signal}
              </span>

              <span>
                <strong>Ринок:</strong>
                ${geography}
              </span>

              <span>
                <strong>Джерело:</strong>
                ${sourceNames}
              </span>
            </div>

            ${linkContent}
          </div>
        </article>
      `;
    })
    .join("");

  openTrendResultsModal();
}

async function processTrendSearch() {
  const category =
    trendCategorySelect.value;

  const categoryLabel =
    trendCategorySelect.options[
      trendCategorySelect.selectedIndex
    ]?.textContent?.trim() || "";

  const signalType =
    trendSearchType.value;

  const market =
    trendMarketSelect.value;

  const refinementKey =
    trendRefinementSelect.value;

  const searchDetails =
    trendSearchInput.value.trim();

  const exclusions =
    trendExcludeInput.value.trim();

  if (!category) {
    showTrendMessage(
      "Оберіть категорію",
      "Для пошуку новинок і трендів потрібна широка категорія товару."
    );

    trendSearchResult.textContent =
      "Після вибору категорії система зможе сформувати міжнародний пошук.";

    trendCategorySelect.focus();
    return;
  }

  const buttonText =
    trendSearchButton.textContent;

  trendSearchButton.disabled = true;
  trendSearchButton.textContent = "Шукаємо...";

  showTrendMessage(
    "Пошук запущено",
    `Перевіряємо міжнародні джерела за категорією «${categoryLabel}».`
  );

  trendSearchResult.textContent =
    "Збираємо товарні сигнали та відсіюємо нерелевантні результати.";

  try {
    const response = await fetch(
      "https://cm-assortment-admin-production.up.railway.app/api/trends",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          categoryLabel,
          signalType,
          market,
          refinementKey,
          searchDetails,
          exclusions
        })
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Не вдалося виконати пошук новинок."
      );
    }

    const ideas = Array.isArray(data.ideas)
      ? data.ideas
      : [];

    if (!ideas.length) {
      showTrendMessage(
        "Результатів поки немає",
        "За вибраними параметрами не знайдено достатньо сильних товарних сигналів."
      );

      trendSearchResult.textContent =
        data.summary ||
        "Спробуй ширшу категорію, інший ринок або прибери частину виключень.";

      return;
    }

    showTrendMessage(
      "Результати готові",
      `Знайдено товарних ідей: ${ideas.length}. Відкрито окреме вікно з деталями.`
    );

    trendSearchResult.textContent =
      data.summary ||
      "Результати відкрито в окремому вікні.";

    renderTrendResults(
      ideas,
      data.summary
    );
  } catch (error) {
    showTrendMessage(
      "Пошук не виконано",
      error.message ||
      "Не вдалося отримати дані."
    );

    trendSearchResult.textContent =
      "Серверний пошук новинок тимчасово не відповідає.";
  } finally {
    trendSearchButton.disabled = false;
    trendSearchButton.textContent =
      buttonText;
  }
}

trendSearchButton.addEventListener(
  "click",
  processTrendSearch
);

closeTrendResultsButton.addEventListener(
  "click",
  closeTrendResultsModal
);

trendResultsModal.addEventListener(
  "click",
  event => {
    if (event.target === trendResultsModal) {
      closeTrendResultsModal();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      !trendResultsModal.hidden
    ) {
      closeTrendResultsModal();
    }
  }
);
