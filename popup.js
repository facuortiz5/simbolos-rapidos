const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const resultsElement = document.querySelector("#results");
const suggestionState = document.querySelector("#suggestion-state");
const suggestionTitle = document.querySelector(".suggestion__title");
const suggestionForm = document.querySelector("#suggestion-form");
const suggestionInput = document.querySelector("#suggestion-input");
const suggestionSubmit = document.querySelector("#suggestion-submit");
const suggestionSuccess = document.querySelector("#suggestion-success");
const suggestionError = document.querySelector("#suggestion-error");
const statusElement = document.querySelector("#status");
const languagePicker = document.querySelector("#language-picker");
const languageToggle = document.querySelector("#language-toggle");
const languageMenu = document.querySelector("#language-menu");
const activeLanguageElement = document.querySelector("#active-language");
const languageOptions = [...document.querySelectorAll("[data-language]")];
const SUGGESTION_ENDPOINT = "https://script.google.com/macros/s/AKfycbyqfOAccdiCQw0m8Ng3HmXH7akVKTCFPhe-iaUfH4zQwc2Phw5cc-mmWYjsy8xEr0iyDg/exec";
const RECENT_STORAGE_KEY = "recentSymbols";
const LEGACY_USAGE_STORAGE_KEY = "symbolUsageStats";
const UI_LANGUAGE_STORAGE_KEY = "uiLanguage";
const FAVORITES_STORAGE_KEY = "favoriteSymbols";
const DEFAULT_RECENT_SYMBOLS = ["ñ", "@", "á", "é", "ó"];
const LOCALE_DIRECTORIES = { es: "es_419", en: "en" };
const symbolsByValue = new Map(SYMBOLS.map((item) => [item.symbol, item]));

let visibleResults = [];
let statusTimeout;
let recentSymbols = [...DEFAULT_RECENT_SYMBOLS];
let isSendingSuggestion = false;
let suggestionStateVersion = 0;
let activeLanguage = "en";
let translations = {};
let currentStatus = null;
let activeView = "home";
let favoriteSymbols = [];
let favoriteSaveQueue = Promise.resolve();

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function t(key) {
  return translations[key] ?? key;
}

function getSymbolName(item) {
  return activeLanguage === "es" ? item.name : item.nameEn;
}

function isUppercaseLatinSymbol(symbol) {
  return /^\p{Lu}$/u.test(symbol) && /^\p{Script=Latin}$/u.test(symbol);
}

function scoreSymbol(item, query) {
  const compactQuery = query.replace(/\s/g, "");
  const terms = [item.symbol, item.name, item.nameEn, ...item.keywords].map(normalizeText);
  let bestScore = 0;

  for (const term of terms) {
    const compactTerm = term.replace(/\s/g, "");

    if (term === query) bestScore = Math.max(bestScore, 100);
    else if (compactTerm === compactQuery) bestScore = Math.max(bestScore, 95);
    else if (term.startsWith(query)) bestScore = Math.max(bestScore, 80);
    else if (compactTerm.startsWith(compactQuery)) bestScore = Math.max(bestScore, 75);
    else if (term.includes(query)) bestScore = Math.max(bestScore, 60);
  }

  const searchableText = terms.join(" ");
  const allWordsMatch = query.split(" ").every((word) => searchableText.includes(word));

  if (allWordsMatch) bestScore = Math.max(bestScore, 50);
  return bestScore;
}

function buildRecentSymbols(symbols) {
  const result = [];

  for (const symbol of [...symbols, ...DEFAULT_RECENT_SYMBOLS]) {
    if (symbolsByValue.has(symbol) && !result.includes(symbol)) {
      result.push(symbol);
    }

    if (result.length === 6) break;
  }

  return result;
}

