import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of the input components: PinInput, TagsInput, FileUpload,
// DatePicker, Rating, AngleSlider and SignaturePad, each named after its
// contract row.

test.beforeEach(({}, info) => test.skip(!["react", "vue"].includes(info.project.name), "React and Vue only so far"));

test.describe("PinInput", () => {
  const box = (page: Page, n: number) => stage(page, "PinInputCode").getByRole("textbox", { name: `Character ${n} of 6`, exact: true });
  const status = (page: Page) => stage(page, "PinInputCode").locator("span.glim-num");

  test("[pin-names] each box is named by its place", async ({ page }) => {
    await open(page, "/components/pin-input");
    await expect(stage(page, "PinInputCode").getByRole("textbox")).toHaveCount(6);
    await expect(box(page, 1)).toBeVisible();
    await expect(box(page, 6)).toBeVisible();
  });

  test("[pin-type] typing fills a box and moves on, and the code completes", async ({ page }) => {
    await open(page, "/components/pin-input");
    await box(page, 1).click();
    await page.keyboard.type("4821");
    await expect(box(page, 5)).toBeFocused();
    await page.keyboard.type("37");
    await expect(status(page)).toHaveText("Checking 482137");
  });

  test("[pin-digits] a box set to digits refuses a letter", async ({ page }) => {
    await open(page, "/components/pin-input");
    await box(page, 1).click();
    await page.keyboard.type("a");
    await expect(box(page, 1)).toHaveValue("");
    await expect(box(page, 1)).toBeFocused();
  });

  test("[pin-backspace] Backspace empties a box and steps back", async ({ page }) => {
    await open(page, "/components/pin-input");
    await box(page, 1).click();
    await page.keyboard.type("12");
    await page.keyboard.press("Backspace");
    await expect(box(page, 2)).toHaveValue("");
    await page.keyboard.press("Backspace");
    await expect(box(page, 1)).toBeFocused();
    await expect(box(page, 1)).toHaveValue("");
  });

  test("[pin-arrows] the arrows move between the boxes", async ({ page }) => {
    await open(page, "/components/pin-input");
    await box(page, 1).click();
    await page.keyboard.type("123");
    await page.keyboard.press("ArrowLeft");
    await expect(box(page, 3)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(box(page, 2)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(box(page, 3)).toBeFocused();
  });

  test("[pin-paste] a pasted code fills every box", async ({ page }) => {
    await open(page, "/components/pin-input");
    await box(page, 1).focus();
    await box(page, 1).evaluate((el) => {
      const data = new DataTransfer();
      data.setData("text/plain", "905173");
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(box(page, 6)).toHaveValue("3");
    await expect(status(page)).toHaveText("Checking 905173");
  });

  test("[pin-ltr] the boxes run left to right in every language", async ({ page }) => {
    await open(page, "/components/pin-input");
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    const first = await box(page, 1).evaluate((el) => el.getBoundingClientRect().left);
    const last = await box(page, 6).evaluate((el) => el.getBoundingClientRect().left);
    expect(first).toBeLessThan(last);
  });
});

test.describe("TagsInput", () => {
  const field = (page: Page) => stage(page, "TagsInputLabels").getByRole("textbox", { name: "Labels", exact: true });
  const tags = (page: Page) => stage(page, "TagsInputLabels").locator(".glim-tag-text");
  const count = (page: Page) => stage(page, "TagsInputLabels").locator("span.glim-num");

  test("[tags-add] Enter or a comma adds what was typed as a tag", async ({ page }) => {
    await open(page, "/components/tags-input");
    await field(page).fill("daily");
    await page.keyboard.press("Enter");
    await expect(tags(page)).toHaveText(["photos", "weekly", "daily"]);
    await page.keyboard.type("offsite,");
    await expect(tags(page)).toHaveText(["photos", "weekly", "daily", "offsite"]);
    await expect(field(page)).toHaveValue("");
    await expect(count(page)).toHaveText("4 labels");
  });

  test("[tags-remove] a tag's remove mark takes it away", async ({ page }) => {
    await open(page, "/components/tags-input");
    await stage(page, "TagsInputLabels").getByRole("button", { name: "Remove photos" }).click();
    await expect(tags(page)).toHaveText(["weekly"]);
  });

  test("[tags-backspace] in an empty field Backspace picks the last tag, and again removes it", async ({ page }) => {
    await open(page, "/components/tags-input");
    await field(page).click();
    await page.keyboard.press("Backspace");
    await expect(stage(page, "TagsInputLabels").locator(".glim-tag[data-highlighted]")).toHaveText("weekly");
    await page.keyboard.press("Backspace");
    await expect(tags(page)).toHaveText(["photos"]);
  });

  test("[tags-arrows] the arrows walk the tags from the field", async ({ page }) => {
    await open(page, "/components/tags-input");
    await field(page).click();
    await page.keyboard.press("ArrowLeft");
    await expect(stage(page, "TagsInputLabels").locator(".glim-tag[data-highlighted]")).toHaveText("weekly");
    await page.keyboard.press("ArrowLeft");
    await expect(stage(page, "TagsInputLabels").locator(".glim-tag[data-highlighted]")).toHaveText("photos");
    await page.keyboard.press("Delete");
    await expect(tags(page)).toHaveText(["weekly"]);
  });

  test("[tags-paste] a pasted list becomes one tag per entry", async ({ page }) => {
    await open(page, "/components/tags-input");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => navigator.clipboard.writeText("music,videos"));
    await field(page).focus();
    await page.keyboard.press("ControlOrMeta+V");
    await expect(tags(page)).toHaveText(["photos", "weekly", "music", "videos"]);
  });

  test("[tags-ground] a tag stands one surface step above the field", async ({ page }) => {
    await open(page, "/components/tags-input");
    const ground = (sel: string) => stage(page, "TagsInputLabels").locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await ground(".glim-tag")).not.toBe(await ground(".glim-tags-control"));
    await field(page).click();
    expect(await ground(".glim-tag")).not.toBe(await ground(".glim-tags-control"));
  });
});
