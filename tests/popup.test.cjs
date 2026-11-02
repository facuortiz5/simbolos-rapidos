// Run with: node tests/popup.test.cjs. No dependencies or network requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

class Element {
  constructor() {
    this.value = "";
    this.hidden = false;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.classList = { add() {}, remove() {} };
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  focus() {}
  blur() {}
}

async function popup(saved = {}, language = "en", storageUnavailable = false) {
  const elements = new Map();
  const document = {
    documentElement: new Element(),
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    querySelectorAll: () => [],
    createElement: () => new Element(),
    createElementNS: () => new Element(),
    addEventListener() {}
  };
  const storage = { ...saved };
  const clipboard = [];
  const context = vm.createContext({
    document, Element, queueMicrotask,
    console: { error() {} },
    setTimeout: () => 1, clearTimeout() {},
    navigator: { clipboard: { async writeText(value) { clipboard.push(value); } } },
    chrome: {
      runtime: { getURL: value => value },
      i18n: { getUILanguage: () => language },
      storage: { local: {
        async get(keys) {
          if (storageUnavailable) throw new Error("Unavailable");
          return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map(key => [key, storage[key]]));
        },
        async set(values) {
          if (storageUnavailable) throw new Error("Unavailable");
          Object.assign(storage, values);
        }
      } }
    },
    async fetch(url) {
      assert.match(url, /^_locales\//, "Tests must not send suggestions");
      return { ok: true, json: async () => JSON.parse(read(url)) };
    }
  });
  for (const file of ["symbols.js", "categories.js", "popup.js"]) {
    vm.runInContext(read(file).replace(/\ninitialize\(\);\s*$/, "\n"), context);
  }
  await vm.runInContext("initialize()", context);
  return { elements, storage, clipboard, context, document, run: source => vm.runInContext(source, context) };
}

async function main() {
  const app = await popup();
  const symbols = app.run("SYMBOLS");
  assert.equal(symbols.length, 211);
  assert(!symbols.some(item => item.symbol === "⁻" || item.symbol === "₋"));
  assert.equal(new Set(symbols.map(item => item.symbol)).size, symbols.length);
  for (const { symbol } of symbols) {
    assert.equal(app.run(`searchSymbols(${JSON.stringify(symbol)})[0].symbol`), symbol, `Exact match: ${symbol}`);
    assert.equal(app.run(`searchSymbols(${JSON.stringify(symbol.normalize("NFD"))})[0].symbol`), symbol, `Decomposed match: ${symbol}`);
  }
  const queries = {
    "superscript minus one": "⁻¹", "superscript minus nine": "⁻⁹", "negative exponent 1": "⁻¹",
    "subscript minus one": "₋₁", "subscript minus nine": "₋₉", "subíndice menos nueve": "₋₉",
    "superíndice negativo": "⁻¹", "superíndice menos nueve": "⁻⁹", "subindice negativo 2": "₋₂",
    "euro": "€", "copyright": "©", "infinity": "∞", "enie": "ñ", "EÑE": "ñ",
    "superscript 2": "²", "superindice 3": "³", " Ω ": "Ω"
  };
  for (const [query, expected] of Object.entries(queries)) {
    assert.equal(app.run(`searchSymbols(${JSON.stringify(query)})[0].symbol`), expected, query);
  }
  assert.equal(app.run("searchSymbols('   ').length"), 0);
  assert.equal(app.run("searchSymbols('a symbol that does not exist xyz').length"), 0);
  assert.equal(app.run("searchSymbols('greek').length"), app.run("searchSymbols('alfabeto griego').length"));
  assert(app.run("SYMBOLS.every(item => SYMBOL_CATEGORIES.some(category => category.symbols.includes(item.symbol)))"));
  assert(app.run("getCategorySymbols(SYMBOL_CATEGORIES.find(category => category.id === 'math')).some(item => item.symbol === '⁻¹')"));

  assert.equal(app.document.documentElement.dataset.theme, "day");
  const toggle = app.elements.get("#theme-toggle");
  assert.equal(toggle.attributes["aria-label"], "Switch to night mode");
  toggle.listeners.click({ detail: 0 });
  await app.run("themeSaveQueue");
  assert.equal(app.document.documentElement.dataset.theme, "night");
  assert.equal(app.storage.uiTheme, "night");
  assert.equal(toggle.attributes["aria-label"], "Switch to day mode");
  await app.run("setUiLanguage('es', { persist: true })");
  assert.equal(toggle.attributes["aria-label"], "Cambiar a modo claro");
  assert.equal(app.document.documentElement.dataset.theme, "night");
  assert.equal(app.run("t('suggestionTitle')"), "¿No encontrás el símbolo?");
  await app.run("setUiLanguage('en', { persist: true })");
  assert.equal(app.run("t('suggestionTitle')"), "Can’t find the symbol?");
  for (let index = 0; index < 3; index++) toggle.listeners.click({ detail: 0 });
  await app.run("themeSaveQueue");
  assert.equal(app.storage.uiTheme, "day", "Rapid clicks preserve final theme");
  const restored = await popup({ uiTheme: "night", uiLanguage: "es", favoriteSymbols: ["⁻¹"], recentSymbols: ["Ω"] });
  assert.equal(restored.document.documentElement.dataset.theme, "night");
  assert.equal(restored.elements.get("#theme-toggle").attributes["aria-label"], "Cambiar a modo claro");
  assert.equal(restored.run("favoriteSymbols[0]"), "⁻¹");
  assert.equal(restored.run("recentSymbols[0]"), "Ω");
  const unavailable = await popup({}, "en", true);
  assert.equal(unavailable.document.documentElement.dataset.theme, "day");
  unavailable.elements.get("#theme-toggle").listeners.click({ detail: 0 });
  await unavailable.run("themeSaveQueue");
  assert.equal(unavailable.document.documentElement.dataset.theme, "night");

  app.elements.get("#search-input").value = "Ω";
  app.run("renderResults()");
  app.elements.get("#search-form").listeners.submit({ preventDefault() {} });
  // The submit handler starts an async copy; wait for its microtasks to finish.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.clipboard.at(-1), "Ω");
  assert.equal(app.elements.get("#search-input").value, "");
  assert.equal(app.run("activeView"), "home");
  assert.equal(app.run("recentSymbols[0]"), "Ω");
  await app.run("copySymbol('⁻¹')");
  assert.equal(app.clipboard.at(-1), "⁻¹");
  assert.equal(app.run("recentSymbols[0]"), "⁻¹");
  app.run("toggleFavorite(symbolsByValue.get('⁻¹'), document.createElement('button'))");
  await app.run("favoriteSaveQueue");
  assert(app.storage.favoriteSymbols.includes("⁻¹"));

  const en = JSON.parse(read("_locales/en/messages.json"));
  const es = JSON.parse(read("_locales/es_419/messages.json"));
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
  console.log(`PASS: ${symbols.length} literal/NFD matches, bilingual search, superscript minus, Enter/copy/home, favorites, theme persistence/races/fallback, localized labels.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
