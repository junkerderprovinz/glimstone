// Reads the numbered rules out of docs/design-language.md, the one place they
// are written. The site's rules page is built from it, and a test holds every
// "rule N" written anywhere else to a rule that exists.
import { readFileSync } from "node:fs";

export const DOC = new URL("../docs/design-language.md", import.meta.url);
const HEADING = "## The rules that keep it calm";

/**
 * The rules in the order they stand: the number, the bold lead that names the
 * rule, and the rest as blocks, one per paragraph or list item.
 */
export function readRules(markdown = readFileSync(DOC, "utf8")) {
  const start = markdown.indexOf(`\n${HEADING}\n`);
  if (start < 0) throw new Error(`design-language.md has no "${HEADING}" section`);
  const end = markdown.indexOf("\n## ", start + 1);
  const rules = [];
  for (const line of markdown.slice(start + HEADING.length + 2, end).split("\n")) {
    const lead = /^(\d+)\. \*\*(.+?)\*\*\s*(.*)$/.exec(line);
    if (lead) rules.push({ number: Number(lead[1]), title: lead[2], blocks: lead[3] ? [lead[3]] : [] });
    else if (line.trim()) rules.at(-1)?.blocks.push(line.trim());
  }
  return rules;
}

/** Every rule number a text cites, as in "rule 14", "rules 38 and 40" or "Rules 43 to 45". */
export function citedRules(text) {
  const cited = [];
  for (const m of text.matchAll(/\brules? (\d+(?:(?:, | and | or | to )\d+)*)/gi)) {
    const numbers = m[1].split(/, | and | or /).flatMap((part) => {
      const [from, to] = part.split(" to ").map(Number);
      return to ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : [from];
    });
    const line = text.slice(0, m.index).split("\n").length;
    for (const number of numbers) cited.push({ number, line });
  }
  return cited;
}

// Words after "rule N's" that say how the rule is cited rather than what it is about.
const FILLER = new Set(["own", "territory", "applied", "addendum", "bullet", "sits", "places", "half-overlap", "failure", "mode"]);

/**
 * Every "rule N's topic" a text names, with the words of the topic, so a test
 * can check that the rule is about it: "rule 11's notch", "Rule 14's mouse-wheel addendum".
 */
export function citedTopics(text) {
  const out = [];
  for (const m of text.matchAll(/\brule (\d+)'s ((?:"|&quot;)?[^\s,.;:)"]+(?: [^\s,.;:)"]+)?)/gi)) {
    const words = m[2]
      .replace(/&quot;|"/g, "")
      .split(/[\s/-]+/)
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 3 && !FILLER.has(w));
    if (words.length) out.push({ number: Number(m[1]), words, line: text.slice(0, m.index).split("\n").length, cited: m[0] });
  }
  return out;
}
