import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { reactComponents, vueComponents } from "./exports.ts";
import { solidComponents, svelteComponents } from "./frameworks.ts";

const unnamed = (components: Map<string, string>) =>
  [...components].filter(([name, file]) => !readFileSync(file, "utf8").includes(`data-glim="${name}"`)).map(([name]) => name).sort();

test("every React component names itself in data-glim", () => {
  assert.deepEqual(unnamed(reactComponents()), []);
});

test("every Vue component names itself in data-glim", () => {
  assert.deepEqual(unnamed(vueComponents()), []);
});

test("every Solid component names itself in data-glim", () => {
  assert.deepEqual(unnamed(solidComponents()), []);
});

test("every Svelte component names itself in data-glim", () => {
  assert.deepEqual(unnamed(svelteComponents()), []);
});
