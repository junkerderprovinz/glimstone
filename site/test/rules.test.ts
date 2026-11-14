import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { citedRules, citedTopics, readRules } from "../../scripts/rules.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const rules = readRules();

// The changelog and the release notes keep the numbers a rule had when they
// were written, so they are left out.
const SOURCES = ["README.md", "docs", "site/src", "packages", "reference"];
const SKIP = new Set(["node_modules", "dist", "gen", "build", ".dart_tool"]);
const TEXT = /\.(md|tsx?|vue|css|mjs|js|dart)$/;

function* files(path: string): Generator<string> {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) if (!SKIP.has(name)) yield* files(join(path, name));
  } else if (TEXT.test(path) && !/CHANGELOG/.test(path)) yield path;
}

test("the rules are numbered from 1 without a gap", () => {
  assert.deepEqual(
    rules.map((r) => r.number),
    rules.map((_, i) => i + 1),
  );
});

test("every rule has a bold lead that names it", () => {
  assert.deepEqual(rules.filter((r) => r.title.length < 8).map((r) => r.number), []);
});

test("every rule cited anywhere exists", () => {
  const known = new Set(rules.map((r) => r.number));
  const missing = SOURCES.flatMap((s) => [...files(join(root, s))]).flatMap((path) =>
    citedRules(readFileSync(path, "utf8"))
      .filter((c) => !known.has(c.number))
      .map((c) => `${relative(root, path)}:${c.line}: rule ${c.number}`),
  );
  assert.deepEqual(missing, []);
});

// A topic several rules mention, and the one rule that owns it.
const OWNERS: Record<string, number> = { notch: 11, density: 51 };

test("a rule cited for a topic is the rule about that topic", () => {
  const text = new Map(rules.map((r) => [r.number, [r.title, ...r.blocks].join(" ").toLowerCase()]));
  const stray = SOURCES.flatMap((s) => [...files(join(root, s))]).flatMap((path) =>
    citedTopics(readFileSync(path, "utf8"))
      .filter((c) => text.has(c.number))
      .filter((c) => !c.words.some((w) => text.get(c.number)!.includes(w.slice(0, 5))) || c.words.some((w) => w in OWNERS && OWNERS[w] !== c.number))
      .map((c) => `${relative(root, path)}:${c.line}: ${c.cited}`),
  );
  assert.deepEqual(stray, []);
});

test("citations name every number they span", () => {
  assert.deepEqual(
    citedRules("see rules 38 and 40, Rules 43 to 45 and rule 6").map((c) => c.number),
    [38, 40, 43, 44, 45, 6],
  );
});
