import { expect, test, type Page } from "@playwright/test";
import { open } from "./page";

// The start page's wall and the Make it yours panel. Neither depends on a
// framework, so only one project runs them.
test.beforeEach(({}, info) => test.skip(info.project.name !== "react", "framework-free"));

const wall = (page: Page) => page.locator('[data-showcase="wall"]');
const panel = (page: Page) => page.getByRole("dialog", { name: "Make it yours" });

// Windows hands the clipboard back with CRLF line ends.
const clipboard = async (page: Page) => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n");

async function openPanel(page: Page) {
  await page.getByRole("button", { name: "Make it yours" }).click();
  await expect(panel(page)).toBeVisible();
}

const style = (page: Page, selector: string, property: string) =>
  wall(page).locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);

test("the wall is built from the real components and stays out of the tab order", async ({ page }) => {
  await open(page, "/");
  for (const name of ["SignInCard", "FortressAppCard", "Selector", "Meter", "ProgressBar", "ToastCard", "ListRow", "InfoVersionCard", "EmptyState", "SubCard", "Toggle"]) {
    await expect(wall(page).locator(`[data-glim="${name}"]`).first(), name).toBeAttached();
  }
  await expect(wall(page)).toHaveAttribute("inert", "");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-showcase="wall"]'))).toBe(false);
});

test("the wall follows the accent, the corners and the theme chosen in the panel", async ({ page }) => {
  await open(page, "/", { theme: "dark" });
  const accentButton = ".glim-btn--accent";
  expect(await style(page, accentButton, "background-color")).toBe("rgb(252, 196, 25)");
  await openPanel(page);
  await panel(page).getByRole("radio", { name: "Blue" }).click();
  // The button eases between colours, so the reading waits for it to land.
  await expect.poll(() => style(page, accentButton, "background-color")).toBe("rgb(29, 153, 243)");

  await panel(page).getByRole("radio", { name: "Square" }).click();
  expect(await style(page, ".glim-panel", "border-top-left-radius")).toBe("0px");
  await panel(page).getByRole("radio", { name: "Round" }).click();
  expect(await style(page, ".glim-panel", "border-top-left-radius")).not.toBe("0px");

  expect(await style(page, ".glim-panel", "background-color")).toBe("rgb(38, 38, 38)");
  await panel(page).getByRole("radio", { name: "Light" }).click();
  await expect.poll(() => style(page, ".glim-panel", "background-color")).toBe("rgb(255, 255, 255)");

  expect(await style(page, ".glim-btn", "outline-style")).toBe("none");
  await panel(page).locator('[data-axis="contrast"]').getByRole("radio", { name: "More" }).click();
  expect(await style(page, ".glim-btn", "outline-style")).toBe("solid");
});

test("the wall drifts with motion on and stands still with motion off or reduced", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/", { motion: "subtle" });
  expect(await style(page, ".wall-track", "animation-name")).toBe("wall-drift");
  await openPanel(page);
  await panel(page).locator('[data-axis="motion"]').getByRole("radio", { name: "Off" }).click();
  expect(await style(page, ".wall-track", "animation-name")).toBe("none");
  await panel(page).getByRole("radio", { name: "Wild" }).click();
  expect(await style(page, ".wall-track", "animation-name")).toBe("wall-drift");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await style(page, ".wall-track", "animation-name")).toBe("none");
});

test("the panel lists every axis of the look", async ({ page }) => {
  await open(page, "/");
  await openPanel(page);
  for (const axis of ["theme", "oled", "accent", "rainbow", "shape", "motion", "density", "contrast", "labels"]) {
    await expect(panel(page).locator(`[data-axis="${axis}"]`), axis).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
});

test("the copy button hands over the root attributes and the settings for the chosen look", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark", oled: true, shape: "round", accent: "#1D99F3", rainbow: "reactive", motion: "wild", density: "compact", contrast: "more", labels: "glyph" });
  await openPanel(page);
  await panel(page).locator('[data-look="copy"]').click();
  await expect(panel(page).locator('[data-look="copy"]')).toContainText("Copied");
  expect(await clipboard(page)).toBe(`<html
  data-theme="dark"
  data-oled
  data-rainbow="reactive"
  data-shape="round"
  data-motion="wild"
  data-density="compact"
  data-contrast="more"
  data-labels-buttons="glyph"
  data-labels-sidebar="glyph"
  data-labels-tabs="glyph"
  style="--accent: #1D99F3; --accent-contrast: #161616; --accent-soft: rgba(29, 153, 243, 0.14)"
>

export const lookDefaults = {
  theme: "dark",
  accent: "#1D99F3",
  rainbow: true,
  rainbowReactive: true,
  shape: "round",
  motion: "wild",
  density: "compact",
  contrast: "more",
  labels: {
    buttons: "glyph",
    sidebar: "glyph",
    tabs: "glyph"
  }
};
`);
});

test("the default look copies without a theme, an accent or a rainbow", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/");
  await openPanel(page);
  await panel(page).locator('[data-look="copy"]').click();
  const snippet = await clipboard(page);
  expect(snippet).not.toContain("data-theme");
  expect(snippet).not.toContain("--accent");
  expect(snippet).not.toContain("data-rainbow");
  expect(snippet).not.toContain("data-contrast");
  expect(snippet).toContain('data-density="normal"');
  expect(snippet).toContain('theme: "system"');
  expect(snippet).toContain('accent: "#FCC419"');
});

test.describe("at phone width", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of ["/", "/blocks"]) {
    test(`${path} has no horizontal scroll`, async ({ page }) => {
      await open(page, path);
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });
  }

  test("the panel opens as a sheet without a horizontal scroll", async ({ page }) => {
    await open(page, "/");
    await openPanel(page);
    const box = (await panel(page).boundingBox())!;
    expect(box.x).toBe(0);
    expect(box.width).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
