import { expect, test, type Page } from "@playwright/test";
import { open } from "./page";

// The frame around every docs page: the header with its sections, the nav and
// the change from one page to the next. None of it depends on a framework.
test.beforeEach(({}, info) => test.skip(info.project.metadata.fw !== "react", "framework-free"));

const nav = (page: Page) => page.getByRole("navigation", { name: "Docs" });
const headerHeight = (page: Page) => page.locator(".site-header").evaluate((h) => h.getBoundingClientRect().height);

test("the docs nav stays under the header while the page scrolls and scrolls in itself to its last entry", async ({ page }) => {
  await open(page, "/components/toggle");
  expect(await nav(page).evaluate((n) => getComputedStyle(n).position)).toBe("sticky");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const top = await headerHeight(page);
  await expect.poll(async () => (await nav(page).boundingBox())!.y).toBeCloseTo(top, 0);
  const last = nav(page).locator(".nav-link").last();
  await expect(last).not.toBeInViewport({ ratio: 1 });
  await nav(page).hover();
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 4000);
  await expect(last).toBeInViewport({ ratio: 1 });
  expect((await nav(page).boundingBox())!.y).toBeCloseTo(top, 0);
});

test("a click in the nav shows the next page within half a second, and the frames keep coming afterwards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Counts the page changes that run as a view transition, so the test knows
  // it timed one and not a plain swap.
  await page.addInitScript(() => {
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    const w = window as unknown as { transitions: number };
    w.transitions = 0;
    document.startViewTransition = ((update: ViewTransitionUpdateCallback) => {
      w.transitions++;
      return start(update);
    }) as typeof document.startViewTransition;
  });
  await open(page, "/components/toggle", { motion: "subtle" });
  const titles = ["Badge", "Card", "Kbd", "Toggle"];
  for (const title of titles) {
    // From the click to the first frame drawn with the new page in place.
    const took = await nav(page).evaluate(
      (list, t) =>
        new Promise<number>((done) => {
          const link = [...list.querySelectorAll<HTMLAnchorElement>(".nav-link")].find((a) => a.textContent === t)!;
          const start = performance.now();
          const look = () => {
            if (document.querySelector("main h1")?.textContent === t) done(performance.now() - start);
            else requestAnimationFrame(look);
          };
          link.click();
          requestAnimationFrame(look);
        }),
      title,
    );
    expect(took, title).toBeLessThan(500);
    const frames = await page.evaluate(
      () =>
        new Promise<number>((done) => {
          let count = 0;
          const start = performance.now();
          const tick = (now: number) => {
            count++;
            if (now - start < 1000) requestAnimationFrame(tick);
            else done(count);
          };
          requestAnimationFrame(tick);
        }),
    );
    expect(frames, title).toBeGreaterThan(20);
  }
  expect(await page.evaluate(() => (window as unknown as { transitions: number }).transitions)).toBe(titles.length);
});

test("the highlight under the current nav entry glides to the entry clicked", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/components/badge", { motion: "subtle" });
  const mark = nav(page).locator(".nav-mark");
  const sits = async (title: string) => {
    const m = (await mark.boundingBox())!;
    const link = (await nav(page).getByRole("link", { name: title, exact: true }).boundingBox())!;
    return Math.abs(m.y - link.y) < 1 && Math.abs(m.height - link.height) < 1;
  };
  expect(await sits("Badge")).toBe(true);
  await nav(page).getByRole("link", { name: "Card", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("Card");
  await expect.poll(() => sits("Card")).toBe(true);
});

test("the header's sections lead into the docs and light up while one of their pages is open", async ({ page }) => {
  await open(page, "/");
  const sections = page.getByRole("navigation", { name: "Sections" });
  await expect(sections.getByRole("link")).toHaveText(["Docs", "Blocks", "Engines", "Components"]);
  await expect(sections.locator('[aria-current="page"]')).toHaveCount(0);
  await sections.getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/#\/introduction$/);
  await expect(page.locator("main h1")).toHaveText("Introduction");
  await expect(sections.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
  await sections.getByRole("link", { name: "Components" }).click();
  await expect(page.locator("main h1")).toHaveText("Accordion");
  await expect(sections.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
});

test("under 52rem the header drops its sections and the search shrinks to its glyph", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await open(page, "/components/toggle");
  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  const search = page.locator(".site-header .search-trigger");
  expect((await search.boundingBox())!.width).toBeLessThan(100);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(800);
});

test("the four framework previews of a demo stand two by two", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  // Without a framework named in the address the demo shows all of them.
  await page.goto("/#/components/button");
  await page.locator("main h1").waitFor();
  const cells = page.locator(".demo-pair").first().locator(":scope > .demo-cell");
  await expect(cells.nth(3)).toBeAttached();
  const boxes = await cells.evaluateAll((all) => all.slice(0, 4).map((c) => c.getBoundingClientRect().toJSON() as DOMRect));
  expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBe(2);
  expect(new Set(boxes.map((b) => Math.round(b.left))).size).toBe(2);
});
