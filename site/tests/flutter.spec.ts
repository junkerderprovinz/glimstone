import { expect, test, type Page } from "@playwright/test";

// The Flutter column of a demo is an app in a frame, which learns the look from
// its address.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

// Without a framework named in the address the demo shows every column, Flutter's too.
async function openAll(page: Page, path: string, look: Record<string, unknown>) {
  await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto(`/#${path}`);
  await page.locator("main h1").waitFor();
}

const frameLook = async (page: Page, demo: string) => {
  const src = await page.locator(`[data-demo="${demo}"][data-framework="flutter"] iframe`).getAttribute("src");
  return Object.fromEntries(new URL(src!, page.url()).searchParams);
};

for (const [path, demo] of [
  ["/components/toggle", "ToggleBasic"],
  ["/components/card", "CardBasic"],
]) {
  test(`${demo} has a Flutter column that takes the accent, the light, the glyphs and the motion`, async ({ page }) => {
    await openAll(page, path, { theme: "light", accent: "#1D99F3", motion: "wild", shape: "round" });
    expect(await frameLook(page, demo)).toMatchObject({ demo, theme: "light", accent: "#1D99F3", motion: "wild", shape: "round" });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-light", "glow");
      document.documentElement.setAttribute("data-glyphs", "line");
    });
    await expect.poll(() => frameLook(page, demo)).toMatchObject({ light: "glow", glyphs: "line" });
  });
}
