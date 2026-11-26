import { expect, test, type Page } from "@playwright/test";
import { open, relook } from "./page";

// The Make it yours panel and the frame around the docs. Neither depends on a
// framework, so one project runs them in depth and every project checks that
// they work while its framework is the one the site shows.
const inDepth = () => test.skip(test.info().project.metadata.fw !== "react", "framework-free");

const panel = (page: Page) => page.getByRole("dialog", { name: "Make it yours" });

// Windows hands the clipboard back with CRLF line ends.
const clipboard = async (page: Page) => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n");

async function openPanel(page: Page) {
  await page.locator(".site-header").getByRole("button", { name: "Look" }).click();
  await expect(panel(page)).toBeVisible();
  // Off the button again, so its fill reads without the hover.
  await page.mouse.move(0, 0);
}

// The header's Look button turns to the accent while the panel is open, so it
// shows the accent on every page.
const accentFill = (page: Page) =>
  page.locator(".site-header .glim-btn--accent").evaluate((el) => getComputedStyle(el).backgroundColor);
const style = (page: Page, selector: string, property: string) =>
  page.locator(`main ${selector}`).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);

test("the panel and its snippet work while the site shows this framework", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark" });
  await openPanel(page);
  await panel(page).getByRole("radio", { name: "Blue" }).click();
  await expect.poll(() => accentFill(page)).toBe("rgb(29, 153, 243)");
  await panel(page).locator('[data-look="copy"]').click();
  expect(await clipboard(page)).toContain('accent: "#1D99F3"');
});

test("the page follows the accent, the corners and the theme chosen in the panel", async ({ page }) => {
  inDepth();
  await open(page, "/components/card", { theme: "dark" });
  await openPanel(page);
  // The button eases between colours, so each reading waits for it to land.
  await expect.poll(() => accentFill(page)).toBe("rgb(252, 196, 25)");
  await panel(page).getByRole("radio", { name: "Blue" }).click();
  await expect.poll(() => accentFill(page)).toBe("rgb(29, 153, 243)");

  await panel(page).getByRole("radio", { name: "Square" }).click();
  expect(await style(page, ".glim-panel", "border-top-left-radius")).toBe("0px");
  await panel(page).getByRole("radio", { name: "Round" }).click();
  expect(await style(page, ".glim-panel", "border-top-left-radius")).not.toBe("0px");

  expect(await style(page, ".glim-panel", "background-color")).toMatch(/^oklch\(0\.235 /);
  await panel(page).getByRole("radio", { name: "Light" }).click();
  await expect.poll(() => style(page, ".glim-panel", "background-color")).toMatch(/^oklch\(0\.997 /);

  expect(await style(page, ".glim-btn", "outline-style")).toBe("none");
  await panel(page).locator('[data-axis="contrast"]').getByRole("switch").click();
  expect(await style(page, ".glim-btn", "outline-style")).toBe("solid");
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
  await expect.poll(() => accentFill(page)).toBe("rgb(46, 139, 87)");
  await expect(chosen).toHaveAttribute("aria-label", /#2E8B57/);
  await panel(page).locator('[data-look="copy"]').click();
  const snippet = await clipboard(page);
  expect(snippet).toContain("--accent: #2e8b57");
  expect(snippet).toContain('accent: "#2e8b57"');
});

test("Reset accent after a picked colour brings back the default accent on the page and in the snippet", async ({ page, context, browserName }) => {
  inDepth();
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/", { theme: "dark" });
  await openPanel(page);
  const row = panel(page).locator('[data-axis="accent"]');
  const reset = row.locator('[data-look="reset-accent"]');
  await expect(reset).toBeDisabled();
  const chosen = row.locator('[aria-checked="true"]');
  await chosen.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  await chosen.click();
  await page.getByRole("textbox", { name: "Hex" }).fill("#2E8B57");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect.poll(() => accentFill(page)).toBe("rgb(46, 139, 87)");

  await reset.click();
  await expect.poll(() => accentFill(page)).toBe("rgb(252, 196, 25)");
  await expect(row.locator('[data-swatch="Sunflower"]')).toHaveAttribute("aria-checked", "true");
  await expect(row.locator('[data-swatch="Sunflower"]')).not.toHaveAttribute("aria-label", /#2E8B57/i);
  await expect(reset).toBeDisabled();
  await panel(page).locator('[data-look="copy"]').click();
  const snippet = await clipboard(page);
  expect(snippet).not.toContain("--accent");
  expect(snippet).not.toContain("2e8b57");
  expect(snippet).toContain('accent: "#FCC419"');
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

test("[site-centre] on a wide screen the page stands in the middle between the nav and the contents list, each at its edge of the window", async ({ page }) => {
  inDepth();
  await page.setViewportSize({ width: 1920, height: 1000 });
  for (const path of ["/components/angle-slider", "/introduction"]) {
    await open(page, path);
    const box = (sel: string) => page.locator(sel).first().evaluate((e) => e.getBoundingClientRect().toJSON() as DOMRect);
    const frame = page.locator(".site-frame");
    const [gutter, gap] = await frame.evaluate((f) => [parseFloat(getComputedStyle(f).paddingInlineEnd), parseFloat(getComputedStyle(f).columnGap)]);
    const nav = await box(".site-nav");
    const toc = await box(".site-toc");
    const main = await box(".site-frame > main");
    expect(nav.left, path).toBe(gutter);
    expect(Math.abs(toc.right - (1920 - gutter)), path).toBeLessThan(1);
    expect(nav.width, path).toBe(toc.width);
    expect(Math.abs(main.left - (nav.right + gap) - (toc.left - gap - main.right)), path).toBeLessThan(2);
    // 68rem at most, however wide the window.
    expect(main.width, path).toBe(68 * 16);
  }
});

test("[site-nav-left] the docs nav stands at the window's left edge, and opening Make it yours moves neither it nor the page", async ({ page }) => {
  inDepth();
  await page.setViewportSize({ width: 1920, height: 1000 });
  await open(page, "/components/picker-window");
  const nav = page.getByRole("navigation", { name: "Docs" });
  const gutter = await page.locator(".site-frame").evaluate((f) => parseFloat(getComputedStyle(f).paddingInlineStart));
  const left = () => nav.evaluate((n) => n.getBoundingClientRect().left);
  const pageLeft = () => page.locator("main").evaluate((m) => m.getBoundingClientRect().left);
  expect(await left()).toBe(gutter);
  const before = await pageLeft();
  await page.getByRole("button", { name: "Look" }).click();
  await expect(panel(page)).toBeVisible();
  expect(await left()).toBe(gutter);
  expect(await pageLeft()).toBe(before);
});

test("the header and the docs nav stay in place while a long page scrolls under them", async ({ page }) => {
  inDepth();
  await open(page, "/components/toggle");
  const nav = page.locator(".site-nav");
  for (const part of [page.locator(".site-header"), nav]) expect(await part.evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
  const before = (await nav.boundingBox())!.y;
  await page.evaluate(() => window.scrollTo(0, 1200));
  const header = await page.locator(".site-header").evaluate((h) => h.getBoundingClientRect().height);
  await expect.poll(async () => (await nav.boundingBox())!.y).toBeCloseTo(Math.min(before, header), 0);
});
