import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, path: string) {
  await page.goto(`/#${path}?fw=${test.info().project.metadata.fw}`);
  await page.locator("main h1").first().waitFor();
}

test("a sub-card, its card and its toggle each carry their name and title", async ({ page }) => {
  await open(page, "/components/sub-card");
  const demo = page.locator('[data-demo="SubCardBasic"]');
  await expect(demo.locator('[data-glim="SubCard"][data-glim-title="Retention"]')).toHaveCount(1);
  await expect(demo.locator('[data-glim="Card"][data-glim-title="Snapshots"]')).toHaveCount(1);
  await expect(demo.locator('[data-glim="Toggle"]')).toHaveCount(1);
});

test("an icon button is named as such, not as the button it is built from", async ({ page }) => {
  await open(page, "/components/icon-button");
  await expect(page.locator('[data-glim="IconButton"]').first()).toBeVisible();
  await expect(page.locator('[data-demo="IconButtonBasic"] [data-glim="IconTipButton"]')).toHaveCount(0);
});
