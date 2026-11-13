import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

const grid = (page: Page) => stage(page, "ListTableBackups").getByRole("grid", { name: "Backups" });
const rows = (page: Page) => grid(page).locator("tbody tr");
const names = (page: Page) => rows(page).locator("td:first-child").allTextContents();
const out = (page: Page) => stage(page, "ListTableBackups").locator("output");
const header = (page: Page, name: string) => grid(page).getByRole("columnheader", { name });
const mod = process.platform === "darwin" ? "Meta" : "Control";

test.describe("ListTable", () => {
  test("[list-grid] a grid of rows that can be picked, named by its label", async ({ page }) => {
    await open(page, "/components/list-table");
    await expect(grid(page)).toHaveAttribute("aria-multiselectable", "true");
    await expect(grid(page).getByRole("columnheader")).toHaveCount(4);
    await expect(rows(page)).toHaveCount(5);
    expect(Math.round((await rows(page).first().boundingBox())!.height)).toBe(42);
  });

  test("[list-sort] a click on a heading sorts, the next turns it around, and only that column says so", async ({ page }) => {
    await open(page, "/components/list-table");
    await header(page, "Name").getByRole("button", { name: "Name" }).click();
    await expect(header(page, "Name")).toHaveAttribute("aria-sort", "ascending");
    expect(await names(page)).toEqual(["adguard", "immich", "nextcloud", "vaultwarden", "Windows 11"]);
    await header(page, "Name").getByRole("button", { name: "Name" }).click();
    await expect(header(page, "Name")).toHaveAttribute("aria-sort", "descending");
    expect((await names(page))[0]).toBe("Windows 11");
    await header(page, "Size").getByRole("button", { name: "Size" }).click();
    expect(await names(page)).toEqual(["vaultwarden", "adguard", "nextcloud", "Windows 11", "immich"]);
    await expect(header(page, "Name")).not.toHaveAttribute("aria-sort");
  });

  test("[list-filter] the ▾ filters by the column's values and stays marked", async ({ page }) => {
    await open(page, "/components/list-table");
    const filter = grid(page).getByRole("button", { name: "Filter State" });
    await filter.click();
    const values = page.getByRole("dialog", { name: "Filter State" });
    await expect(values.getByRole("checkbox")).toHaveText(["Failed", "Running", "Settled"]);
    await values.getByRole("checkbox", { name: "Failed" }).click();
    expect(await names(page)).toEqual(["Windows 11"]);
    await page.keyboard.press("Escape");
    await expect(values).toHaveCount(0);
    await expect(filter).toHaveAttribute("aria-pressed", "true");
  });

  test("[list-search] typing in the list floats a search, Escape takes it away", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).first().locator("td").first().click();
    await page.keyboard.type("imm");
    const search = stage(page, "ListTableBackups").getByRole("searchbox", { name: "Search backups" });
    await expect(search).toHaveValue("imm");
    expect(await names(page)).toEqual(["immich"]);
    await page.keyboard.press("Escape");
    await expect(search).toHaveCount(0);
    await expect(rows(page)).toHaveCount(5);
    await expect(rows(page).first().locator("td").first()).toBeFocused();
    await page.keyboard.press(`${mod}+f`);
    await expect(search).toBeFocused();
  });

  test("[list-empty] a search that finds nothing says so", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).first().locator("td").first().click();
    await page.keyboard.type("zzz");
    await expect(stage(page, "ListTableBackups").getByText("No backup matches")).toBeVisible();
  });

  test("[list-select-click] a click picks a row alone, Ctrl adds one, Shift takes the range", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).nth(0).click();
    await rows(page).nth(2).click({ modifiers: [mod] });
    await expect(out(page)).toHaveText("2 picked");
    await rows(page).nth(4).click({ modifiers: ["Shift"] });
    await expect(out(page)).toHaveText("3 picked");
    for (const i of [2, 3, 4]) await expect(rows(page).nth(i)).toHaveAttribute("aria-selected", "true");
    await rows(page).nth(1).click();
    await expect(out(page)).toHaveText("1 picked");
    expect(await rows(page).nth(1).evaluate((r) => getComputedStyle(r.firstElementChild!).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("[list-keys] the arrows move, Shift extends, Space picks, Ctrl+A takes all", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).nth(0).click();
    await page.keyboard.press("ArrowDown");
    await expect(rows(page).nth(1).locator("td").first()).toBeFocused();
    await page.keyboard.press("Shift+ArrowDown");
    await expect(out(page)).toHaveText("3 picked");
    await page.keyboard.press(" ");
    await expect(out(page)).toHaveText("2 picked");
    await page.keyboard.press(`${mod}+a`);
    await expect(out(page)).toHaveText("5 picked");
  });

  test("[list-page] PageDown and PageUp move the focus a page of rows", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).nth(0).click();
    await page.keyboard.press("PageDown");
    await expect(rows(page).nth(4).locator("td").first()).toBeFocused();
    await page.keyboard.press("PageUp");
    await expect(rows(page).nth(0).locator("td").first()).toBeFocused();
  });

  test("[list-open] Enter or a double click opens the row", async ({ page }) => {
    await open(page, "/components/list-table");
    await rows(page).nth(1).click();
    await page.keyboard.press("Enter");
    await expect(out(page)).toContainText("opened immich");
    await rows(page).nth(3).dblclick();
    await expect(out(page)).toContainText("opened Windows 11");
  });

  test("[list-hint] the line under the header shows while the pointer is on it", async ({ page }) => {
    await open(page, "/components/list-table");
    const hint = stage(page, "ListTableBackups").getByText("Click a heading to sort");
    await expect(hint).toBeHidden();
    await header(page, "Kind").hover();
    await expect(hint).toBeVisible();
    await expect(grid(page)).toHaveAccessibleDescription(/Click a heading to sort/);
  });
});