function searchSymbols(rawQuery) {
  const query = normalizeText(rawQuery);

  if (!query) return [];

  const greekCategoryQueries = [
    "greek",
    "griego",
    "griega",
    "alfabeto griego",
    "greek alphabet"
  ];

  if (greekCategoryQueries.includes(query)) {
    return SYMBOLS.filter((item) => scoreSymbol(item, "greek") > 0);
  }

  return SYMBOLS
    .map((item, index) => ({ item, index, score: scoreSymbol(item, query) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((result) => result.item);
}

function getDisplaySymbol(symbol) {
  // VS15 pide presentación de texto; el valor original se conserva al copiar.
  return /^[\u2648-\u2653♥]$/u.test(symbol) ? `${symbol}\uFE0E` : symbol;
}

function createStarIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  icon.classList.add("star-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute("d", "m12 2 2.8 7.1 7.6.5-5.9 4.9 1.9 7.4-6.4-4.2-6.4 4.2 1.9-7.4-5.9-4.9 7.6-.5Z");
  icon.append(path);
  return icon;
}

function updateFavoriteButton(button, item) {
  const isFavorite = favoriteSymbols.includes(item.symbol);
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute("aria-label", `${t(isFavorite ? "removeFavorite" : "addFavorite")}: ${getSymbolName(item)}`);
}

function toggleFavorite(item, button) {
  const index = visibleResults.findIndex((result) => result.symbol === item.symbol);
  favoriteSymbols = favoriteSymbols.includes(item.symbol)
    ? favoriteSymbols.filter((symbol) => symbol !== item.symbol)
    : [...favoriteSymbols, item.symbol];

  if (activeView === "favorites" && !normalizeText(searchInput.value)) {
    const scrollTop = resultsElement.scrollTop;
    renderResults();
    resultsElement.scrollTop = scrollTop;
    const stars = resultsElement.querySelectorAll(".result__favorite");
    const nextFocus = stars[Math.min(index, stars.length - 1)] ?? resultsElement.querySelector(".view-back");
    nextFocus.focus({ preventScroll: true });
  } else {
    updateFavoriteButton(button, item);
  }

  // Serializar las escrituras conserva el orden incluso con clics rápidos.
  const savedSymbols = [...favoriteSymbols];
  favoriteSaveQueue = favoriteSaveQueue
    .then(() => chrome.storage.local.set({ [FAVORITES_STORAGE_KEY]: savedSymbols }))
    .catch((error) => {
      console.error("No se pudieron guardar los favoritos:", error);
      showStatus("favoritesSaveError");
    });
}

function createResultButton(item) {
  const row = document.createElement("div");
  const copyButton = document.createElement("button");
  const symbol = document.createElement("span");
  const details = document.createElement("span");
  const name = document.createElement("span");
  const favoriteButton = document.createElement("button");
  const copyLabel = document.createElement("span");

  row.className = "result";
  row.dataset.symbol = item.symbol;
  copyButton.type = "button";
  copyButton.className = "result__copy-target";
  copyButton.setAttribute("aria-label", `${t("copy")} ${getSymbolName(item)}: ${item.symbol}`);
  copyButton.addEventListener("click", () => copySymbol(item.symbol));

  symbol.className = "result__symbol";
  if (isUppercaseLatinSymbol(item.symbol)) {
    symbol.classList.add("result__symbol--uppercase-latin");
  }
  symbol.textContent = getDisplaySymbol(item.symbol);
  if (/^[\u2648-\u2653♥]$/u.test(item.symbol)) {
    symbol.classList.add("symbol--text");
  }

  details.className = "result__details";
  name.className = "result__name";
  name.textContent = getSymbolName(item);
  name.title = getSymbolName(item);

  favoriteButton.type = "button";
  favoriteButton.className = "star-button result__favorite";
  favoriteButton.append(createStarIcon());
  updateFavoriteButton(favoriteButton, item);
  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFavorite(item, favoriteButton);
  });

  copyLabel.className = "result__copy";
  copyLabel.textContent = t("copy");

  details.append(name, favoriteButton);

  if (item.symbol === recentSymbols[0]) {
    const recentLabel = document.createElement("span");
    recentLabel.className = "result__recent";
    recentLabel.textContent = t("recentLabel");
    details.append(recentLabel);
  }

  row.append(copyButton, symbol, details, copyLabel);

  return row;
}

function getCategorySymbols(category) {
  if (category.id === "favorites") {
    return favoriteSymbols.map((symbol) => symbolsByValue.get(symbol));
  }

  if (category.id === "all") {
    const prioritizedSymbols = new Set();
    const prioritizedItems = [];

    for (const symbol of recentSymbols) {
      const item = symbolsByValue.get(symbol);

      if (item && !prioritizedSymbols.has(symbol)) {
        prioritizedSymbols.add(symbol);
        prioritizedItems.push(item);
      }

      if (prioritizedItems.length === 5) break;
    }

    return [
      ...prioritizedItems,
      ...SYMBOLS.filter((item) => !prioritizedSymbols.has(item.symbol))
    ];
  }

  return SYMBOLS.filter((item) => category.symbols.includes(item.symbol));
}

function openView(view) {
  activeView = view === "favorites" && activeView === "favorites" ? "home" : view;
  searchInput.value = "";
  resetSuggestionState();
  renderResults();
  resultsElement.scrollTop = 0;
  const focusTarget = activeView === "home" ? searchInput : resultsElement.querySelector(".view-back");
  focusTarget.focus({ preventScroll: true });
}

function createCategoryButton(category) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "result category";
  button.dataset.category = category.id;
  button.setAttribute("aria-label", t(category.labelKey));

  const icon = document.createElement("span");
  icon.className = "result__symbol";
  icon.setAttribute("aria-hidden", "true");
  if (category.icon === "clock") {
    icon.innerHTML = '<svg class="category__clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 6v6h5"></path></svg>';
  } else {
    icon.textContent = getDisplaySymbol(category.icon);
    if (category.id === "zodiac") icon.classList.add("symbol--text");
  }

  const name = document.createElement("span");
  name.className = "result__name category__name";
  name.textContent = t(category.labelKey);

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.classList.add("category__chevron");
  chevron.setAttribute("viewBox", "0 0 8 12");
  chevron.setAttribute("aria-hidden", "true");
  chevron.innerHTML = '<path d="m2 1 5 5-5 5"></path>';
  button.append(icon, name, chevron);
  button.addEventListener("click", () => openView(category.id));
  return button;
}

