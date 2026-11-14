// Compares the declarations of tokens.css and tailwind-theme.css with another
// revision: each declaration by the at-rules and selector it stands under, and
// for each custom property the order of the blocks that declare it. A change
// to the token source or to build-tokens.mjs that only rewrites the text
// reports nothing; one that changes what the browser reads lists it.
//
// Run: node scripts/compare-css.mjs [revision]   (default HEAD)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import postcss from "postcss";

const revision = process.argv[2] ?? "HEAD";
const squash = (s) => s.replace(/\s+/g, " ").trim();

function declarations(text) {
  const out = [];
  postcss.parse(text).walkDecls((d) => {
    const context = [];
    for (let p = d.parent; p && p.type !== "root"; p = p.parent) context.unshift(p.type === "rule" ? squash(p.selector) : squash(`@${p.name} ${p.params}`));
    out.push({ context: context.join(" > "), prop: d.prop, value: squash(d.value).replace(/\s*,\s*/g, ", ") + (d.important ? " !important" : "") });
  });
  return out;
}

const tally = (list) => list.reduce((m, d) => m.set(`${d.context} | ${d.prop}: ${d.value}`, (m.get(`${d.context} | ${d.prop}: ${d.value}`) ?? 0) + 1), new Map());
const blocks = (list) => list.filter((d) => d.prop.startsWith("--")).reduce((m, d) => m.set(d.prop, [...(m.get(d.prop) ?? []), d.context]), new Map());

let differs = 0;
for (const file of ["packages/core/tokens.css", "packages/core/tailwind-theme.css"]) {
  const before = declarations(execFileSync("git", ["show", `${revision}:${file}`]).toString());
  const after = declarations(readFileSync(file, "utf8"));
  const [was, is] = [tally(before), tally(after)];
  const lines = [
    ...[...was].filter(([k, n]) => (is.get(k) ?? 0) < n).map(([k]) => `- ${k}`),
    ...[...is].filter(([k, n]) => (was.get(k) ?? 0) < n).map(([k]) => `+ ${k}`),
  ];
  const [order, now] = [blocks(before), blocks(after)];
  for (const [prop, list] of order) if (JSON.stringify(list) !== JSON.stringify(now.get(prop))) lines.push(`order of ${prop}: ${list.join(", ")} became ${now.get(prop)?.join(", ")}`);
  console.log(`${file}: ${before.length} declarations against ${after.length}, ${lines.length} differences`);
  for (const line of lines) console.log(`  ${line}`);
  differs += lines.length;
}
process.exit(differs ? 1 : 0);
