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
