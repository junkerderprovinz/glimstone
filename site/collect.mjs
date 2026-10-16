// Turns Playwright's JSON report into the per-row results the site shows.
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(new URL("./test-results/raw.json", import.meta.url), "utf8"));
const rows = {};
const walk = (suite) => {
  for (const spec of suite.specs ?? []) {
    const id = spec.title.match(/^\[([a-z0-9-]+)\]/)?.[1];
    if (!id) continue;
    const result = spec.tests[0]?.results.at(-1);
    const error = result?.error?.message?.replace(/\u001b\[[0-9;]*m/g, "").split("\n")[0];
    // A row marked as an expected failure keeps CI green but still reads as failing here.
    const ok = result?.status === "passed";
    rows[id] = { ok, ...(ok ? {} : { error }) };
  }
  for (const child of suite.suites ?? []) walk(child);
};
raw.suites.forEach(walk);
writeFileSync(new URL("./src/gen/test-results.json", import.meta.url), JSON.stringify({ ranAt: new Date().toISOString(), rows }, null, 1));
const failed = Object.entries(rows).filter(([, r]) => !r.ok);
console.log(`${Object.keys(rows).length} rows, ${failed.length} failing: ${failed.map(([id]) => id).join(", ")}`);
