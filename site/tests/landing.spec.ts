import { expect, test, type Page } from "@playwright/test";
import { ACCENTS } from "../../packages/core/src/appearance.ts";
import { open, relook } from "./page";

// The start page: the headline, the live window and the settings it shows off.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

const word = (page: Page) => page.locator(".la-title .la-hot");
const stageWindow = (page: Page) => page.locator(".la-window");
const said = (name: string) => (name === "Sunflower" ? "yellow" : name.toLowerCase());

test("the headline names the accent the visitor arrives with, a colour of their own by the closest preset", async ({ page }) => {
  await open(page, "/");
  for (const a of ACCENTS) {
    await relook(page, { theme: "dark", motion: "off", accent: a.hex });
    await expect(word(page), a.name).toHaveText(said(a.name));
  }
  await relook(page, { theme: "dark", motion: "off", accent: "#3CB371" });
  await expect(word(page)).toHaveText("green");
});

test("the headline names each accent picked in the window", async ({ page }) => {
  await open(page, "/", { theme: "dark", motion: "off" });
  const swatches = stageWindow(page).getByRole("radiogroup", { name: "Accent" });
  for (const a of [...ACCENTS.slice(1), ACCENTS[0]]) {
    await swatches.getByRole("radio", { name: a.name }).click();
    await expect(word(page), a.name).toHaveText(said(a.name));
  }
});

test("with motion on, the colour word takes the pick once the light has carried it there", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/", { theme: "dark", motion: "subtle" });
  await stageWindow(page).getByRole("radiogroup", { name: "Accent" }).getByRole("radio", { name: "Teal" }).click();
  await expect(word(page)).toHaveText("teal", { timeout: 4000 });
});

// What each segment, tile and button of the window shows: its words, its glyph.
const strips = (page: Page) =>
  stageWindow(page).evaluate((win) => {
    const visible = (el: Element | null | undefined) => !!el && el.getBoundingClientRect().width > 4;
    return [
      ...[...win.querySelectorAll(".glim-sel-seg, .glim-sel-tile")].map((s) => ({
        name: s.getAttribute("aria-label") ?? s.textContent?.trim() ?? "",
        words: visible(s.querySelector(".glim-sel-label, .glim-sel-tile-label, .glim-label-reactive")),
        glyph: visible(s.querySelector("svg")),
      })),
      ...[...win.querySelectorAll(".la-window-actions .glim-btn")].map((b) => ({
        name: b.textContent?.trim() ?? "",
        words: visible(b.querySelector(".glim-btn-label, .glim-label-reactive")),
        glyph: visible(b.querySelector("svg")),
      })),
    ];
  });

test("every strip in the window follows the window's label setting", async ({ page }) => {
  // Wide enough that the window shows its page list too.
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page, "/", { theme: "dark", motion: "off" });
  const labels = stageWindow(page).getByRole("tablist", { name: "Labels" });
  for (const [option, words, glyph] of [
    ["Text only", true, false],
    ["Glyph only", false, true],
    ["Both", true, true],
  ] as const) {
    await labels.getByRole("tab", { name: option }).click();
    await expect
      .poll(async () => (await strips(page)).filter((p) => p.words !== words || p.glyph !== glyph).map((p) => p.name), { message: option })
      .toEqual([]);
    // Five pages in the list, three selectors of three and two buttons.
    expect((await strips(page)).length, option).toBe(16);
  }
});

test("the window stands off the page by its light and shadow, without a frame line", async ({ page }) => {
  await open(page, "/", { theme: "dark", motion: "off" });
  for (const part of [stageWindow(page), page.locator(".la-window-bar")]) {
    const style = await part.evaluate((el) => {
      const s = getComputedStyle(el);
      return { widths: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth], shadow: s.boxShadow };
    });
    expect(style.widths).toEqual(["0px", "0px", "0px", "0px"]);
    // A lit top edge, drawn inside.
    expect(style.shadow).toContain("inset");
  }
  const bar = await page.locator(".la-window-bar").evaluate((el) => getComputedStyle(el).backgroundColor);
  const body = await stageWindow(page).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bar).not.toBe(body);
});

test("the window leans back a little and stands up straight under the pointer", async ({ page }) => {
  await open(page, "/", { theme: "dark", motion: "off" });
  // How far the window is turned: zero once its rotation is gone and only the
  // perspective is left.
  const turn = () =>
    page.locator(".la-stage-window").evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.max(Math.abs(m.m11 - 1), Math.abs(m.m22 - 1), Math.abs(m.m13), Math.abs(m.m23), Math.abs(m.m31), Math.abs(m.m32));
    });
  expect(await turn()).toBeGreaterThan(0.01);
  await page.locator(".la-window-bar").hover();
  await expect.poll(turn).toBeLessThan(0.001);
});

test("the start page has no horizontal scroll at phone width and keeps its window in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/", { theme: "dark", motion: "off" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(stageWindow(page)).toBeInViewport();
});
