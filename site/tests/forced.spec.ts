import { expect, test, type Page } from "@playwright/test";

// Windows' contrast themes replace every author colour and drop every shadow,
// so a borderless filled control would vanish. The stylesheet draws edges and
// selected states in system colours there. It does not depend on a framework,
// so only one project runs it.
test.beforeEach(({}, info) => test.skip(info.project.name !== "react", "framework-free"));

const MARKUP = `
  <div class="glim-card" data-probe="card">card</div>
  <input class="glim-input" data-probe="input" placeholder="Name">
  <span class="glim-toggle">
    <button class="glim-toggle-track" role="switch" aria-checked="false" data-probe="off"><span class="glim-toggle-thumb" data-probe="off-thumb"></span></button>
    <button class="glim-toggle-track" role="switch" aria-checked="true" data-probe="on"><span class="glim-toggle-thumb" data-probe="on-thumb"></span></button>
  </span>
  <button class="glim-checkbox" role="checkbox" aria-checked="false"><span class="glim-checkbox-box" data-probe="unchecked"><svg viewBox="0 0 12 12" data-probe="unchecked-mark"><path d="M2 6l3 3 5-6" stroke="currentColor" fill="none"/></svg></span>Off</button>
  <button class="glim-checkbox" role="checkbox" aria-checked="true"><span class="glim-checkbox-box" data-probe="checked"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="currentColor" fill="none"/></svg></span>On</button>
  <div class="glim-sel glim-sel--well">
    <button class="glim-sel-seg" data-probe="seg">One</button>
    <button class="glim-sel-seg glim-active" data-probe="seg-active">Two</button>
  </div>
  <div class="glim-sel-tiles">
    <button class="glim-sel-tile" data-probe="tile">One</button>
    <button class="glim-sel-tile glim-active" data-probe="tile-active">Two</button>
  </div>
`;

async function probes(page: Page, forced: boolean) {
  await page.emulateMedia({ forcedColors: forced ? "active" : "none" });
  await page.goto("/#/engines/colour");
  await page.locator("main h1").waitFor();
  return page.evaluate((html) => {
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    const out: Record<string, { border: string; background: string; color: string; visibility: string }> = {};
    for (const el of host.querySelectorAll<HTMLElement>("[data-probe]")) {
      const s = getComputedStyle(el);
      out[el.dataset.probe!] = {
        border: s.borderTopStyle === "none" || s.borderTopWidth === "0px" ? "none" : s.borderTopColor,
        background: s.backgroundColor,
        color: s.color,
        visibility: s.visibility,
      };
    }
    host.remove();
    return out;
  }, MARKUP);
}

const visible = (colour: string) => colour !== "none" && colour !== "rgba(0, 0, 0, 0)";

test("in a contrast theme a card and a field show their edge", async ({ page }) => {
  const p = await probes(page, true);
  expect(visible(p.card.border)).toBe(true);
  expect(visible(p.input.border)).toBe(true);
});

test("in a contrast theme a switch shows its track, its thumb and whether it is on", async ({ page }) => {
  const p = await probes(page, true);
  expect(visible(p.off.border)).toBe(true);
  expect(p["off-thumb"].background).not.toBe(p.off.background);
  expect(p["on-thumb"].background).not.toBe(p.on.background);
  expect(p.on.background).not.toBe(p.off.background);
});

test("in a contrast theme a checkbox shows its box and only a ticked one its mark", async ({ page }) => {
  const p = await probes(page, true);
  expect(visible(p.unchecked.border)).toBe(true);
  expect(p.checked.background).not.toBe(p.unchecked.background);
  expect(p["unchecked-mark"].visibility).toBe("hidden");
});

test("in a contrast theme the chosen segment and tile stand out from the rest", async ({ page }) => {
  const p = await probes(page, true);
  expect(p["seg-active"].background).not.toBe(p.seg.background);
  expect(p["seg-active"].color).not.toBe(p["seg-active"].background);
  expect(p["tile-active"].background).not.toBe(p.tile.background);
  expect(p["tile-active"].color).not.toBe(p["tile-active"].background);
});

test("outside a contrast theme a card and a field stay borderless", async ({ page }) => {
  const p = await probes(page, false);
  expect(p.card.border).toBe("none");
  expect(p.input.border).toBe("none");
});
