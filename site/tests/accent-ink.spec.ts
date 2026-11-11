import { expect, test, type Page } from "@playwright/test";

// Rule 45: the ink on an accent fill is the computed --accent-contrast, so text
// and glyphs on it read whatever accent comes in. Each page is walked in every
// preset and theme, with its picked, pressed, checked and open states shown,
// and every text, glyph or knob drawn on the accent is measured.

const ACCENTS = ["#FCC419", "#1D99F3", "#6FDC8C", "#FF8389", "#BE95FF", "#FF832B", "#3DDBD9", "#FF7EB6"];
const THEMES = [
  { name: "light", look: { theme: "light", oled: false } },
  { name: "dark", look: { theme: "dark", oled: false } },
  { name: "oled", look: { theme: "dark", oled: true } },
];

type Show = (page: Page) => Promise<void>;

// What many an app's own reset says about links and buttons, outside any cascade
// layer, as Tailwind 3's preflight and most hand-written resets do. Unlayered
// rules beat every layered one, whatever their specificity.
const APP_RESET = "a, button { color: inherit; }";

const click = (selector: string): Show => async (page) => {
  const all = page.locator(selector);
  for (let i = 0; i < (await all.count()); i++) await all.nth(i).click();
};

const openMenu = (selector: string): Show => async (page) => {
  await page.locator(selector).first().click();
  await page.locator('[role="menu"], [role="listbox"]').first().waitFor();
  await page.keyboard.press("ArrowDown");
};

// Each page with what brings its selected states out, or null where the page
// already shows them at rest.
const PAGES: Record<string, Show | null> = {
  "/components/badge": null,
  "/components/button": null,
  "/components/card": null,
  "/components/checkbox": null,
  "/components/color-picker": null,
  "/components/combobox": openMenu("[data-demo] .glim-combobox-toggle"),
  "/components/confirm-dialog": null,
  "/components/context-menu": null,
  "/components/dropdown-listbox": null,
  "/components/empty-state": null,
  "/components/field-row": null,
  "/components/glyph-tile": null,
  "/components/icon-button": click('[data-demo] button.glim-icon-btn[aria-pressed="false"]'),
  "/components/info-bubble": null,
  "/components/list-row": null,
  "/components/menu-bar": openMenu("[data-demo] .glim-menubar-item"),
  "/components/meter": null,
  "/components/pill": null,
  "/components/progress-bar": null,
  "/components/row-mark": null,
  "/components/select": openMenu("[data-demo] .glim-select-trigger"),
  "/components/selector": null,
  "/components/sidebar-row": null,
  "/components/slider": null,
  "/components/sub-card": null,
  "/components/table": null,
  "/components/toast": null,
  "/components/toggle": null,
  "/components/tree": null,
  "/components/window": null,
  "/components/window-bar": null,
  "/engines/colour": null,
  "/guide/glossary": null,
};

interface Miss {
  what: string;
  text: string;
  ink: string;
  fill: string;
  ratio: number;
  needs: number;
}

