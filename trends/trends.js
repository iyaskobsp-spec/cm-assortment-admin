const trendCategorySelect = document.getElementById(
  "trendCategorySelect"
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