function createBackButton(title) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "view-back";
  button.setAttribute("aria-label", `${t("backHome")}: ${title}`);
  const arrow = document.createElement("span");
  arrow.textContent = "←";
  arrow.setAttribute("aria-hidden", "true");
  button.append(arrow, title);
  button.addEventListener("click", () => openView("home"));
  return button;
}

function renderResults() {
  const hasQuery = Boolean(normalizeText(searchInput.value));
  let content;

  if (hasQuery) {
    visibleResults = searchSymbols(searchInput.value);
    content = visibleResults.map(createResultButton);
  } else if (activeView === "home") {
    visibleResults = recentSymbols.slice(0, 1).map((symbol) => symbolsByValue.get(symbol));
    content = [
      ...visibleResults.map(createResultButton),
      ...SYMBOL_CATEGORIES.map(createCategoryButton)
    ];
  } else {
    const category = SYMBOL_CATEGORIES.find((item) => item.id === activeView);
    const title = t(category.labelKey);
    visibleResults = getCategorySymbols(category);
    content = [createBackButton(title), ...visibleResults.map(createResultButton)];

    if (activeView === "favorites" && visibleResults.length === 0) {
      const message = document.createElement("p");
      message.className = "view-empty";
      message.textContent = t("favoritesEmpty");
      content.push(message);
    }
  }

  const showSuggestion = hasQuery && visibleResults.length === 0;
  resultsElement.replaceChildren(...content);
  resultsElement.hidden = showSuggestion;
  suggestionState.hidden = !showSuggestion;
}

function getStatusText() {
  if (!currentStatus) return "";

  const suffix = currentStatus.symbol ? ` ${getDisplaySymbol(currentStatus.symbol)}` : "";
  return `${t(currentStatus.key)}${suffix}`;
}

function showStatus(key, symbol = "") {
  clearTimeout(statusTimeout);
  currentStatus = { key, symbol };
  statusElement.textContent = getStatusText();
  statusElement.classList.add("status--visible");

  statusTimeout = setTimeout(() => {
    statusElement.classList.remove("status--visible");
    currentStatus = null;
  }, 1000);
}

