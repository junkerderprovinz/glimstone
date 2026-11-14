import { expect, test } from "@playwright/test";

// The chart colours are tokens; this checks the page shows them and that each
// theme paints its own half.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

test("the charts page paints eight different series in each theme", async ({ page }) => {
  await page.goto("/#/guide/charts");
  await page.locator("main h1").waitFor();
  const looks = await page.locator(".glim-card").evaluateAll((cards) =>
    cards.slice(0, 3).map((card) => [...card.querySelectorAll<HTMLElement>("[title^='--chart-']")].map((s) => getComputedStyle(s).backgroundColor)),
  );
  expect(looks).toHaveLength(3);
  for (const series of looks) expect(new Set(series).size).toBe(8);
  // Dark and light paint the same series differently.
  expect(looks[0]).not.toEqual(looks[2]);
});
