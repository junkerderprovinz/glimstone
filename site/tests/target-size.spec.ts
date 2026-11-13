import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { open } from "./page";

// WCAG 2.2 success criterion 2.5.8, Target Size (Minimum): every target is at
// least 24 by 24 CSS pixels, or a 24 pixel circle on its centre touches no
// other target and no other such circle. Links in running text are exempt.

const pages = [...readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8").matchAll(/path: "(\/components\/[^"]+)"/g)].map((m) => m[1]!);

const TARGETS = [
  "button",
  "a[href]",
  "input:not([type=hidden])",
  "select",
  "textarea",
  "summary",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="option"]',
  '[role^="menuitem"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="radio"]',
  '[role="slider"]',
  '[role="treeitem"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

test("[target-size] every target is 24 by 24 pixels or has room around it", async ({ page }) => {
  test.setTimeout(pages.length * 8_000);
  const small: string[] = [];
  for (const path of pages) {
    await open(page, path);
    const found = await page.evaluate((selector) => {
      const MIN = 24;
      const shown = (el: Element) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.opacity !== "0" && !el.closest("[inert], [aria-hidden=true]");
      };
      // A link inside a sentence takes the sentence's line height, which the
      // criterion leaves alone.
      const inText = (el: Element) =>
        el.tagName === "A" && getComputedStyle(el).display === "inline" && (el.parentElement?.textContent?.trim().length ?? 0) > (el.textContent?.trim().length ?? 0);
      const targets = [...document.querySelectorAll("[data-demo] " + selector.split(",").join(", [data-demo] "))].filter(
        (el) => shown(el) && !inText(el) && !(el as HTMLButtonElement).disabled,
      );
      const boxes = targets.map((el) => ({ el, r: el.getBoundingClientRect() }));
      const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      const nested = (a: Element, b: Element) => a.contains(b) || b.contains(a);
      const name = (el: Element) => {
        const text = el.getAttribute("aria-label") ?? el.getAttribute("title") ?? el.textContent?.trim() ?? "";
        const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
        return `${role} "${text.slice(0, 40)}"`;
      };
      const out: string[] = [];
      for (const { el, r } of boxes) {
        if (r.width >= MIN - 0.5 && r.height >= MIN - 0.5) continue;
        const c = centre(r);
        const crowded = boxes.some(({ el: other, r: o }) => {
          if (other === el || nested(el, other)) return false;
          // The circle touches the other target's box.
          const dx = Math.max(o.left - c.x, 0, c.x - o.right);
          const dy = Math.max(o.top - c.y, 0, c.y - o.bottom);
          if (Math.hypot(dx, dy) < MIN / 2) return true;
          // Or the other target's own circle, where it is small too.
          if (o.width >= MIN && o.height >= MIN) return false;
          const oc = centre(o);
          return Math.hypot(oc.x - c.x, oc.y - c.y) < MIN;
        });
        if (crowded) out.push(`${el.closest("[data-demo]")!.getAttribute("data-demo")}: ${name(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return out;
    }, TARGETS);
    small.push(...found.map((f) => `${path} ${f}`));
  }
  expect(small).toEqual([]);
});
