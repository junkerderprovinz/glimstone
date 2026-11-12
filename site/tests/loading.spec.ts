import { expect, test, type Locator, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

const visibility = (el: Locator) => el.evaluate((e) => getComputedStyle(e).visibility);
const spin = (el: Locator) => el.evaluate((e) => {
  const s = getComputedStyle(e);
  return { name: s.animationName, dur: parseFloat(s.animationDuration), transform: s.transform };
});

test.describe("BusyRing", () => {
  const sizes = (page: Page) => stage(page, "BusyRingSizes");
  const ring = (page: Page) => sizes(page).getByRole("status").filter({ hasText: "Loading backups" });
  const arcs = (page: Page) => ({
    outer: ring(page).locator(".glim-busy-ring-arc").first(),
    inner: ring(page).locator(".glim-busy-ring-arc--inner"),
  });

  test("[busy-ring-arcs] two arcs turn against each other, slower at subtle", async ({ page }) => {
    await open(page, "/components/busy-ring");
    await relook(page, { motion: "wild" });
    const wild = { outer: await spin(arcs(page).outer), inner: await spin(arcs(page).inner) };
    expect(wild.outer.name).toBe("glim-busy-cw");
    expect(wild.inner.name).toBe("glim-busy-ccw");
    expect(wild.inner.dur).toBe(wild.outer.dur);
    await relook(page, { motion: "subtle" });
    expect((await spin(arcs(page).outer)).dur).toBeGreaterThan(wild.outer.dur);
  });

  test("[busy-ring-still] nothing turns at off or under reduced motion", async ({ page }) => {
    await open(page, "/components/busy-ring");
    await relook(page, { motion: "off" });
    for (const arc of Object.values(arcs(page))) expect((await spin(arc)).name).toBe("none");
    expect((await spin(arcs(page).inner)).transform).not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await relook(page, { motion: "wild" });
    for (const arc of Object.values(arcs(page))) expect((await spin(arc)).name).toBe("none");
  });

  test("[busy-ring-delay] it waits 400 ms before it shows, and delay 0 shows it at once", async ({ page }) => {
    await open(page, "/components/busy-ring");
    expect(await visibility(ring(page))).toBe("visible");
    await sizes(page).getByRole("button", { name: "Wait" }).click();
    const late = sizes(page).locator(".glim-busy-ring").last();
    expect(await visibility(late)).toBe("hidden");
    await expect.poll(() => visibility(late), { timeout: 1000 }).toBe("visible");
  });

  test("[busy-ring-label] with a label it is a status, without one it is hidden", async ({ page }) => {
    await open(page, "/components/busy-ring");
    await expect(ring(page)).toHaveCount(1);
    await expect(sizes(page).locator(".glim-busy-ring--small").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("[busy-ring-ink] the accent on a card, the button's ink in a button", async ({ page }) => {
    await open(page, "/components/busy-ring");
    const colour = (el: Locator) => el.evaluate((e) => getComputedStyle(e).color);
    const accent = await sizes(page).evaluate((e) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--accent-glyph)";
      e.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    expect(await colour(ring(page))).toBe(accent);
    const button = sizes(page).getByRole("button", { name: "Saving" });
    expect(await colour(button.locator(".glim-busy-ring"))).toBe(await colour(button));
  });
});

test.describe("Button", () => {
  test("[button-busy-ring] busy puts the turning ring in the glyph's place at once", async ({ page }) => {
    await open(page, "/components/busy-ring", { motion: "wild" });
    const button = stage(page, "BusyRingSizes").getByRole("button", { name: "Saving" });
    const ring = button.locator(".glim-btn-glyph > .glim-busy-ring");
    expect(await visibility(ring)).toBe("visible");
    expect((await spin(ring.locator(".glim-busy-ring-arc").first())).name).toBe("glim-busy-cw");
  });
});

test.describe("SkeletonRow", () => {
  const list = (page: Page) => stage(page, "SkeletonRowList").getByRole("group", { name: "Backups" });
  const rows = (page: Page) => list(page).locator(".glim-skeleton-row");
  const band = (el: Locator) => el.evaluate((e) => {
    const s = getComputedStyle(e);
    return { name: s.animationName, image: s.backgroundImage };
  });

  test("[skeleton-box] a ListRow's height, hidden from assistive technology", async ({ page }) => {
    await open(page, "/components/skeleton-row");
    await expect(list(page)).toHaveAttribute("aria-busy", "true");
    await expect(rows(page)).toHaveCount(3);
    for (const row of await rows(page).all()) {
      await expect(row).toHaveAttribute("aria-hidden", "true");
      expect(Math.round((await row.boundingBox())!.height)).toBe(42);
    }
  });

  test("[skeleton-light] one light band crosses the rows", async ({ page }) => {
    await open(page, "/components/skeleton-row", { motion: "wild" });
    expect((await band(rows(page).first().locator(".glim-skeleton-name"))).name).toBe("glim-skeleton-sweep");
  });

  test("[skeleton-light-theme] in the light theme the band is a white glow", async ({ page }) => {
    await open(page, "/components/skeleton-row", { motion: "wild", theme: "light" });
    expect((await band(rows(page).first().locator(".glim-skeleton-name"))).image).toMatch(/rgba\(255, 255, 255, 0\.9\d*\)|color\(srgb 1 1 1 \/ 0\.9\d*\)/);
  });

  test("[skeleton-still] no light crosses at off or under reduced motion", async ({ page }) => {
    await open(page, "/components/skeleton-row");
    await relook(page, { motion: "off" });
    expect((await band(rows(page).first().locator(".glim-skeleton-name"))).name).toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await relook(page, { motion: "wild" });
    expect((await band(rows(page).first().locator(".glim-skeleton-name"))).name).toBe("none");
  });

  test("[skeleton-delay] the rows wait 400 ms before they show", async ({ page }) => {
    await open(page, "/components/skeleton-row");
    await stage(page, "SkeletonRowList").getByRole("button", { name: "Load again" }).click();
    expect(await visibility(rows(page).first())).toBe("hidden");
    await expect.poll(() => visibility(rows(page).first()), { timeout: 1000 }).toBe("visible");
  });
});
