import { expect, test, type Page } from "@playwright/test";
import { relook } from "./page";

// The contrast step (prefers-contrast: more), GlimStone's own, apart from a
// Windows contrast theme. It does not depend on a framework, so only one
// project runs it.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

async function look(page: Page, contrast: "more" | "no-preference", theme: "dark" | "light") {
  await page.emulateMedia({ contrast });
  await page.goto("/#/engines/colour");
  await relook(page, { theme });
  return page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML = `<span data-probe="muted" style="color: var(--carbon-text-muted)">m</span>
      <input class="glim-input" data-probe="input">
      <button class="glim-btn glim-btn--subtle" data-probe="button">b</button>`;
    document.body.append(host);
    const probe = (name: string) => getComputedStyle(host.querySelector(`[data-probe="${name}"]`)!);
    const out = {
      muted: probe("muted").color,
      inputEdge: probe("input").outlineStyle === "solid" ? probe("input").outlineWidth : "none",
      buttonEdge: probe("button").outlineStyle === "solid" ? probe("button").outlineWidth : "none",
      ring: getComputedStyle(document.documentElement).getPropertyValue("--focus-ring-width").trim(),
    };
    host.remove();
    return out;
  });
}

for (const theme of ["dark", "light"] as const) {
  // A page each: Firefox keeps the first page's styles when the media changes
  // under a navigation to the same address.
  test(`more contrast darkens muted text, draws edges and thickens the ring on ${theme}`, async ({ context }) => {
    const calm = await look(await context.newPage(), "no-preference", theme);
    const strong = await look(await context.newPage(), "more", theme);
    expect(strong.muted).not.toBe(calm.muted);
    expect(calm.inputEdge).toBe("none");
    expect(strong.inputEdge).toBe("1px");
    expect(strong.buttonEdge).toBe("1px");
    expect(calm.ring).toBe("2px");
    expect(strong.ring).toBe("3px");
  });
}

test("more contrast moves the accent ink onto the second step and keeps the fill", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await page.addInitScript(() => localStorage.setItem("gs-docs-look", JSON.stringify({ theme: "light", accent: "#1D99F3" })));
  await page.goto("/#/engines/colour");
  await page.locator("main h1").waitFor();
  const { ink, fill } = await page.evaluate(() => {
    const el = document.createElement("span");
    el.style.color = "var(--accent-ink)";
    el.style.background = "var(--accent)";
    document.body.append(el);
    const s = getComputedStyle(el);
    return { ink: s.color, fill: s.backgroundColor };
  });
  expect(ink).toMatch(/^oklab\(0\.4 /);
  expect(fill).toBe("rgb(29, 153, 243)");
});
