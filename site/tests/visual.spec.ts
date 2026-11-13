import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// The first demo of every component page, pictured in each theme, in the two
// other shapes and right to left, and compared against the committed baseline.
// A baseline is a Linux rendering, so elsewhere the run is skipped: regenerate
// them in the Playwright image (site/tests/README.md).

const pages = [...readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8").matchAll(/\{ path: "\/components\/([^"]+)"/g)].map((m) => m[1]);

const looks: Record<string, { look: Record<string, unknown>; dir?: "rtl" }> = {
  dark: { look: { theme: "dark" } },
  light: { look: { theme: "light" } },
  oled: { look: { theme: "dark", oled: true } },
  soft: { look: { theme: "dark", shape: "soft" } },
  square: { look: { theme: "dark", shape: "square" } },
  rtl: { look: { theme: "dark" }, dir: "rtl" },
};

test.beforeEach(() => test.skip(process.platform !== "linux", "the baselines are Linux renderings"));

for (const name of pages) {
  test.describe(name, () => {
    for (const [variant, { look, dir }] of Object.entries(looks)) {
      test(`${name} ${variant}`, async ({ page }) => {
        await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify({ motion: "off", ...l })), look);
        await page.goto(`/#/components/${name}?fw=react`);
        await page.locator("main h1").first().waitFor();
        if (dir) await page.evaluate((d) => (document.documentElement.dir = d), dir);
        await page.evaluate(() => document.fonts.ready);
        const stage = page.locator("[data-demo]").first();
        await stage.scrollIntoViewIfNeeded();
        await expect(stage).toHaveScreenshot(`${name}-${variant}.png`);
      });
    }
  });
}
