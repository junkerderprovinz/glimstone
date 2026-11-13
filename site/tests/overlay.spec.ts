import { expect, test, type Locator, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

const inert = (el: Locator) => el.evaluate((e) => !!e.closest("[inert]"));

test.describe("Window", () => {
  const columns = (page: Page) => page.getByRole("dialog", { name: "Columns" });

  test("[window-inert] the page behind a window is inert, and so is a window behind another", async ({ page }) => {
    await open(page, "/components/window");
    const trigger = stage(page, "WindowColumns").getByRole("button", { name: "Choose columns" });
    await trigger.click();
    await expect(columns(page)).toBeVisible();
    expect(await inert(trigger)).toBe(true);
    expect(await inert(columns(page))).toBe(false);
    await columns(page).getByRole("button", { name: "About columns" }).click();
    const about = page.getByRole("dialog", { name: "About columns" });
    await expect(about).toBeVisible();
    expect(await inert(columns(page).getByRole("button", { name: "About columns" }))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(about).toHaveCount(0);
    expect(await inert(columns(page))).toBe(false);
    await page.keyboard.press("Escape");
    await expect(columns(page)).toHaveCount(0);
    expect(await inert(trigger)).toBe(false);
  });
});

test.describe("Popover", () => {
  const trigger = (page: Page) => stage(page, "PopoverBasic").getByRole("button", { name: "Filter" });
  const popover = (page: Page) => page.getByRole("dialog", { name: "Filter the list" });

  async function openIt(page: Page) {
    await trigger(page).click();
    await expect(popover(page)).toBeVisible();
  }

  test("[popover-top] it stands in the top layer, named by its label", async ({ page }) => {
    await open(page, "/components/popover");
    await openIt(page);
    expect(await popover(page).evaluate((p) => p.matches(":popover-open"))).toBe(true);
  });

  test("[popover-anchor] it opens under its trigger, tied to it by an anchor", async ({ page }) => {
    await open(page, "/components/popover");
    await openIt(page);
    const t = (await trigger(page).boundingBox())!;
    const p = (await popover(page).boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(t.y + t.height);
    expect(await popover(page).evaluate((e) => getComputedStyle(e).getPropertyValue("position-anchor"))).toMatch(/^--glim-anchor-/);
  });

  test("[popover-flip] with no room below it opens above", async ({ page }) => {
    await open(page, "/components/popover");
    const at = (await trigger(page).boundingBox())!;
    await page.setViewportSize({ width: 1280, height: Math.round(at.y + at.height + 40) });
    await openIt(page);
    const t = (await trigger(page).boundingBox())!;
    const p = (await popover(page).boundingBox())!;
    expect(p.y + p.height).toBeLessThanOrEqual(t.y);
  });

  test("[popover-fallback] without anchor positioning it is placed the same way", async ({ page }) => {
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS);
      CSS.supports = ((...args: [string, string?]) => (String(args[0]).includes("anchor") ? false : supports(...(args as [string])))) as typeof CSS.supports;
    });
    await open(page, "/components/popover");
    await openIt(page);
    const t = (await trigger(page).boundingBox())!;
    const p = (await popover(page).boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(t.y + t.height);
    expect(Math.abs(p.x + p.width / 2 - (t.x + t.width / 2))).toBeLessThan(2);
  });

  test("[popover-focus] focus goes in, and Escape closes it and gives focus back", async ({ page }) => {
    await open(page, "/components/popover");
    await openIt(page);
    await expect(popover(page).getByRole("textbox", { name: "Name contains" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(popover(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
  });

  test("[popover-outside] a press beside it closes it", async ({ page }) => {
    await open(page, "/components/popover");
    await openIt(page);
    await page.mouse.click(5, 300);
    await expect(popover(page)).toHaveCount(0);
  });
});

test.describe("Sheet", () => {
  const opener = (page: Page) => stage(page, "SheetBasic").getByRole("button", { name: "Details" });
  const sheet = (page: Page) => page.getByRole("dialog", { name: "Nightly backup" });

  async function openIt(page: Page) {
    await opener(page).click();
    await expect(sheet(page)).toBeVisible();
    await sheet(page).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
  }

  test("[sheet-modal] a modal dialog in the top layer, the page behind it inert", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    expect(await sheet(page).evaluate((d) => d.tagName === "DIALOG" && d.matches(":modal"))).toBe(true);
    expect(await opener(page).evaluate((b) => document.elementFromPoint(b.getBoundingClientRect().x + 2, b.getBoundingClientRect().y + 2) === b)).toBe(false);
  });

  test("[sheet-heading] its title is the heading badge in the notch", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    await expect(sheet(page).getByRole("heading", { name: "Nightly backup" }).locator(".glim-badge--notch")).toHaveCount(1);
  });

  test("[sheet-edge] a card at the end edge on a wide window, from the bottom on a phone", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    const wide = (await sheet(page).boundingBox())!;
    expect(Math.round(wide.x + wide.width)).toBe(1280 - 16);
    expect(Math.round(wide.y)).toBe(16);
    expect(Math.round(wide.y + wide.height)).toBe(860 - 16);
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 390, height: 700 });
    await openIt(page);
    const phone = (await sheet(page).boundingBox())!;
    expect(Math.round(phone.y + phone.height)).toBe(700);
    expect(Math.round(phone.width)).toBe(390);
  });

  test("[sheet-escape] Escape closes it and focus goes back to the opener", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    await page.keyboard.press("Escape");
    await expect(sheet(page)).toHaveCount(0);
    await expect(opener(page)).toBeFocused();
  });

  test("[sheet-trap] Tab and Shift+Tab stay inside it", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    const inside = () => sheet(page).evaluate((d) => d.contains(document.activeElement));
    const stops = await sheet(page).evaluate((d) => d.querySelectorAll("button:not([disabled]), input:not([disabled]), [tabindex='0']").length);
    for (let i = 0; i <= stops; i++) {
      await page.keyboard.press("Tab");
      expect(await inside()).toBe(true);
    }
    for (let i = 0; i <= stops; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await inside()).toBe(true);
    }
  });

  test("[sheet-backdrop] a press on the scrim closes it", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    await page.mouse.click(20, 400);
    await expect(sheet(page)).toHaveCount(0);
  });

  test("[sheet-still] it slides in at wild and stands still at off", async ({ page }) => {
    await open(page, "/components/sheet");
    await relook(page, { motion: "wild" });
    expect(await opener(page).evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--motion-sheet-shift").trim())).toBe("1");
    await relook(page, { motion: "off" });
    await openIt(page);
    expect(await sheet(page).evaluate((d) => getComputedStyle(d).transitionDuration)).toMatch(/^0s/);
  });

  test("[sheet-portal] a bubble from inside it shows above it", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    await sheet(page).getByRole("button", { name: "Copy the path" }).hover();
    const bubble = page.getByRole("tooltip", { name: "Copy the path" });
    await expect(bubble).toBeVisible();
    expect(await bubble.evaluate((b) => !!b.closest("dialog.glim-sheet"))).toBe(true);
  });

  test("[sheet-foot] its foot works as a window's, with no close mark in its head", async ({ page }) => {
    await open(page, "/components/sheet");
    await openIt(page);
    await expect(sheet(page).locator(".glim-modal-foot").getByRole("button")).toHaveText(["Cancel", "Run now"]);
    await expect(sheet(page).locator(".glim-sheet-title").getByRole("button")).toHaveCount(0);
    await sheet(page).getByRole("button", { name: "Cancel" }).click();
    await expect(sheet(page)).toHaveCount(0);
  });
});
