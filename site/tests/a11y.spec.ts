import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Every page the site routes to, read from App.tsx so a new page is checked
// without being listed here too.
const paths = [...readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8").matchAll(/\{ path: "([^"]+)"/g)].map((m) => m[1]);

for (const theme of ["dark", "light"]) {
  for (const path of paths) {
    test(`${path} in the ${theme} theme has no axe violation`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("gs-docs-look", JSON.stringify({ theme: t })), theme);
      await page.goto(`/#${path}?fw=react`);
      await page.locator("main h1").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      // The calibration page's left side is an app prototype's own markup, kept
      // to compare against, not GlimStone's.
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude('.cal-stage[data-side="prototype"]')
        .analyze();
      const found = violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
      expect(found).toEqual([]);
    });
  }
}
