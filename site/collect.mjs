// Turns Playwright's JSON reports into the per-row results the site shows, one
// result per framework. A row a framework skips, because it has no such
// component, has no entry for it. A framework runs in Chromium and Firefox, and
// its row passes only when it passes in both. CI runs each project in a job of
// its own and hands every report in; locally the one report of the last run is
// read.
//
// Run: node collect.mjs [report.json...]
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const files = process.argv.length > 2 ? process.argv.slice(2) : [new URL("./test-results/raw.json", import.meta.url)];
const reports = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
const frameworkOf = new Map(reports.flatMap((r) => r.config.projects.map((p) => [p.name, p.metadata?.fw])));
const browserOf = (project) => (project.endsWith("-firefox") ? "Firefox" : "Chromium");
const rows = {};
const walk = (suite) => {
  for (const spec of suite.specs ?? []) {
    const id = spec.title.match(/^\[([a-z0-9-]+)\]/)?.[1];
    if (!id) continue;
    for (const t of spec.tests) {
      const result = t.results.at(-1);
      if (!result || result.status === "skipped") continue;
      const error = result.error?.message?.replace(/\u001b\[[0-9;]*m/g, "").split("\n")[0];
      // A row marked as an expected failure keeps CI green but still reads as failing here.
      const ok = result.status === "passed";
      const row = (rows[id] ??= {});
      const fw = frameworkOf.get(t.projectName);
      if (row[fw] && !row[fw].ok) continue;
      row[fw] = { ok, ...(ok ? {} : { error: `${browserOf(t.projectName)}: ${error}` }) };
    }
  }
  for (const child of suite.suites ?? []) walk(child);
};
for (const r of reports) r.suites.forEach(walk);

// The Flutter rows come from `flutter test --machine`, one JSON event per line,
// written to flutter-results.jsonl beside this file.
const flutter = new URL("./flutter-results.jsonl", import.meta.url);
if (existsSync(flutter)) {
  const names = new Map();
  for (const line of readFileSync(flutter, "utf8").split("\n")) {
    if (!line.startsWith("{")) continue;
    const e = JSON.parse(line);
    if (e.type === "testStart") names.set(e.test.id, e.test.name);
    if (e.type !== "testDone" || e.hidden || e.skipped) continue;
    const id = names.get(e.testID)?.match(/^\[([a-z0-9-]+)\]/)?.[1];
    if (id) (rows[id] ??= {}).flutter = { ok: e.result === "success", ...(e.result === "success" ? {} : { error: e.result }) };
  }
}
writeFileSync(new URL("./src/gen/test-results.json", import.meta.url), JSON.stringify({ ranAt: new Date().toISOString(), rows }, null, 1));
const failed = Object.entries(rows).flatMap(([id, r]) => Object.entries(r).filter(([, x]) => !x.ok).map(([fw]) => `${id} (${fw})`));
console.log(`${Object.keys(rows).length} rows, ${failed.length} failing: ${failed.join(", ")}`);
