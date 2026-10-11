// Confere a integridade do conteúdo e do leitor de preços. Rode com: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const SECTIONS = new Function(read("js/data.js") + "; return SECTIONS;")();
const items = SECTIONS.flatMap((section) => section.groups.flatMap((group) => (group.items || []).filter((item) => item && item.k)));

test("toda frase tem japonês e rōmaji", () => {
  assert.ok(items.length > 400);
  for (const item of items) {
    assert.ok(item.jp && item.ro, `incompleta: ${JSON.stringify(item)}`);
    if (item.reply) assert.equal(item.reply.length, 3, `resposta incompleta em ${item.jp}`);
  }
});

test("ids de situação são únicos", () => {
  const ids = SECTIONS.map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("não há radicais Kangxi copiados do PDF", () => {
  const bad = [...read("js/data.js")].filter((char) => {
    const code = char.codePointAt(0);
    return code >= 0x2e80 && code <= 0x2fdf;
  });
  assert.deepEqual(bad, []);
});

test("tabelas de kana têm 46 letras cada", () => {
  const kana = SECTIONS.find((section) => section.id === "kana");
  for (const title of ["Hiragana", "Katakana"]) {
    const group = kana.groups.find((g) => g.title === title);
    assert.equal(group.items.filter(Boolean).length, 46);
    assert.equal(group.items.length % 5, 1);
  }
});

test("leitor de preços bate com os exemplos do guia", () => {
  const source = read("js/app.js").match(/const D = [\s\S]*?window\.readNumber = readNumber;/)[0];
  const scope = {};
  new Function("window", source)(scope);
  const cases = {
    0: "zero", 10: "jū", 150: "hyaku go-jū", 320: "sanbyaku ni-jū", 480: "yon-hyaku hachi-jū", 680: "roppyaku hachi-jū",
    1200: "sen ni-hyaku", 1280: "sen ni-hyaku hachi-jū", 2300: "ni-sen sanbyaku", 3980: "sanzen kyū-hyaku hachi-jū",
    8800: "hassen happyaku", 12500: "ichi-man ni-sen go-hyaku", 100000: "jū-man",
  };
  for (const [number, reading] of Object.entries(cases)) assert.equal(scope.readNumber(Number(number)), reading);
});

test("o service worker pré-carrega arquivos que existem", () => {
  const assets = JSON.parse(read("sw.js").match(/const ASSETS = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/, "]"));
  for (const asset of assets) assert.ok(fs.existsSync(path.join(__dirname, "..", asset === "./" ? "index.html" : asset)), `faltando: ${asset}`);
  const scripts = [...read("index.html").matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
  for (const script of scripts) assert.ok(assets.includes(script), `fora do cache offline: ${script}`);
});
