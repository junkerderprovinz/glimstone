import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";

// The motion engine's default: a page without data-motion moves exactly like
// one set to subtle, for every number a level sets. It does not depend on a
// framework, so only one project per browser runs it.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

const source = new URL("../../packages/core/tokens/", import.meta.url);
const names = readdirSync(source)
  .map((f) => JSON.parse(readFileSync(new URL(f, source), "utf8")))
  .flatMap((doc) => Object.values<Record<string, { $extensions?: Record<string, { modes?: Record<string, unknown> }> }>>(doc))
  .flatMap((group) => Object.entries(group).filter(([name, t]) => !name.startsWith("$") && t.$extensions?.["org.glimstone"]?.modes && ["wild", "off", "storm"].some((m) => m in t.$extensions!["org.glimstone"]!.modes!)))
  .map(([name]) => `--${name}`);

test("a page without data-motion reads every motion number as subtle", async ({ page }) => {
  expect(names.length).toBeGreaterThan(50);
  await page.goto("/#/engines/motion?fw=react");
  await page.locator("main h1").first().waitFor();
  const read = (level: string | null) =>
    page.evaluate(
      ({ level, names }) => {
        const root = document.documentElement;
        if (level) root.setAttribute("data-motion", level);
        else root.removeAttribute("data-motion");
        const style = getComputedStyle(root);
        return Object.fromEntries(names.map((n) => [n, style.getPropertyValue(n).trim()]));
      },
      { level, names },
    );
  const subtle = await read("subtle");
  const none = await read(null);
  expect(none).toEqual(subtle);
  // The check means something only if another level reads differently.
  expect(await read("wild")).not.toEqual(subtle);
});
