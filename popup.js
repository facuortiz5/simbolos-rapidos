const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const resultsElement = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const statusElement = document.querySelector("#status");
const RECENT_STORAGE_KEY = "recentSymbols";
const LEGACY_USAGE_STORAGE_KEY = "symbolUsageStats";
const DEFAULT_RECENT_SYMBOLS = ["ñ", "@", "á", "é", "ó"];
const symbolsByValue = new Map(SYMBOLS.map((item) => [item.symbol, item]));

let visibleResults = [];
let statusTimeout;
let recentSymbols = [...DEFAULT_RECENT_SYMBOLS];

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreSymbol(item, query) {
  const compactQuery = query.replace(/\s/g, "");
  const terms = [item.symbol, item.name, ...item.keywords].map(normalizeText);
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

    if (result.length === 5) break;
  }

  return result;
}

function getAllSymbolsWithRecentFirst() {
  const results = recentSymbols.map((symbol) => symbolsByValue.get(symbol));
  const includedSymbols = new Set(recentSymbols);

  for (const item of SYMBOLS) {
    if (!includedSymbols.has(item.symbol)) {
      results.push(item);
      includedSymbols.add(item.symbol);
    }
  }

  return results;
}

function searchSymbols(rawQuery) {
  const query = normalizeText(rawQuery);

  if (!query) return getAllSymbolsWithRecentFirst();

  return SYMBOLS
    .map((item, index) => ({ item, index, score: scoreSymbol(item, query) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 8)
    .map((result) => result.item);
}

function createResultButton(item) {
  const button = document.createElement("button");
  const symbol = document.createElement("span");
  const name = document.createElement("span");
  const copyLabel = document.createElement("span");

  button.type = "button";
  button.className = "result";
  button.setAttribute("aria-label", `Copiar ${item.name}: ${item.symbol}`);

  symbol.className = "result__symbol";
  symbol.textContent = item.symbol;

  name.className = "result__name";
  name.textContent = item.name;

  copyLabel.className = "result__copy";
  copyLabel.textContent = "Copiar";

  button.append(symbol, name, copyLabel);
  button.addEventListener("click", () => copySymbol(item.symbol));

  return button;
}

function renderResults() {
  visibleResults = searchSymbols(searchInput.value);
  resultsElement.replaceChildren(...visibleResults.map(createResultButton));
  emptyState.hidden = visibleResults.length > 0;
}

function showStatus(message) {
  clearTimeout(statusTimeout);
  statusElement.textContent = message;
  statusElement.classList.add("status--visible");

  statusTimeout = setTimeout(() => {
    statusElement.classList.remove("status--visible");
  }, 1000);
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

    if (storedData[LEGACY_USAGE_STORAGE_KEY]) {
      await chrome.storage.local.remove(LEGACY_USAGE_STORAGE_KEY);
    }
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

async function copySymbol(symbol) {
  try {
    await navigator.clipboard.writeText(symbol);
  } catch (error) {
    console.error("No se pudo copiar el símbolo:", error);
    showStatus("No se pudo copiar");
    return;
  }

  try {
    await recordRecentSymbol(symbol);
  } catch (error) {
    console.error("No se pudo guardar el historial:", error);
  }

  searchInput.value = "";
  renderResults();
  showStatus(`Copied ${symbol}`);
}

searchInput.addEventListener("input", renderResults);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (visibleResults.length > 0) {
    copySymbol(visibleResults[0].symbol);
  }
});

async function initialize() {
  await loadRecentSymbols();
  renderResults();
  searchInput.focus();
}

initialize();
