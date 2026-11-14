import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of Pagination, Steps and Tour, each named after its contract row.

// The colour a custom property resolves to where the element stands.
const resolved = (el: import("@playwright/test").Locator, property: string) =>
  el.evaluate((node, p) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = `var(${p})`;
    node.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, property);

test.describe("Pagination", () => {
  const nav = (page: Page) => stage(page, "PaginationList").getByRole("navigation", { name: "Pages" });
  const pageButton = (page: Page, n: number) => nav(page).getByRole("button", { name: `Page ${n} of 20`, exact: true });
  const caption = (page: Page) => stage(page, "PaginationList").locator("span.glim-num");

  test("[pagination-nav] a navigation named by its label, the page in force marked current", async ({ page }) => {
    await open(page, "/components/pagination");
    await expect(pageButton(page, 1)).toHaveAttribute("aria-current", "page");
    await expect(pageButton(page, 20)).toBeVisible();
  });

  test("[pagination-press] a page or a step pressed takes the list there", async ({ page }) => {
    await open(page, "/components/pagination");
    await pageButton(page, 2).click();
    await expect(caption(page)).toHaveText("Backups 11 to 20 of 195");
    await nav(page).getByRole("button", { name: "Next page" }).click();
    await expect(pageButton(page, 3)).toHaveAttribute("aria-current", "page");
    await pageButton(page, 20).click();
    await expect(caption(page)).toHaveText("Backups 191 to 195 of 195");
  });

  test("[pagination-keys] Tab reaches each page and Enter takes it", async ({ page }) => {
    await open(page, "/components/pagination");
    await pageButton(page, 2).focus();
    await page.keyboard.press("Tab");
    await expect(pageButton(page, 3)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(pageButton(page, 3)).toHaveAttribute("aria-current", "page");
  });

  test("[pagination-ends] at the first or the last page the step that goes nowhere is disabled", async ({ page }) => {
    await open(page, "/components/pagination");
    await expect(nav(page).getByRole("button", { name: "Previous page" })).toBeDisabled();
    await pageButton(page, 20).click();
    await expect(nav(page).getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(nav(page).getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  test("[pagination-gaps] the first and the last page stay, with a gap for the pages between", async ({ page }) => {
    await open(page, "/components/pagination");
    await pageButton(page, 5).click();
    await pageButton(page, 6).click();
    await pageButton(page, 7).click();
    await expect(pageButton(page, 7)).toHaveAttribute("aria-current", "page");
    await expect(nav(page).locator(".glim-page-gap")).toHaveCount(2);
    await expect(pageButton(page, 1)).toBeVisible();
    await expect(pageButton(page, 20)).toBeVisible();
  });

  test("[pagination-accent] the page in force is filled with the accent", async ({ page }) => {
    await open(page, "/components/pagination");
    const fill = await pageButton(page, 1).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fill).toBe(await resolved(nav(page), "--accent"));
    const rest = await pageButton(page, 2).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rest).toBe(await resolved(nav(page), "--carbon-surface2"));
  });

  test("[pagination-languages] in Arabic every component reads right to left, and the app's own word wins", async ({ page }) => {
    // A right-to-left app sets the direction on the page, where the components read
    // it as they mount, so the page is drawn again once it is set.
    await open(page, "/components/pagination");
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    await page.evaluate(() => (location.hash = "#/components/steps?fw=" + new URLSearchParams(location.hash.split("?")[1]).get("fw")));
    await page.locator("main h1").first().waitFor();
    await page.goBack();
    await page.locator('[data-demo="PaginationArabic"]').first().waitFor();
    const demo = stage(page, "PaginationArabic");
    const nav = demo.getByRole("navigation", { name: "الصفحات" });
    await expect(nav.getByRole("button", { name: "الصفحة 1 من 20" })).toHaveAttribute("aria-current", "page");
    const back = await nav.getByRole("button", { name: "الصفحة السابقة" }).boundingBox();
    const next = await nav.getByRole("button", { name: "الصفحة التالية" }).boundingBox();
    expect(back!.x).toBeGreaterThan(next!.x);
    await expect(demo.getByRole("button", { name: "إزالة صور" })).toBeVisible();
    await expect(demo.getByRole("button", { name: "التالي", exact: true })).toBeVisible();
    const steps = demo.getByRole("tab");
    expect((await steps.nth(0).boundingBox())!.x).toBeGreaterThan((await steps.nth(2).boundingBox())!.x);
    await demo.getByRole("button", { name: "التالي", exact: true }).click();
    await demo.getByRole("button", { name: "التالي", exact: true }).click();
    await expect(demo.getByRole("button", { name: "حفظ" })).toBeVisible();
    const spill = await demo.evaluate((root) => [...root.querySelectorAll<HTMLElement>("*")].filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === "hidden").length);
    expect(spill).toBe(0);
  });

  test("[pagination-forced] in a contrast theme every page has an edge and the one in force the selection colours", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, "/components/pagination");
    const look = (n: number) => pageButton(page, n).evaluate((el) => ({ border: getComputedStyle(el).borderTopStyle, background: getComputedStyle(el).backgroundColor }));
    const highlight = await nav(page).evaluate((el) => {
      const probe = document.createElement("span");
      probe.style.cssText = "forced-color-adjust: none; background-color: Highlight";
      el.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect((await look(2)).border).toBe("solid");
    expect((await look(1)).background).toBe(highlight);
  });
});

test.describe("Steps", () => {
  const tab = (page: Page, name: string) => stage(page, "StepsStorage").getByRole("tab", { name, exact: true });
  const button = (page: Page, name: string) => stage(page, "StepsStorage").getByRole("button", { name, exact: true });
  const panel = (page: Page) => stage(page, "StepsStorage").getByRole("tabpanel");

  test("[steps-tabs] the row is a list of tabs, the step in force selected and current", async ({ page }) => {
    await open(page, "/components/steps");
    await expect(stage(page, "StepsStorage").getByRole("tablist")).toBeVisible();
    await expect(tab(page, "Kind")).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, "Kind")).toHaveAttribute("aria-current", "step");
    await expect(panel(page)).toHaveText("Pick where the backups go: a folder, a server or a cloud.");
  });

  test("[steps-next] Next and Back move a step, and Back is disabled on the first", async ({ page }) => {
    await open(page, "/components/steps");
    await expect(button(page, "Back")).toBeDisabled();
    await button(page, "Next").click();
    await expect(tab(page, "Address")).toHaveAttribute("aria-selected", "true");
    await button(page, "Back").click();
    await expect(tab(page, "Kind")).toHaveAttribute("aria-selected", "true");
  });

  test("[steps-finish] on the last step Next is Finish, which hands the task over", async ({ page }) => {
    await open(page, "/components/steps");
    await button(page, "Next").click();
    await button(page, "Next").click();
    await expect(button(page, "Next")).toHaveCount(0);
    await button(page, "Finish").click();
    await expect(stage(page, "StepsStorage").getByText("Storage location added")).toBeVisible();
  });

  test("[steps-done] a finished step carries a tick, the one in force the accent", async ({ page }) => {
    await open(page, "/components/steps");
    await button(page, "Next").click();
    const first = stage(page, "StepsStorage").locator(".glim-steps-indicator").first();
    await expect(first).toHaveAttribute("data-complete", "");
    await expect(first.locator("svg")).toHaveCount(1);
    const current = stage(page, "StepsStorage").locator(".glim-steps-indicator[data-current]");
    await expect(current).toHaveText("2");
  });

  test("[steps-arrows] the arrows, Home and End move the focus along the row, Enter goes there", async ({ page }) => {
    await open(page, "/components/steps");
    await tab(page, "Kind").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Address")).toBeFocused();
    await page.keyboard.press("End");
    await expect(tab(page, "Check")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Kind")).toBeFocused();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(tab(page, "Check")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tab(page, "Kind")).toBeFocused();
  });

  test("[steps-one-stop] the row is one stop for Tab, on the step in force", async ({ page }) => {
    await open(page, "/components/steps");
    await button(page, "Next").click();
    const stops = await stage(page, "StepsStorage").getByRole("tab").evaluateAll((tabs) => tabs.map((t) => t.getAttribute("tabindex")));
    expect(stops).toEqual(["-1", "0", "-1"]);
  });
});

test.describe("Tour", () => {
  const start = (page: Page) => stage(page, "TourFirstStart").getByRole("button", { name: "Start the tour" });
  const step = (page: Page) => page.getByRole("dialog");

  async function begin(page: Page) {
    await open(page, "/components/tour");
    await start(page).click();
    await expect(step(page)).toBeVisible();
  }

  test("[tour-dialog] a step is a dialog named by its title and described by its text", async ({ page }) => {
    await begin(page);
    await expect(step(page)).toHaveAccessibleName("Add a backup");
    await expect(step(page)).toHaveAccessibleDescription(/Everything starts here/);
    await expect(step(page).locator(".glim-tour-progress")).toHaveText("1 of 3");
  });

  test("[tour-next] Next and Back walk the steps, and the last one closes the tour", async ({ page }) => {
    await begin(page);
    await step(page).getByRole("button", { name: "Next" }).click();
    await expect(step(page)).toHaveAccessibleName("Find a file");
    await step(page).getByRole("button", { name: "Back" }).click();
    await expect(step(page)).toHaveAccessibleName("Add a backup");
    await step(page).getByRole("button", { name: "Next" }).click();
    await step(page).getByRole("button", { name: "Next" }).click();
    await expect(step(page)).toHaveAccessibleName("That is all");
    await step(page).getByRole("button", { name: "Close" }).click();
    await expect(step(page)).toHaveCount(0);
  });

  test("[tour-escape] Escape ends the tour and gives the focus back", async ({ page }) => {
    await begin(page);
    await page.keyboard.press("Escape");
    await expect(step(page)).toHaveCount(0);
    await expect(start(page)).toBeFocused();
  });

  test("[tour-spotlight] the part a step points at stays clear and takes the accent's ring", async ({ page }) => {
    await begin(page);
    const spot = page.locator(".glim-tour-spotlight");
    await expect(spot).toBeVisible();
    const target = await stage(page, "TourFirstStart").getByText("Add", { exact: true }).boundingBox();
    const box = await spot.boundingBox();
    expect(Math.abs(box!.x - target!.x)).toBeLessThan(12);
    await expect(page.locator(".glim-tour-backdrop")).toBeVisible();
  });
});
