import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// An app that moves from React to Vue keeps its look only if every component
// draws the same elements with the same classes, attributes and inline
// styles. Each demo page shows both twins side by side, so their trees are
// compared there, with what each framework writes its own way taken out: the
// generated ids, the value React mirrors into a controlled field's attribute,
// an empty class, and where text nodes split. A selector strip takes its
// colour from its place among the page's strips, so a twin standing beside
// another is one place further on and its strip colour is left out too.

const pages = [...readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8").matchAll(/path: "(\/components\/[^"]+)"/g)].map((m) => m[1]!);

test("[twins-markup] every demo draws the same markup in React and Vue", async ({ page }, info) => {
  test.skip(info.project.name !== "react", "One run compares both");
  test.setTimeout(pages.length * 6_000);
  const differ: string[] = [];
  for (const path of pages) {
    await page.goto(`/#${path}`);
    await page.locator("main h1").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    differ.push(
      ...(await page.evaluate((path) => {
        const ids = /_r_[0-9a-z]+_|«r[0-9a-z]+»|:r[0-9a-z]+:|\bv[0-9a-zA-Z]+-\d+\b/g;
        const dropped = /^(id|for|name|value|aria-labelledby|aria-describedby|aria-controls|aria-activedescendant|data-uid|data-controls)$/;
        const shape = (el: Element, depth: number): string[] => {
          const attrs = [...el.attributes]
            .filter((a) => !dropped.test(a.name) && !a.name.startsWith("data-v-") && !(a.name === "class" && a.value.trim() === ""))
            .map((a) => {
              if (a.name === "class") return `class=${[...el.classList].sort().join(".")}`;
              if (a.name === "style") {
                const style = (el as HTMLElement).style;
                const strip = el.getAttribute("data-glim") === "Selector";
                const props = [...style].filter((p) => !(strip && p.startsWith("--item-hue"))).sort();
                return `style=${props.map((p) => `${p}:${style.getPropertyValue(p)}`).join(";")}`;
              }
              // React writes a true data attribute as "true", Vue as a bare attribute.
              const value = a.name.startsWith("data-") && a.value === "true" ? "" : a.value;
              return `${a.name}=${value.replace(ids, "ID")}`;
            })
            .sort();
          const text = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("").replace(/\s+/g, "");
          return [`${"  ".repeat(depth)}<${el.tagName.toLowerCase()} ${attrs.join(" ")}>${text}`, ...[...el.children].flatMap((c) => shape(c, depth + 1))];
        };
        const out: string[] = [];
        for (const react of document.querySelectorAll('[data-framework="react"]')) {
          const demo = react.getAttribute("data-demo")!;
          // The Vue demo is mounted inside an island of its own.
          const island = document.querySelector(`[data-framework="vue"][data-demo="${demo}"]`)?.firstElementChild;
          if (!island) continue;
          const a = [...react.children].flatMap((c) => shape(c, 0));
          const b = [...island.children].flatMap((c) => shape(c, 0));
          const at = a.findIndex((line, i) => line !== b[i]);
          if (at >= 0 || a.length !== b.length) {
            const i = at >= 0 ? at : Math.min(a.length, b.length);
            out.push(`${path} ${demo}:\n  React ${a[i]?.trim() ?? "nothing"}\n  Vue   ${b[i]?.trim() ?? "nothing"}`);
          }
        }
        return out;
      }, path)),
    );
  }
  expect(differ).toEqual([]);
});
