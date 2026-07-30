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

function escapeTrendHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showTrendMessage(title, message) {
  trendIdeasList.innerHTML = `
    <article class="idea-card empty-state">
      <strong>${escapeTrendHtml(title)}</strong>
      <p>${escapeTrendHtml(message)}</p>
    </article>
  `;
}

async function processTrendSearch() {
  const category = trendCategorySelect.value;
  const categoryLabel =
    trendCategorySelect.options[
      trendCategorySelect.selectedIndex
    ]?.textContent?.trim() || "";

  const signalType = trendSearchType.value;
  const market = trendMarketSelect.value;

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

  const buttonText = trendSearchButton.textContent;

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

    trendIdeasList.innerHTML = ideas
      .map(idea => {
        const title = escapeTrendHtml(
          idea.title || "Товарна ідея"
        );

        const description = escapeTrendHtml(
          idea.description ||
          "Опис поки відсутній."
        );

        const signal = escapeTrendHtml(
          idea.signal || "Сигнал не визначено"
        );

        const geography = escapeTrendHtml(
          idea.geography || "Не визначено"
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

        return `
          <article class="idea-card">
            <strong>${title}</strong>

            <p>${description}</p>

            <p>
              <b>Сигнал:</b> ${signal}<br>
              <b>Ринки:</b> ${geography}<br>
              <b>Джерела:</b> ${sourceNames}
            </p>
          </article>
        `;
      })
      .join("");

    trendSearchResult.textContent =
      data.summary ||
      "Знайдені ідеї варто перевірити детальніше перед додаванням в асортимент.";
  } catch (error) {
    showTrendMessage(
      "Пошук не виконано",
      error.message ||
      "Не вдалося отримати дані."
    );

    trendSearchResult.textContent =
      "Серверний пошук новинок ще не підключений або тимчасово не відповідає.";
  } finally {
    trendSearchButton.disabled = false;
    trendSearchButton.textContent = buttonText;
  }
}

trendSearchButton.addEventListener(
  "click",
  processTrendSearch
);
