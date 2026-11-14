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

test.describe("FileUpload", () => {
  const zone = (page: Page) => stage(page, "FileUploadImport").getByRole("button", { name: "Drop files here or choose them" });
  const picker = (page: Page) => stage(page, "FileUploadImport").locator('input[type="file"]');
  const settings = { name: "settings.json", mimeType: "application/json", buffer: Buffer.from('{"theme":"dark"}') };

  test("[upload-button] the drop zone is one button that opens the picker", async ({ page }) => {
    await open(page, "/components/file-upload");
    await zone(page).focus();
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Enter");
    await (await chooser).setFiles(settings);
    await expect(stage(page, "FileUploadImport").getByText("Ready to import settings.json")).toBeVisible();
  });

  test("[upload-list] a chosen file stands under the zone with its size and a remove button", async ({ page }) => {
    await open(page, "/components/file-upload");
    await picker(page).setInputFiles(settings);
    const row = stage(page, "FileUploadImport").locator(".glim-upload-file");
    await expect(row.locator(".glim-upload-name")).toHaveText("settings.json");
    await expect(row.locator(".glim-upload-size")).toHaveText("16 byte");
    await stage(page, "FileUploadImport").getByRole("button", { name: "Remove settings.json" }).click();
    await expect(row).toHaveCount(0);
    await expect(stage(page, "FileUploadImport").getByText("Nothing chosen yet")).toBeVisible();
  });

  test("[upload-refused] a file of another kind is refused and named with the reason", async ({ page }) => {
    await open(page, "/components/file-upload");
    await picker(page).setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("png") });
    await expect(stage(page, "FileUploadImport").locator(".glim-field-error")).toHaveText("photo.png is not a kind of file this takes");
    await expect(stage(page, "FileUploadImport").locator(".glim-upload-file")).toHaveCount(0);
  });

  test("[upload-drag] while files are held over the zone it takes the accent's wash", async ({ page }) => {
    await open(page, "/components/file-upload");
    const data = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['{"theme":"light"}'], "dropped.json", { type: "application/json" }));
      return dt;
    });
    const rest = await zone(page).evaluate((el) => getComputedStyle(el).backgroundColor);
    await zone(page).dispatchEvent("dragenter", { dataTransfer: data });
    await zone(page).dispatchEvent("dragover", { dataTransfer: data });
    await expect(zone(page)).toHaveAttribute("data-dragging", "");
    expect(await zone(page).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(rest);
    await zone(page).dispatchEvent("dragleave", { dataTransfer: data });
    await expect(zone(page)).not.toHaveAttribute("data-dragging", "");
  });
});

