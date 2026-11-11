import { test } from "node:test";
import assert from "node:assert/strict";
import { GLOSSARY } from "../src/pages/glossary.data.ts";
import { reactComponents, vueComponents } from "./exports.ts";

const entries = GLOSSARY.flatMap((s) => s.entries);
const named = new Set(entries.flatMap((e) => e.components));
const exported = new Set([...reactComponents().keys(), ...vueComponents().keys()]);

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
