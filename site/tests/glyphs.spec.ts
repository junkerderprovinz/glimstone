import { expect, test } from "@playwright/test";
import glyphs from "../../packages/core/glyphs.json" with { type: "json" };

// glyphs.md, rule 2: the ink written beside a glyph is what the browser
// measures, so a redrawn path that changes its size shows up here.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

test("the ink recorded for the drawn device glyphs is what the browser measures", async ({ page }) => {
  await page.goto("/");
  for (const name of ["IconServer", "IconLaptop"]) {
    const g = glyphs.find((x) => x.name === name)!;
    const box = await page.evaluate((svg) => {
      const host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      host.innerHTML = svg;
      document.body.append(host);
      const b = (host.firstElementChild as SVGGraphicsElement).getBBox();
      host.remove();
      return [b.x, b.y, b.width, b.height];
    }, g.svg);
    box.forEach((v, i) => expect(v, `${name} ink ${i}`).toBeCloseTo(g.ink[i], 2));
  }
});
