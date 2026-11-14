import { expect, test, type Page } from "@playwright/test";
import { open, relook } from "./page";

// The start page's wall and the Make it yours panel. Neither depends on a
// framework, so one project runs them in depth and every project checks that
// they work while its framework is the one the site shows.
const inDepth = () => test.skip(test.info().project.metadata.fw !== "react", "framework-free");

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

test("the wall, the panel and its snippet work while the site shows this framework", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark" });
  await expect(wall(page).locator('[data-glim="SignInCard"]').first()).toBeAttached();
  await openPanel(page);
  await panel(page).getByRole("radio", { name: "Blue" }).click();
  await expect.poll(() => style(page, ".glim-btn--accent", "background-color")).toBe("rgb(29, 153, 243)");
  await panel(page).locator('[data-look="copy"]').click();
  expect(await clipboard(page)).toContain('accent: "#1D99F3"');
});

test("the wall is built from the real components and stays out of the tab order", async ({ page }) => {
  inDepth();
  await open(page, "/");
  for (const name of ["SignInCard", "FortressAppCard", "Selector", "Meter", "ProgressBar", "ToastCard", "ListRow", "InfoVersionCard", "EmptyState", "SubCard", "Toggle"]) {
    await expect(wall(page).locator(`[data-glim="${name}"]`).first(), name).toBeAttached();
  }
  await expect(wall(page)).toHaveAttribute("inert", "");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-showcase="wall"]'))).toBe(false);
});

test("the wall follows the accent, the corners and the theme chosen in the panel", async ({ page }) => {
  inDepth();
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
  await panel(page).locator('[data-axis="contrast"]').getByRole("switch").click();
  expect(await style(page, ".glim-btn", "outline-style")).toBe("solid");
});

