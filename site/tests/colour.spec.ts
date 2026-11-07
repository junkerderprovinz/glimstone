import { expect, test, type Page } from "@playwright/test";

// The colour engine's stylesheet side, which the core's unit tests cannot see.
// It does not depend on a framework, so only one project runs it.
test.beforeEach(({}, info) => test.skip(info.project.name !== "react", "framework-free"));

async function open(page: Page, look: object) {
  await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto("/#/engines/colour");
  await page.locator("main h1").waitFor();
}

const token = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

const ground = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("OLED puts a chosen dark theme on black and moves the card one step down", async ({ page }) => {
  await open(page, { theme: "dark", oled: true });
  expect(await ground(page)).toBe("rgb(0, 0, 0)");
  expect(await token(page, "--carbon-surface")).toBe("#161616");
  expect(await token(page, "--carbon-text")).toBe("#f4f4f4");
});

test("OLED follows the system's dark when no theme is chosen", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await open(page, { theme: "system", oled: true });
  expect(await ground(page)).toBe("rgb(0, 0, 0)");
});

test("OLED leaves the light theme alone, chosen or from the system", async ({ page }) => {
  await open(page, { theme: "light", oled: true });
  expect(await ground(page)).toBe("rgb(244, 244, 244)");
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  expect(await ground(page)).toBe("rgb(244, 244, 244)");
});

test("without OLED the dark ground stays Carbon's near-black", async ({ page }) => {
  await open(page, { theme: "dark", oled: false });
  expect(await ground(page)).toBe("rgb(22, 22, 22)");
});

test("a pale accent's text is darkened on the light theme until it reads", async ({ page }) => {
  await open(page, { theme: "light", accent: "#FFFF00" });
  const ink = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--accent-ink)";
    document.body.append(probe);
    return getComputedStyle(probe).color;
  });
  const [r, g, b] = ink.match(/\d+/g)!.map(Number);
  // Yellow keeps its hue: red and green equal, no blue, and dark enough for 4.5:1 on white.
  expect(r).toBe(g);
  expect(b).toBe(0);
  expect(r).toBeLessThan(0x80);
});

test("a preset keeps the stylesheet's own ink", async ({ page }) => {
  await open(page, { theme: "light", accent: "#FCC419" });
  expect(await token(page, "--accent-ink-light")).toBe("");
});

test("Chromium is no source for the system colour, so the wand swatch stays away", async ({ page }) => {
  await open(page, {});
  await expect(page.getByRole("radio", { name: "Blue" }).first()).toBeVisible();
  await expect(page.getByRole("radio", { name: "System colour" })).toHaveCount(0);
});

test("the OLED switch sits under the theme selector and turns OLED on", async ({ page }) => {
  await open(page, { theme: "dark" });
  await page.getByRole("switch", { name: "OLED" }).first().click();
  expect(await ground(page)).toBe("rgb(0, 0, 0)");
});

// The shadow a fresh element of the class casts under the current look.
const shadowOf = (page: Page, cls: string) =>
  page.evaluate((c) => {
    const el = document.createElement("div");
    el.className = c;
    document.body.append(el);
    const shadow = getComputedStyle(el).boxShadow;
    el.remove();
    return shadow;
  }, cls);

test("OLED draws no ring round a card", async ({ page }) => {
  await open(page, { theme: "dark", oled: true });
  expect(await shadowOf(page, "glim-card")).not.toMatch(/0px 0px 0px 1px/);
});

test("under OLED a bubble keeps the dark look's shadow, which lifts it off a card", async ({ page }) => {
  await open(page, { theme: "dark", oled: false });
  const dark = await shadowOf(page, "glim-bubble");
  await page.evaluate(() => document.documentElement.setAttribute("data-oled", ""));
  expect(await shadowOf(page, "glim-bubble")).toBe(dark);
});
