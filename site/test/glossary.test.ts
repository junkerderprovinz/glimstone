import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GLOSSARY } from "../src/pages/glossary.data.ts";

const packages = join(import.meta.dirname, "..", "..", "packages");
const read = (...path: string[]) => readFileSync(join(packages, ...path), "utf8");

// A component is an exported name in PascalCase. A context is no component,
// and the glyph components stand together under the one glyph entry.
const isComponent = (name: string) => /^[A-Z]/.test(name) && !name.endsWith("Context");

function reactComponents() {
  const names = new Set<string>();
  const files = [...read("react", "src", "index.ts").matchAll(/export \* from "\.\/(\w+\.tsx?)"/g)]
    .map((m) => m[1]!)
    .filter((file) => file !== "glyphs.tsx");
  // Select, Combobox and Slider ship as entry points of their own.
  for (const file of [...files, "Select.tsx", "Combobox.tsx", "Slider.tsx"]) {
    for (const m of read("react", "src", file).matchAll(/^export (?:function|const|class) (\w+)/gm)) {
      if (isComponent(m[1]!)) names.add(m[1]!);
    }
  }
  return names;
}

function vueComponents() {
  const names = new Set<string>();
  for (const m of read("vue", "src", "index.ts").matchAll(/export \{ default as (\w+) \}/g)) names.add(m[1]!);
  for (const file of ["select", "combobox", "slider"]) {
    for (const m of read("vue", "src", "entries", `${file}.ts`).matchAll(/default as (\w+)/g)) names.add(m[1]!);
  }
  return names;
}

const entries = GLOSSARY.flatMap((s) => s.entries);
const named = new Set(entries.flatMap((e) => e.components));
const exported = new Set([...reactComponents(), ...vueComponents()]);

test("every exported component has a glossary entry", () => {
  assert.deepEqual([...exported].filter((name) => !named.has(name)).sort(), []);
});

test("every component a glossary entry names is exported", () => {
  assert.deepEqual([...named].filter((name) => !exported.has(name)).sort(), []);
});

test("every glossary entry has an id of its own", () => {
  const ids = entries.map((e) => e.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

test("a tile is one of four, each with a name of its own", () => {
  const tiles = entries.filter((e) => /kachel/i.test(e.de)).map((e) => e.de);
  assert.deepEqual(tiles.sort(), ["Glyphenkachel", "Infokachel", "Markenkachel", "Zeilenkacheln"]);
});
