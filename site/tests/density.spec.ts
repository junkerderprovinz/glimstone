import { expect, test, type Page } from "@playwright/test";

async function rowHeight(page: Page, density?: string) {
  await page.addInitScript((d) => localStorage.setItem("gs-docs-look", JSON.stringify(d ? { density: d } : {})), density);
  await page.goto(`/#/engines/density?fw=${test.info().project.metadata.fw}`);
  await page.locator("main h1").waitFor();
  return page.locator("[data-demo] .glim-list-row").first().evaluate((r) => Math.round(r.getBoundingClientRect().height));
}

test("a row is 42px without a setting and at normal", async ({ page }) => {
  expect(await rowHeight(page)).toBe(42);
});

test("compact rows are 32px", async ({ page }) => {
  expect(await rowHeight(page, "compact")).toBe(32);
});

test("airy rows are 52px", async ({ page }) => {
  expect(await rowHeight(page, "airy")).toBe(52);
});

test("the demo's selector moves every row at once", async ({ page }) => {
  await rowHeight(page);
  await page.locator("[data-demo]").getByRole("tab", { name: "Compact" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  const heights = await page.locator("[data-demo] .glim-list-row").evaluateAll((rows) => rows.map((r) => Math.round(r.getBoundingClientRect().height)));
  expect(new Set(heights)).toEqual(new Set([32]));
});
