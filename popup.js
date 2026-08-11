const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const resultsElement = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const statusElement = document.querySelector("#status");
const USAGE_STORAGE_KEY = "symbolUsageStats";
const DEFAULT_SUGGESTION_SYMBOLS = ["ñ", "@", "á", "ó", "é", "©"];
const symbolsByValue = new Map(SYMBOLS.map((item) => [item.symbol, item]));

let visibleResults = [];
let statusTimeout;
let usageStats = {};

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

function getPersonalizedSuggestions() {
  const rankedSymbols = Object.entries(usageStats)
    .filter(([symbol, stats]) => {
      return symbolsByValue.has(symbol) && stats.count > 0;
    })
    .sort(([, statsA], [, statsB]) => {
      return statsB.count - statsA.count || statsB.lastUsed - statsA.lastUsed;
    })
    .map(([symbol]) => symbol);

  const suggestionSymbols = [];

  for (const symbol of [...rankedSymbols, ...DEFAULT_SUGGESTION_SYMBOLS]) {
    if (!suggestionSymbols.includes(symbol) && symbolsByValue.has(symbol)) {
      suggestionSymbols.push(symbol);
    }

    if (suggestionSymbols.length === 6) break;
  }

  return suggestionSymbols.map((symbol) => symbolsByValue.get(symbol));
}

function searchSymbols(rawQuery) {
  const query = normalizeText(rawQuery);

  if (!query) return getPersonalizedSuggestions();

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

async function loadUsageStats() {
  try {
    const storedData = await chrome.storage.local.get(USAGE_STORAGE_KEY);
    usageStats = storedData[USAGE_STORAGE_KEY] ?? {};
  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
    usageStats = {};
  }
}

async function recordSymbolUsage(symbol) {
  const previousStats = usageStats[symbol] ?? { count: 0, lastUsed: 0 };

  usageStats = {
    ...usageStats,
    [symbol]: {
      count: previousStats.count + 1,
      lastUsed: Date.now()
    }
  };

  await chrome.storage.local.set({ [USAGE_STORAGE_KEY]: usageStats });

  if (!normalizeText(searchInput.value)) {
    renderResults();
  }
}

async function copySymbol(symbol) {
  try {
    await navigator.clipboard.writeText(symbol);
    showStatus(`Copied ${symbol}`);
  } catch (error) {
    console.error("No se pudo copiar el símbolo:", error);
    showStatus("No se pudo copiar");
    return;
  }

  try {
    await recordSymbolUsage(symbol);
  } catch (error) {
    console.error("No se pudo guardar el historial:", error);
  }
}

searchInput.addEventListener("input", renderResults);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (visibleResults.length > 0) {
    copySymbol(visibleResults[0].symbol);
  }
});

async function initialize() {
  await loadUsageStats();
  renderResults();
  searchInput.focus();
}

initialize();
