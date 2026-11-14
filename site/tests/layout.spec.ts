import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of Splitter, ScrollArea and FloatingPanel, each named after its contract row.

test.beforeEach(({}, info) => test.skip(!["react", "vue"].includes(info.project.name), "React and Vue only so far"));

test.describe("Splitter", () => {
  const handle = (page: Page) => stage(page, "SplitterFolders").getByRole("separator", { name: "Resize" });
  const now = async (page: Page) => Number(await handle(page).getAttribute("aria-valuenow"));
  const caption = (page: Page) => stage(page, "SplitterFolders").locator("span.glim-num");

  test("[splitter-role] the handle is a separator named Resize, with its value", async ({ page }) => {
    await open(page, "/components/splitter");
    await expect(handle(page)).toHaveAttribute("aria-orientation", "vertical");
    await expect(handle(page)).toHaveAttribute("aria-valuenow", "35");
    await expect(handle(page)).toHaveAttribute("aria-valuemin", "20");
  });

  test("[splitter-arrows] the arrows move the seam, Shift by ten", async ({ page }) => {
    await open(page, "/components/splitter");
    await handle(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(handle(page)).toHaveAttribute("aria-valuenow", "36");
    await page.keyboard.press("Shift+ArrowLeft");
    await expect(handle(page)).toHaveAttribute("aria-valuenow", "26");
    await expect(caption(page)).toHaveText("Folders 26 %, files 74 %");
  });

  test("[splitter-ends] Home and End take the seam to the panels' limits", async ({ page }) => {
    await open(page, "/components/splitter");
    await handle(page).focus();
    await page.keyboard.press("Home");
    await expect(handle(page)).toHaveAttribute("aria-valuenow", "20");
    await page.keyboard.press("End");
    await expect(handle(page)).toHaveAttribute("aria-valuenow", "70");
  });

  test("[splitter-drag] dragging the handle moves the seam", async ({ page }) => {
    await open(page, "/components/splitter");
    const box = (await handle(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect.poll(() => now(page)).toBeGreaterThan(40);
  });

  test("[splitter-accent] the grip takes the accent once the handle has focus", async ({ page }) => {
    await open(page, "/components/splitter");
    const grip = handle(page).locator(".glim-splitter-grip");
    const rest = await grip.evaluate((el) => getComputedStyle(el).backgroundColor);
    await handle(page).focus();
    await page.keyboard.press("ArrowRight");
    const reached = await grip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(reached).not.toBe(rest);
  });
});
