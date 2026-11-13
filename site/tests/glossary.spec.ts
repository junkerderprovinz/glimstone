import { expect, test, type Page } from "@playwright/test";

// The glossary is React's own page, so only one project runs it.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "React only"));

async function open(page: Page, lang?: "en" | "de") {
  if (lang) await page.addInitScript((l) => localStorage.setItem("gs-docs-glossary-lang", l), lang);
  await page.goto("/#/guide/glossary");
  await page.locator(".gl-entry").first().waitFor();
}

test("every entry stands beside a live element or says it is listed only", async ({ page }) => {
  await open(page);
  const empty = await page.locator(".gl-stage").evaluateAll((stages) =>
    stages
      .filter((s) => ![...s.querySelectorAll("*")].some((el) => el.getBoundingClientRect().width > 0))
      .map((s) => (s as HTMLElement).dataset.entry),
  );
  expect(empty).toEqual([]);
});

test("the names change places with the language", async ({ page }) => {
  await open(page, "en");
  const name = page.locator("#gl-well-name");
  await expect(name).toHaveText("Well");
  await page.getByRole("radio", { name: "Deutsch" }).click();
  await expect(name).toHaveText("Mulde");
  await expect(page.locator("#gl-well dd").first()).toHaveText("Well");
});

test("a number in the legend lights its part in the picture", async ({ page }) => {
  await open(page);
  await page.locator(".gl-legend-item").nth(5).hover();
  await expect(page.locator(".gl-figure-stage")).toHaveAttribute("data-hot", "6");
});

test("the index links every name to its entry", async ({ page }) => {
  await open(page);
  const targets = await page.locator(".gl-index-name a").evaluateAll((links) => links.map((a) => a.getAttribute("href")!.split("s=")[1]!));
  expect(targets.length).toBeGreaterThan(60);
  const missing = await page.evaluate((ids) => ids.filter((id) => !document.getElementById(id)), targets);
  expect(missing).toEqual([]);
});

test("the page fits a phone without a sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 860 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