test("the wall drifts with motion on and stands still with motion off or reduced", async ({ page }) => {
  inDepth();
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
  inDepth();
  await open(page, "/");
  await openPanel(page);
  for (const axis of ["theme", "oled", "accent", "rainbow", "contrast", "shape", "motion", "density", "labels"]) {
    await expect(panel(page).locator(`[data-axis="${axis}"]`), axis).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
});

test("the copy button hands over the root attributes and the settings for the chosen look", async ({ page, context, browserName }) => {
  inDepth();
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark", oled: true, shape: "round", accent: "#1D99F3", rainbow: "reactive", motion: "wild", density: "compact", contrast: "more", labels: "glyph" });
  await openPanel(page);
  await panel(page).locator('[data-look="copy"]').click();
  await expect(panel(page).locator('[data-look="copy"]')).toContainText("Copied");
  // The rainbow's colours as applyRainbow() set them on the page, which the snippet has to repeat.
  const rainbow = await page.evaluate(() =>
    Array.from({ length: 8 }, (_, i) => {
      const root = document.documentElement.style;
      return `--rb-${i}: ${root.getPropertyValue(`--rb-${i}`)}; --rb-ink-${i}: ${root.getPropertyValue(`--rb-ink-${i}`)}`;
    }).join("; "),
  );
  expect(await clipboard(page)).toBe(`<html
  data-theme="dark"
  data-oled
  data-rainbow="reactive"
  data-contrast="more"
  data-shape="round"
  data-motion="wild"
  data-density="compact"
  data-labels-buttons="glyph"
  data-labels-sidebar="glyph"
  data-labels-tabs="glyph"
  style="--accent: #1D99F3; --accent-contrast: #161616; --accent-soft: rgba(29, 153, 243, 0.14); ${rainbow}"
>

export const lookDefaults = {
  theme: "dark",
  accent: "#1D99F3",
  rainbow: true,
  rainbowReactive: true,
  rainbowRotate: false,
  rainbowSeed: 0,
  rainbowPalette: [
    "#FF8389",
    "#FF832B",
    "#FCC419",
    "#6FDC8C",
    "#3DDBD9",
    "#1D99F3",
    "#BE95FF",
    "#FF7EB6"
  ],
  contrast: "more",
  shape: "round",
  motion: "wild",
  density: "compact",
  labels: {
    buttons: "glyph",
    sidebar: "glyph",
    tabs: "glyph"
  }
};
`);
});

test("the panel is a settings page: sub-cards of field rows, a glyph on every segment, switches at the row's end", async ({ page }) => {
  inDepth();
  await open(page, "/", { theme: "dark" });
  await openPanel(page);
  await expect(panel(page).locator('[data-glim="SubCard"]')).toHaveCount(3);
  for (const axis of ["theme", "shape", "motion", "density", "labels"]) {
    const row = panel(page).locator(`[data-axis="${axis}"]`);
    await expect(row.locator('[data-glim="Selector"]'), axis).toHaveCount(1);
    const segments = row.locator('[role="radio"]');
    expect(await segments.count(), axis).toBeGreaterThan(1);
    for (const segment of await segments.all()) await expect(segment.locator("svg"), axis).toHaveCount(1);
  }
  for (const axis of ["oled", "rainbow", "contrast"]) {
    const row = panel(page).locator(`[data-axis="${axis}"]`);
    await expect(row.locator('[data-glim="InfoBubble"]'), axis).toHaveCount(1);
    const rowBox = (await row.boundingBox())!;
    const switchBox = (await row.getByRole("switch").boundingBox())!;
    expect(Math.abs(rowBox.x + rowBox.width - (switchBox.x + switchBox.width)), axis).toBeLessThan(2);
  }
});

test("every label mode shows in the panel's selectors as it says, at desktop and at phone width", async ({ page }) => {
  inDepth();
  const shown = (mode: string) =>
    panel(page).evaluate((el, m) => {
      const segments = [...el.querySelectorAll(".glim-sel-seg")];
      const words = segments.filter((s) => {
        const label = s.querySelector(".glim-sel-label, .glim-label-reactive");
        return !!label && label.getBoundingClientRect().width > 4;
      }).length;
      const glyphs = segments.filter((s) => (s.querySelector("svg")?.getBoundingClientRect().width ?? 0) > 0).length;
      return { mode: m, segments: segments.length, words, glyphs };
    }, mode);
  await open(page, "/");
  for (const width of [1620, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const labels of ["text", "textGlyph", "glyph"]) {
      await relook(page, { theme: "dark", labels });
      await openPanel(page);
      const s = await shown(labels);
      expect(s.words, `${labels} at ${width}`).toBe(labels === "glyph" ? 0 : s.segments);
      expect(s.glyphs, `${labels} at ${width}`).toBe(labels === "text" ? 0 : s.segments);
    }
  }
});

test("with the rainbow on, the panel shows its palette and the settings under it, as an app's settings page does", async ({ page }) => {
  inDepth();
  await open(page, "/", { theme: "dark" });
  await openPanel(page);
  for (const axis of ["reactive", "rotate", "palette"]) await expect(panel(page).locator(`[data-axis="${axis}"]`), axis).toHaveCount(0);
  await panel(page).locator('[data-axis="rainbow"]').getByRole("switch").click();
  for (const axis of ["reactive", "rotate", "palette"]) await expect(panel(page).locator(`[data-axis="${axis}"]`), axis).toBeVisible();
  const swatches = panel(page).locator('[data-axis="palette"] [data-position]');
  await expect(swatches).toHaveCount(8);
  const root = await page.evaluate(() => Array.from({ length: 8 }, (_, i) => {
    const probe = document.createElement("span");
    probe.style.color = `var(--rb-${i})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }));
  for (const [i, colour] of root.entries()) await expect(swatches.nth(i)).toHaveCSS("background-color", colour);
  expect(await panel(page).locator('[data-axis="accent"] .look-swatches').evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");

  const first = swatches.first();
  await first.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  await first.click();
  await page.getByRole("textbox", { name: "Hex" }).fill("#2E8B57");
  await page.getByRole("button", { name: "Apply" }).click();
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--rb-0"))).toBe("#2e8b57");
});

test("the frameworks under the hero carry their marks and lead to their adoption notes", async ({ page }) => {
  inDepth();
  await open(page, "/", { theme: "dark" });
  const links = page.locator(".hero-frameworks a");
  await expect(links).toHaveText(["React", "Vue", "Solid", "Svelte"]);
  for (const link of await links.all()) await expect(link.locator(".fw-mark svg")).toHaveCount(1);
  await links.filter({ hasText: "Svelte" }).click();
  await expect(page.locator("main h3#svelte")).toBeInViewport();
});

test("a click on the chosen swatch opens the picker, and the colour picked lands on the page and in the snippet", async ({ page, context, browserName }) => {
  inDepth();
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark" });
  await openPanel(page);
  const chosen = panel(page).locator('[data-axis="accent"] [aria-checked="true"]');
  // The picker closes when what it is anchored to scrolls, and Playwright
  // scrolls the swatch into view before it clicks, so that scroll has to land
  // before the click opens the picker.
  await chosen.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  await chosen.click();
  await expect(page.locator('[data-glim="ColorPicker"]')).toBeVisible();
  const hex = page.getByRole("textbox", { name: "Hex" });
  await hex.fill("#2E8B57");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect.poll(() => style(page, ".glim-btn--accent", "background-color")).toBe("rgb(46, 139, 87)");
  await expect(chosen).toHaveAttribute("aria-label", /#2E8B57/);
  await panel(page).locator('[data-look="copy"]').click();
  const snippet = await clipboard(page);
  expect(snippet).toContain("--accent: #2e8b57");
  expect(snippet).toContain('accent: "#2e8b57"');
});

test("the default look copies without a theme, an accent or a rainbow", async ({ page, context, browserName }) => {
  inDepth();
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
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
      inDepth();
      await open(page, path);
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });
  }

  test("the panel opens as a sheet without a horizontal scroll", async ({ page }) => {
    inDepth();
    await open(page, "/");
    await openPanel(page);
    const box = (await panel(page).boundingBox())!;
    expect(box.x).toBe(0);
    expect(box.width).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