// Runs in the page: every element that draws on a fill equal to the accent or
// its hover step, with the ratio of its ink against that fill.
function measure(): Miss[] {
  const probe = (value: string) => {
    const el = document.createElement("span");
    el.style.backgroundColor = value;
    document.body.append(el);
    const c = getComputedStyle(el).backgroundColor;
    el.remove();
    return c;
  };
  const parse = (c: string) => {
    const m = c.match(/[\d.]+/g)?.map(Number) ?? [];
    return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3]! : 1 };
  };
  const lum = ([r, g, b]: number[]) => {
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
  };
  const ratio = (a: number[], b: number[]) => {
    const x = lum(a);
    const y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const shown = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };

  const out: Miss[] = [];
  // A hued element redefines the accent for its subtree, so each element is
  // compared with its own.
  const fillOf = (el: Element): Element | null => {
    for (let at: Element | null = el; at; at = at.parentElement) {
      const bg = parse(getComputedStyle(at).backgroundColor);
      if (bg.a === 0) continue;
      return at;
    }
    return null;
  };
  const accentFill = (at: Element) => {
    const s = getComputedStyle(at);
    const bg = s.backgroundColor;
    const accent = probe(s.getPropertyValue("--accent"));
    const hover = probe(s.getPropertyValue("--accent-hover") || "transparent");
    return parse(bg).a === 1 && (bg === accent || bg === hover);
  };
  const where = (el: Element) => {
    const demo = el.closest("[data-demo]")?.getAttribute("data-demo");
    const cls = [...el.classList].join(".") || el.tagName.toLowerCase();
    const owner = el.closest('[class*="glim-"]');
    const ownerCls = owner && owner !== el ? ` in ${[...owner.classList].join(".")}` : "";
    return `${demo ?? "page"}: ${el.tagName.toLowerCase()}.${cls}${ownerCls}`;
  };

  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("svg") && el.tagName !== "svg") continue;
    if (!shown(el)) continue;
    const fillEl = el.tagName === "svg" || ownText(el) ? fillOf(el) : null;
    if (fillEl && accentFill(fillEl)) {
      const fill = parse(getComputedStyle(fillEl).backgroundColor).rgb;
      if (el.tagName === "svg") {
        const shape = [...el.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline")].find(shown) ?? el;
        const s = getComputedStyle(shape);
        const paint = s.fill.startsWith("rgb") ? s.fill : s.stroke;
        if (!paint.startsWith("rgb")) continue;
        const r = ratio(parse(paint).rgb, fill);
        if (r < 3) out.push({ what: where(el), text: el.getAttribute("aria-label") ?? "glyph", ink: paint, fill: `rgb(${fill.join(", ")})`, ratio: r, needs: 3 });
      } else {
        const s = getComputedStyle(el);
        const size = parseFloat(s.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
        const needs = large ? 3 : 4.5;
        const r = ratio(parse(s.color).rgb, fill);
        if (r < needs) out.push({ what: where(el), text: (el.textContent ?? "").trim().slice(0, 40), ink: s.color, fill: `rgb(${fill.join(", ")})`, ratio: r, needs });
      }
    }
    // A knob or a mark drawn as a small fill of its own on the accent, such as a
    // switch's knob, is a graphic and needs 3:1.
    const own = parse(getComputedStyle(el).backgroundColor);
    const box = el.getBoundingClientRect();
    if (own.a === 1 && box.width <= 24 && box.height <= 24 && el.parentElement) {
      const under = fillOf(el.parentElement);
      if (under && accentFill(under) && !accentFill(el)) {
        const fill = parse(getComputedStyle(under).backgroundColor).rgb;
        const r = ratio(own.rgb, fill);
        if (r < 3) out.push({ what: where(el), text: "mark", ink: getComputedStyle(el).backgroundColor, fill: `rgb(${fill.join(", ")})`, ratio: r, needs: 3 });
      }
    }
  }
  return out;

  function ownText(el: Element) {
    return [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== "");
  }
}

async function walk(page: Page, path: string, show: Show | null, reset?: string) {
  const misses: string[] = [];
  await page.goto(`/#${path}?fw=${test.info().project.name}`);
  for (const theme of THEMES) {
    for (const accent of ACCENTS) {
      await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), { ...theme.look, accent });
      await page.reload();
      await page.locator("main h1").first().waitFor();
      if (reset) await page.addStyleTag({ content: reset });
      await page.evaluate(() => document.fonts.ready);
      if (show) await show(page);
      for (const m of await page.evaluate(measure))
        misses.push(`${theme.name} ${accent} ${m.what} "${m.text}" ${m.ink} on ${m.fill} = ${m.ratio.toFixed(2)}:1, needs ${m.needs}`);
    }
  }
  return [...new Set(misses)];
}

for (const [path, show] of Object.entries(PAGES)) {
  test.describe(path, () => {
    test.describe.configure({ timeout: 240_000 });

    test("text and glyphs on the accent read in every preset and theme", async ({ page }) => {
      expect(await walk(page, path, show)).toEqual([]);
    });

    test("an app's own reset of links and buttons leaves the ink on the accent", async ({ page }) => {
      expect(await walk(page, path, show, APP_RESET)).toEqual([]);
    });
  });
}
