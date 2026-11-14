import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of Pagination, Steps and Tour, each named after its contract row.

test.beforeEach(({}, info) => test.skip(!["react", "vue"].includes(info.project.name), "React and Vue only so far"));

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
});