function setSuggestionSending(isSending) {
  suggestionInput.disabled = isSending;
  suggestionSubmit.disabled = isSending;
  suggestionSubmit.textContent = isSending ? t("sending") : t("sendSuggestion");
}

async function loadTranslations(language) {
  const localeDirectory = LOCALE_DIRECTORIES[language];
  const messagesUrl = chrome.runtime.getURL(`_locales/${localeDirectory}/messages.json`);
  const response = await fetch(messagesUrl);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las traducciones: ${response.status}`);
  }

  const messages = await response.json();
  return Object.fromEntries(
    Object.entries(messages).map(([key, value]) => [key, value.message])
  );
}

function applyTranslations() {
  document.documentElement.lang = activeLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  activeLanguageElement.textContent = activeLanguage.toUpperCase();
  languageOptions.forEach((option) => {
    const isActiveOption = option.dataset.language === activeLanguage;
    option.hidden = isActiveOption;
    option.setAttribute("aria-current", String(isActiveOption));
  });

  setSuggestionSending(isSendingSuggestion);

  if (currentStatus) {
    statusElement.textContent = getStatusText();
  }
}

function closeLanguageMenu() {
  languageMenu.hidden = true;
  languageToggle.setAttribute("aria-expanded", "false");
}

async function setUiLanguage(language, { persist = false, render = true } = {}) {
  const normalizedLanguage = LOCALE_DIRECTORIES[language] ? language : "en";
  const nextTranslations = await loadTranslations(normalizedLanguage);

  activeLanguage = normalizedLanguage;
  translations = nextTranslations;
  applyTranslations();
  closeLanguageMenu();

  if (render) {
    renderResults();
  }

  if (persist) {
    await chrome.storage.local.set({ [UI_LANGUAGE_STORAGE_KEY]: activeLanguage });
  }
}

async function initializeUiLanguage() {
  const detectedLanguage = chrome.i18n.getUILanguage().toLowerCase().startsWith("es")
    ? "es"
    : "en";
  let initialLanguage = detectedLanguage;

  try {
    const storedData = await chrome.storage.local.get(UI_LANGUAGE_STORAGE_KEY);

    if (LOCALE_DIRECTORIES[storedData[UI_LANGUAGE_STORAGE_KEY]]) {
      initialLanguage = storedData[UI_LANGUAGE_STORAGE_KEY];
    }
  } catch (error) {
    console.error("No se pudo cargar la preferencia de idioma:", error);
  }

  try {
    await setUiLanguage(initialLanguage, { render: false });
  } catch (error) {
    console.error("No se pudo inicializar el idioma:", error);
    activeLanguage = initialLanguage;
    activeLanguageElement.textContent = initialLanguage.toUpperCase();
    document.documentElement.lang = initialLanguage;
  }
}

function resetSuggestionState() {
  suggestionStateVersion += 1;
  isSendingSuggestion = false;
  suggestionInput.value = "";
  suggestionTitle.hidden = false;
  suggestionForm.hidden = false;
  suggestionSuccess.hidden = true;
  suggestionError.hidden = true;
  setSuggestionSending(false);
}

async function submitSuggestion(event) {
  event.preventDefault();

  const description = suggestionInput.value.trim();

  if (!description || isSendingSuggestion) {
    if (!description) suggestionInput.focus();
    return;
  }

  const currentStateVersion = suggestionStateVersion;
  isSendingSuggestion = true;
  suggestionError.hidden = true;
  setSuggestionSending(true);

  try {
    const response = await fetch(SUGGESTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: description })
    });

    if (!response.ok) {
      throw new Error(`El servidor respondió con estado ${response.status}`);
    }

    if (currentStateVersion !== suggestionStateVersion) return;

    suggestionTitle.hidden = true;
    suggestionForm.hidden = true;
    suggestionSuccess.hidden = false;
  } catch (error) {
    if (currentStateVersion !== suggestionStateVersion) return;

    console.error("No se pudo enviar la sugerencia:", error);
    suggestionError.hidden = false;
  } finally {
    if (currentStateVersion === suggestionStateVersion) {
      isSendingSuggestion = false;
      setSuggestionSending(false);
    }
  }
}

async function loadRecentSymbols() {
  try {
    const storedData = await chrome.storage.local.get([
      RECENT_STORAGE_KEY,
      LEGACY_USAGE_STORAGE_KEY
    ]);
    const storedRecentSymbols = storedData[RECENT_STORAGE_KEY];
    const legacyUsageStats = storedData[LEGACY_USAGE_STORAGE_KEY] ?? {};
    const legacyRecentSymbols = Object.entries(legacyUsageStats)
      .filter(([symbol, stats]) => {
        return symbolsByValue.has(symbol) && stats && Number.isFinite(stats.lastUsed);
      })
      .sort(([, statsA], [, statsB]) => statsB.lastUsed - statsA.lastUsed)
      .map(([symbol]) => symbol);

    recentSymbols = buildRecentSymbols(
      Array.isArray(storedRecentSymbols) ? storedRecentSymbols : legacyRecentSymbols
    );

    await chrome.storage.local.set({ [RECENT_STORAGE_KEY]: recentSymbols });

  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
    recentSymbols = [...DEFAULT_RECENT_SYMBOLS];
  }
}

async function recordRecentSymbol(symbol) {
  recentSymbols = buildRecentSymbols([
    symbol,
    ...recentSymbols.filter((recentSymbol) => recentSymbol !== symbol)
  ]);

  await chrome.storage.local.set({ [RECENT_STORAGE_KEY]: recentSymbols });
}

async function loadFavoriteSymbols() {
  try {
    const storedData = await chrome.storage.local.get(FAVORITES_STORAGE_KEY);
    const savedSymbols = storedData[FAVORITES_STORAGE_KEY];
    favoriteSymbols = Array.isArray(savedSymbols)
      ? [...new Set(savedSymbols)].filter((symbol) => symbolsByValue.has(symbol))
      : [];
  } catch (error) {
    console.error("No se pudieron cargar los favoritos:", error);
    favoriteSymbols = [];
  }
}

async function copySymbol(symbol) {
  try {
    await navigator.clipboard.writeText(symbol);
  } catch (error) {
    console.error("No se pudo copiar el símbolo:", error);
    showStatus("copyError");
    return;
  }

  try {
    await recordRecentSymbol(symbol);
  } catch (error) {
    console.error("No se pudo guardar el historial:", error);
  }

  searchInput.value = "";
  activeView = "home";
  renderResults();
  resultsElement.scrollTop = 0;
  searchInput.focus();
  showStatus("copied", symbol);
}

searchInput.addEventListener("input", () => {
  activeView = "home";
  resetSuggestionState();
  renderResults();
  resultsElement.scrollTop = 0;
});

suggestionInput.addEventListener("input", () => {
  suggestionError.hidden = true;
});

suggestionForm.addEventListener("submit", submitSuggestion);

languageToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  languageMenu.hidden = !languageMenu.hidden;
  languageToggle.setAttribute("aria-expanded", String(!languageMenu.hidden));
});

languageOptions.forEach((option) => {
  option.addEventListener("click", async (event) => {
    event.stopPropagation();

    try {
      await setUiLanguage(option.dataset.language, { persist: true });
    } catch (error) {
      console.error("No se pudo cambiar el idioma:", error);
      closeLanguageMenu();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!languagePicker.contains(event.target)) {
    closeLanguageMenu();
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const isEditable = target?.closest("input, textarea, [contenteditable]:not([contenteditable='false'])");

  if (!event.defaultPrevented && event.key === "Backspace" && activeView !== "home" && !isEditable) {
    event.preventDefault();
    openView("home");
    return;
  }

  if (event.key === "Escape" && !languageMenu.hidden) {
    closeLanguageMenu();
    languageToggle.focus();
  }
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (visibleResults.length > 0) {
    copySymbol(visibleResults[0].symbol);
  }
});

async function initialize() {
  try {
    await Promise.all([loadRecentSymbols(), loadFavoriteSymbols(), initializeUiLanguage()]);
    renderResults();
  } finally {
    document.documentElement.classList.remove("i18n-loading");
    searchInput.focus();
  }
}

initialize();
