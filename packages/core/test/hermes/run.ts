// Bundled into one script and run by the Hermes CLI (scripts/check-hermes.sh).
// That Hermes has no Intl at all, so the core has to load and fill its words
// without any of it.
import * as core from "../../src/index.ts";

declare const print: (...parts: unknown[]) => void;

function expect(what: string, got: unknown, want: unknown) {
  if (got !== want) throw new Error(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}

expect("initials", core.initials("Ada Lovelace"), "AL");
expect(
  "sorted rows",
  core
    .sortRows([{ name: "item 10" }, { name: "item 2" }, { name: "Item 1" }], { key: "name", dir: "asc" })
    .map((row) => row.name)
    .join(", "),
  "Item 1, item 2, item 10",
);
expect("list", core.listOf("en", ["a", "b", "c"]), "a, b, c");
expect("spoken time", core.TIMER_TEXT.spoken(1, 4, 30), "1 hour, 4 minutes, 30 seconds");
for (const lang of core.COMPONENT_LANGUAGES) {
  const words = core.componentText(lang);
  words.pagination.page(3, 20);
  words.rating.star(3, 5);
  words.versionCard.checked(new Date(Date.now() - 60_000));
  words.versionCard.downloading(40);
}
print("The core runs under Hermes in", core.COMPONENT_LANGUAGES.length, "languages.");
