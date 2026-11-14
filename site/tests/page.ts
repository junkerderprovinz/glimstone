import { expect, test, type Page } from "@playwright/test";

// Opening a page and finding a demo, for the spec files beside contracts.spec.ts.

export async function open(page: Page, path: string, look?: Record<string, unknown>) {
  if (look) await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto(`/#${path}?fw=${test.info().project.metadata.fw}`);
  await page.locator("main h1").first().waitFor();
  if (look?.motion) expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe(look.motion);
  await page.evaluate(() => document.fonts.ready);
}

export const stage = (page: Page, demo: string) => page.locator(`[data-demo="${demo}"]`);

// A second look within one test: an init script from open() would put the first
// one back on the reload, so a test that changes the look opens without one. A
// page the test opens itself takes its look here too, since Firefox can skip an
// init script on such a page's first load.
export async function relook(page: Page, look: Record<string, unknown>) {
  await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.reload();
  await page.locator("main h1").first().waitFor();
  if (look.motion) expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe(look.motion);
  await page.evaluate(() => document.fonts.ready);
}
