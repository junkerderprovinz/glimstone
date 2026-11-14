import { expect, test, type Page } from "@playwright/test";
import { open } from "./page";

// Every block in the framework the project runs, which ?fw= picks.
const framework = () => test.info().project.metadata.fw;
const block = (page: Page, name: string) => page.locator(`[data-demo="${name}"][data-framework="${framework()}"]`);

const PARTS: Record<string, string[]> = {
  SignInPage: ["SignInCard"],
  SettingsPage: ["Selector", "Card", "FieldRow", "Toggle"],
  ListPage: ["ListRow", "Pill", "TextField"],
  InfoPage: ["InfoTile", "InfoVersionCard", "InfoHelpCard", "InfoAboutCard"],
  UploadArea: ["Card", "ListRow"],
  ConfirmFlow: ["ListRow", "IconButton"],
};

test.beforeEach(async ({ page }) => {
  await open(page, "/blocks");
});

for (const [name, parts] of Object.entries(PARTS)) {
  test(`${name} renders its components`, async ({ page }) => {
    for (const part of parts) await expect(block(page, name).locator(`[data-glim="${part}"]`).first(), part).toBeVisible();
  });
}

test("every block's framework selector carries each framework's mark", async ({ page }) => {
  for (const name of Object.keys(PARTS)) {
    const segments = page.locator(`[data-block="${name}"]`).getByRole("radiogroup", { name: "Framework" }).getByRole("radio");
    await expect(segments).toHaveCount(4);
    for (const segment of await segments.all()) await expect(segment.locator(".fw-mark svg")).toHaveCount(1);
  }
});

test("every block shows its own source for copying", async ({ page }) => {
  for (const name of Object.keys(PARTS)) {
    const demo = page.locator(`[data-block="${name}"]`);
    await demo.getByRole("radio", { name: "Code" }).click();
    await expect(demo.locator("pre code")).toContainText(`@glimstone/${framework()}`);
  }
});

test("the list page filters to an empty state and back", async ({ page }) => {
  const list = block(page, "ListPage");
  await expect(list.locator('[data-glim="ListRow"]')).toHaveCount(3);
  await list.getByRole("textbox", { name: "Filter" }).fill("zzz");
  await expect(list.getByText("No backups match the filter")).toBeVisible();
  await list.getByRole("button", { name: "Clear the filter" }).click();
  await expect(list.locator('[data-glim="ListRow"]')).toHaveCount(3);
});

test("the settings page switches its cards with the tiles", async ({ page }) => {
  const settings = block(page, "SettingsPage");
  await settings.getByRole("tab", { name: "Notifications" }).or(settings.getByRole("radio", { name: "Notifications" })).click();
  await expect(settings.getByText("A summary every week")).toBeVisible();
});

test("the confirm flow asks, deletes and takes it back from the toast", async ({ page }) => {
  const flow = block(page, "ConfirmFlow");
  await flow.getByRole("button", { name: "Delete the snapshot from 21 October" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete snapshot" });
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(flow.locator('[data-glim="ListRow"]')).toHaveCount(2);
  await page.locator(".glim-toast").getByRole("button", { name: "Undo" }).click();
  await expect(flow.locator('[data-glim="ListRow"]')).toHaveCount(3);
  await expect(flow.locator('[data-glim="ListRow"]').nth(1)).toHaveAttribute("aria-label", "21 October");
});