test.describe("DatePicker", () => {
  const trigger = (page: Page) => stage(page, "DatePickerKeep").locator(".glim-date-trigger");
  const panel = (page: Page) => page.locator(".glim-date-panel");
  const focusedDay = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute("data-value"));
  const caption = (page: Page) => stage(page, "DatePickerKeep").getByText(/^Kept /);

  async function openIt(page: Page) {
    await open(page, "/components/date-picker");
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    await expect(panel(page)).toBeVisible();
  }

  test("[date-trigger] the trigger is a field that shows the day and is named by the label", async ({ page }) => {
    await open(page, "/components/date-picker");
    await expect(trigger(page)).toHaveText("20 Nov 2026");
    expect(await trigger(page).evaluate((el) => el.tagName)).toBe("BUTTON");
    await expect(stage(page, "DatePickerKeep").getByRole("button", { name: /Keep until/ })).toHaveCount(1);
  });

  test("[date-open] Enter opens the calendar on the chosen day", async ({ page }) => {
    await openIt(page);
    await expect.poll(() => focusedDay(page)).toBe("2026-11-20");
    await expect(panel(page).getByRole("grid")).toBeVisible();
  });

  test("[date-arrows] the arrows walk the days and Page Down the months", async ({ page }) => {
    await openIt(page);
    await expect.poll(() => focusedDay(page)).toBe("2026-11-20");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => focusedDay(page)).toBe("2026-11-21");
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => focusedDay(page)).toBe("2026-11-28");
    await page.keyboard.press("PageDown");
    await expect.poll(() => focusedDay(page)).toBe("2026-12-28");
  });

  test("[date-choose] Enter on a day chooses it, closes the calendar and gives the focus back", async ({ page }) => {
    await openIt(page);
    await expect.poll(() => focusedDay(page)).toBe("2026-11-20");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => focusedDay(page)).toBe("2026-11-21");
    await page.keyboard.press("Enter");
    await expect(panel(page)).toBeHidden();
    await expect(caption(page)).toHaveText("Kept until 2026-11-21");
    await expect(trigger(page)).toBeFocused();
  });

  test("[date-escape] Escape closes the calendar and gives the focus back", async ({ page }) => {
    await openIt(page);
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await expect(caption(page)).toHaveText("Kept until 2026-11-20");
  });

  test("[date-range] a day outside min and max cannot be chosen", async ({ page }) => {
    await openIt(page);
    const early = panel(page).locator('.glim-date-cell[data-value="2026-11-04"]');
    await expect(early).toHaveAttribute("data-disabled", "");
    await early.dispatchEvent("click");
    await expect(caption(page)).toHaveText("Kept until 2026-11-20");
  });

  test("[date-views] the head steps out to the months, and a month steps back in", async ({ page }) => {
    await openIt(page);
    await panel(page).locator('button.glim-date-title[data-view="day"]').click();
    await expect(panel(page).locator('button.glim-date-title[data-view="month"]')).toHaveText("2026");
    await panel(page).getByRole("button", { name: "Next year" }).click();
    await panel(page).getByText("Jan", { exact: true }).click();
    await expect(panel(page).locator('button.glim-date-title[data-view="day"]')).toHaveText("January 2027");
  });

  test("[date-accent] the chosen day is filled with the accent", async ({ page }) => {
    await openIt(page);
    const day = panel(page).locator('.glim-date-cell[data-value="2026-11-20"]');
    const fill = await day.evaluate((el) => getComputedStyle(el).backgroundColor);
    const accent = await day.evaluate((el) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--accent)";
      el.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(fill).toBe(accent);
  });
});

test.describe("Rating", () => {
  const group = (page: Page) => stage(page, "RatingRelease").getByRole("radiogroup", { name: "How well did the update go?" });
  const star = (page: Page, n: number) => group(page).getByRole("radio", { name: `${n} of 5 stars`, exact: true });
  const lit = (page: Page) => group(page).locator(".glim-rating-star[data-highlighted]");
  const caption = (page: Page) => stage(page, "RatingRelease").locator("span.glim-num");

  test("[rating-radios] a radio group of stars, each named by its value", async ({ page }) => {
    await open(page, "/components/rating");
    await expect(group(page).getByRole("radio")).toHaveCount(5);
    await expect(star(page, 3)).toHaveAttribute("aria-checked", "true");
    await expect(lit(page)).toHaveCount(3);
  });

  test("[rating-arrows] the arrows move the value, Home and End go to the ends", async ({ page }) => {
    await open(page, "/components/rating");
    await star(page, 3).focus();
    await page.keyboard.press("ArrowRight");
    await expect(caption(page)).toHaveText("4 of 5");
    await page.keyboard.press("Home");
    await expect(caption(page)).toHaveText("1 of 5");
    await page.keyboard.press("End");
    await expect(caption(page)).toHaveText("5 of 5");
  });

  test("[rating-hover] a pointer over a star shows what a press would give", async ({ page }) => {
    await open(page, "/components/rating");
    const box = (await star(page, 5).boundingBox())!;
    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await expect(lit(page)).toHaveCount(5);
    await page.mouse.move(0, 0);
    await expect(lit(page)).toHaveCount(3);
    await star(page, 2).click();
    await expect(caption(page)).toHaveText("2 of 5");
  });

  test("[rating-half] a half star is half filled", async ({ page }) => {
    await open(page, "/components/rating");
    const average = stage(page, "RatingRelease").getByRole("radiogroup", { name: "Average of all answers" });
    await expect(average.locator(".glim-rating-star[data-half]")).toHaveCount(1);
    expect(await average.locator(".glim-rating-star[data-half] .glim-rating-fill").evaluate((el) => getComputedStyle(el).clipPath)).toContain("50%");
  });
});
