import { expect, test, type Page } from "@playwright/test";
import { STORAGE_PROVIDERS } from "../../packages/core/src/storageProviders.ts";
import { open, stage } from "./page";

// Scoped by the component's own attribute: in Firefox, evaluateAll under a
// dialog found by its name can take the page down.
const picker = (page: Page) => page.locator('[data-glim="PickerWindow"]');
const search = (page: Page) => picker(page).getByRole("searchbox", { name: "Search providers" });
const names = (page: Page) =>
  picker(page)
    .locator(".glim-provider-pick button.glim-readme-btn")
    .evaluateAll((all) => all.map((b) => b.getAttribute("aria-label")));

async function show(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowStorage").getByRole("button", { name: "Add storage" }).click();
  await expect(search(page)).toBeFocused();
}

test.describe("A catalog in a PickerWindow", () => {
  test("[catalog-groups] every provider stands in its group, the groups in the catalog's order, each alphabetical", async ({ page }) => {
    await show(page);
    const sections = await picker(page)
      .locator(".glim-pick-section")
      .evaluateAll((all) =>
        all.map((s) => ({
          title: s.querySelector(".glim-eyebrow")?.textContent,
          count: s.querySelectorAll("button.glim-readme-btn").length,
          names: [...s.querySelectorAll("button.glim-readme-btn")].map((b) => b.getAttribute("aria-label") ?? ""),
        })),
      );
    const count = (group: string) => STORAGE_PROVIDERS.entries.filter((e) => e.group === group).length;
    expect(sections.map(({ title, count }) => ({ title, count }))).toEqual([
      { title: "Clouds", count: count("cloud") },
      { title: "Object storage", count: count("storage") },
      { title: "Servers and shares", count: count("protocol") },
      { title: "On another target", count: count("layered") },
    ]);
    for (const { names } of sections) {
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    }
  });

  test("[catalog-marks] every tile carries a mark, a brand's lit in its colour and a glyph's in the accent", async ({ page }) => {
    await show(page);
    const tiles = picker(page).locator(".glim-provider-pick button.glim-readme-btn");
    await expect(tiles).toHaveCount(STORAGE_PROVIDERS.entries.length);
    await expect(picker(page).locator(".glim-provider-pick button.glim-readme-btn .glim-readme-btn-mark svg")).toHaveCount(
      STORAGE_PROVIDERS.entries.length,
    );
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.scrollIntoViewIfNeeded();
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("Backblaze B2")).toBe("rgb(226, 30, 41)");
    expect(await fill("OpenCloud")).toBe("rgb(32, 67, 79)");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--accent)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(await fill("WebDAV")).toBe(accent);
  });

  test("[catalog-search] the search finds providers by their own words across groups, and a kind stands as the second line", async ({ page }) => {
    await show(page);
    await search(page).fill("webdav");
    await expect.poll(() => names(page)).toEqual(["Nextcloud", "OpenCloud", "ownCloud", "OxiCloud", "WebDAV"]);
    await search(page).fill("windows");
    await expect.poll(() => names(page)).toEqual(["SMB Windows share"]);
  });

  test("[catalog-pick] a pick closes the window and hands back the provider's id", async ({ page }) => {
    await show(page);
    await search(page).fill("garage");
    await search(page).press("Enter");
    await expect(picker(page)).toHaveCount(0);
    await expect(stage(page, "PickerWindowStorage").locator("output")).toHaveText("Picked: Garage");
  });
});
