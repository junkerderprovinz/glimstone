import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of Splitter, ScrollArea and FloatingPanel, each named after its contract row.

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

test.describe("ScrollArea", () => {
  const box = (page: Page) => stage(page, "ScrollAreaLog").getByRole("region", { name: "Backup log" });
  const top = (page: Page) => box(page).evaluate((el) => el.scrollTop);

  test("[scroll-region] a region named by its label, reached with Tab", async ({ page }) => {
    await open(page, "/components/scroll-area");
    await expect(box(page)).toHaveAttribute("tabindex", "0");
    await box(page).focus();
    await expect(box(page)).toBeFocused();
  });

  test("[scroll-keys] the arrow keys and End scroll it", async ({ page }) => {
    await open(page, "/components/scroll-area");
    await box(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => top(page)).toBeGreaterThan(0);
    await page.keyboard.press("End");
    await expect.poll(() => box(page).evaluate((el) => Math.round(el.scrollTop + el.clientHeight) >= el.scrollHeight - 1)).toBe(true);
  });

  test("[scroll-wheel] the wheel scrolls it", async ({ page }) => {
    await open(page, "/components/scroll-area");
    await box(page).hover();
    await page.mouse.wheel(0, 200);
    await expect.poll(() => top(page)).toBeGreaterThan(0);
  });

  test("[scroll-own-bar] the platform's bar is hidden and the house's thumb shows, for the direction that overflows", async ({ page }) => {
    await open(page, "/components/scroll-area");
    expect(await box(page).evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe("none");
    const bars = stage(page, "ScrollAreaLog").locator(".glim-scroll-bar");
    await expect(bars.and(page.locator('[data-orientation="vertical"]'))).toBeVisible();
    await expect(bars.and(page.locator('[data-orientation="horizontal"]'))).toBeHidden();
  });
});

test.describe("FloatingPanel", () => {
  const opener = (page: Page) => stage(page, "FloatingPanelLog").getByRole("button", { name: "Show the transfer log" });
  const panel = (page: Page) => page.getByRole("dialog", { name: "Transfer log" });
  const place = (page: Page) => panel(page).evaluate((el) => el.getBoundingClientRect().left);

  async function show(page: Page) {
    await open(page, "/components/floating-panel");
    await opener(page).click();
    await expect(panel(page)).toBeVisible();
  }

  test("[fpanel-dialog] a dialog named by its title, with its way out in the foot", async ({ page }) => {
    await show(page);
    await expect(panel(page).locator(".glim-fpanel-foot").getByRole("button", { name: "Close" })).toBeVisible();
    await panel(page).getByRole("button", { name: "Close" }).click();
    await expect(panel(page)).toBeHidden();
  });

  test("[fpanel-drag] dragging its head moves it", async ({ page }) => {
    await show(page);
    const before = await place(page);
    const head = (await panel(page).locator(".glim-fpanel-head").boundingBox())!;
    await page.mouse.move(head.x + 20, head.y + head.height / 2);
    await page.mouse.down();
    await page.mouse.move(head.x + 120, head.y + head.height / 2 + 30, { steps: 6 });
    await page.mouse.up();
    await expect.poll(() => place(page)).toBeGreaterThan(before + 60);
  });

  test("[fpanel-keys] the arrow keys move it while it has focus, and Escape closes it", async ({ page }) => {
    await show(page);
    await panel(page).focus();
    const before = await place(page);
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => place(page)).toBeGreaterThan(before);
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
  });

  test("[fpanel-stage] Minimise folds it to its head and Restore brings it back", async ({ page }) => {
    await show(page);
    await panel(page).getByRole("button", { name: "Minimise" }).click();
    await expect(panel(page)).toHaveAttribute("data-minimized", "");
    await expect(panel(page).locator(".glim-fpanel-body")).toBeHidden();
    await panel(page).getByRole("button", { name: "Restore" }).click();
    await expect(panel(page).locator(".glim-fpanel-body")).toBeVisible();
  });
});
