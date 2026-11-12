import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

const say = (page: Page, name: string) => stage(page, "AnnounceDemo").getByRole("button", { name }).click();
const region = (page: Page, politeness: string) => page.locator(`[data-glim-announce="${politeness}"]`);

test.describe("announce", () => {
  test("[announce-polite] the words go into the polite status region", async ({ page }) => {
    await open(page, "/components/toast");
    await expect(region(page, "polite")).toHaveCount(1);
    await say(page, "Say it");
    await expect(region(page, "polite")).toHaveText("3 rows selected");
    await expect(region(page, "polite")).toHaveAttribute("role", "status");
  });

  test("[announce-assertive] a failure goes into the alert region", async ({ page }) => {
    await open(page, "/components/toast");
    await say(page, "Say a failure");
    await expect(region(page, "assertive")).toHaveText("The copy failed");
    await expect(region(page, "assertive")).toHaveAttribute("role", "alert");
    await expect(region(page, "polite")).toHaveText("");
  });

  test("[announce-repeat] the same words twice are read twice", async ({ page }) => {
    await open(page, "/components/toast");
    await region(page, "polite").evaluate((r) => {
      const seen: string[] = [];
      new MutationObserver(() => seen.push(r.textContent ?? "")).observe(r, { childList: true, characterData: true, subtree: true });
      (window as unknown as { seen: string[] }).seen = seen;
    });
    await say(page, "Say it");
    await expect(region(page, "polite")).toHaveText("3 rows selected");
    await say(page, "Say it");
    await expect.poll(() => page.evaluate(() => (window as unknown as { seen: string[] }).seen.filter((t) => t === "3 rows selected").length)).toBe(2);
  });

  test("[announce-own] without a viewport the region is added to the page", async ({ page }) => {
    await open(page, "/components/toast");
    await page.evaluate(() => document.querySelectorAll("[data-glim-announce]").forEach((r) => r.remove()));
    await say(page, "Say it");
    const own = page.locator("body > [data-glim-announce=polite]");
    await expect(own).toHaveText("3 rows selected");
    await expect(own).toHaveAttribute("aria-live", "polite");
  });
});
