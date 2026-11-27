import { expect, test, type Locator, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

// The rows the form controls gained with their quieter look and their small
// motions, each named after its contract row.

const ground = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);

test.describe("TimePicker", () => {
  const demo = (page: Page) => stage(page, "TimePickerHours");
  const start = (page: Page) => demo(page).getByRole("group", { name: "Backup starts at", exact: true });
  const segment = (field: Locator, name: "Hours" | "Minutes") => field.getByRole("spinbutton", { name, exact: true });
  const said = (page: Page, hook: string) => demo(page).locator(`[data-hook="${hook}"]`);

  test("[time-segments] a group of two spin buttons, each two digits", async ({ page }) => {
    await open(page, "/components/time-picker");
    await expect(segment(start(page), "Hours")).toHaveText("02");
    await expect(segment(start(page), "Minutes")).toHaveText("30");
    await expect(segment(start(page), "Hours")).toHaveAttribute("aria-valuemax", "23");
    await expect(segment(start(page), "Minutes")).toHaveAttribute("aria-valuenow", "30");
  });

  test("[time-arrows] the arrows count round the clock, the minutes by their step", async ({ page }) => {
    await open(page, "/components/time-picker");
    await segment(start(page), "Minutes").focus();
    await page.keyboard.press("ArrowUp");
    await expect(said(page, "start")).toHaveText("Runs daily at 02:45");
    await page.keyboard.press("ArrowUp");
    await expect(said(page, "start")).toHaveText("Runs daily at 02:00");
    await segment(start(page), "Hours").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(said(page, "start")).toHaveText("Runs daily at 23:00");
  });

  test("[time-digits] digits fill the hours and move on to the minutes", async ({ page }) => {
    await open(page, "/components/time-picker");
    await segment(start(page), "Hours").focus();
    await page.keyboard.type("07");
    await expect(segment(start(page), "Minutes")).toBeFocused();
    await page.keyboard.type("45");
    await expect(said(page, "start")).toHaveText("Runs daily at 07:45");
  });

  test("[time-move] the arrows sideways move between the segments", async ({ page }) => {
    await open(page, "/components/time-picker");
    await segment(start(page), "Hours").focus();
    await page.keyboard.press("ArrowRight");
    await expect(segment(start(page), "Minutes")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(segment(start(page), "Hours")).toBeFocused();
  });

  test("[time-backspace] Backspace empties a segment and the time is null, then steps back", async ({ page }) => {
    await open(page, "/components/time-picker");
    await segment(start(page), "Minutes").focus();
    await page.keyboard.press("Backspace");
    await expect(segment(start(page), "Minutes")).toHaveText("--");
    await expect(said(page, "start")).toHaveText("No start time");
    await page.keyboard.press("Backspace");
    await expect(segment(start(page), "Hours")).toBeFocused();
    await expect(segment(start(page), "Hours")).toHaveText("02");
  });

  test("[time-range] a span holds its start and its end in one field", async ({ page }) => {
    await open(page, "/components/time-picker");
    const quiet = demo(page).getByRole("group", { name: "Quiet hours", exact: true });
    await expect(quiet.getByRole("group", { name: "Start", exact: true })).toHaveCount(1);
    await expect(quiet.getByRole("group", { name: "End", exact: true })).toHaveCount(1);
    await expect(quiet.locator(".glim-time-to")).toHaveText("to");
    await quiet.getByRole("group", { name: "Start" }).getByRole("spinbutton", { name: "Minutes" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(quiet.getByRole("group", { name: "End" }).getByRole("spinbutton", { name: "Hours" })).toBeFocused();
    await page.keyboard.type("06");
    await expect(said(page, "quiet")).toHaveText("Quiet from 22:00 to 06:00");
  });

  test("[time-focus] the segment the keys change takes the accent's soft fill, without a ring", async ({ page }) => {
    await open(page, "/components/time-picker");
    const hours = segment(start(page), "Hours");
    const rest = { field: await ground(start(page)), segment: await ground(hours) };
    await hours.focus();
    await expect.poll(() => ground(start(page))).not.toBe(rest.field);
    expect(await ground(hours)).not.toBe(rest.segment);
    expect(await hours.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("none");
  });

  test("[time-ltr] the segments run left to right in every language", async ({ page }) => {
    await open(page, "/components/time-picker");
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    const [hours, minutes] = await Promise.all([segment(start(page), "Hours").boundingBox(), segment(start(page), "Minutes").boundingBox()]);
    expect(hours!.x).toBeLessThan(minutes!.x);
  });
});

test.describe("Form motion", () => {
  test("[field-error-motion] the error line closes softly, and at once without motion", async ({ page }) => {
    await open(page, "/components/text-field");
    const port = stage(page, "FieldErrors").getByRole("textbox", { name: "Port" });
    await port.fill("80800");
    const line = stage(page, "FieldErrors").locator(".glim-field-error", { hasText: "A port is a number" });
    await expect(line).toBeVisible();
    expect(await line.evaluate((e) => getComputedStyle(e).animationName)).toBe("glim-error-open");
    await port.press("Backspace");
    await expect(line).toHaveAttribute("data-closing", "");
    await expect(line).toHaveCount(0);
    await relook(page, { motion: "off" });
    await port.fill("80800");
    await port.press("Backspace");
    await expect(stage(page, "FieldErrors").locator(".glim-field-error", { hasText: "A port is a number" })).toHaveCount(0, { timeout: 500 });
  });

  test("[toggle-label] a click on the words flips the switch", async ({ page }) => {
    await open(page, "/components/toggle");
    const quiet = stage(page, "ToggleBasic").getByRole("switch", { name: "Quiet notifications" });
    const before = await quiet.getAttribute("aria-checked");
    await stage(page, "ToggleBasic").locator(".glim-toggle-label", { hasText: "Quiet notifications" }).click();
    await expect(quiet).not.toHaveAttribute("aria-checked", before!);
  });

  test("[check-tick] the tick draws itself, and a locked box is grey with a grey tick", async ({ page }) => {
    await open(page, "/components/checkbox");
    const tick = (name: string) => stage(page, "CheckboxBasic").getByRole("checkbox", { name, exact: true }).locator(".glim-checkbox-tick");
    expect(await tick("Name, always shown").getAttribute("stroke-dashoffset")).toBe("0");
    const locked = await stage(page, "CheckboxBasic").getByRole("checkbox", { name: "Name, always shown" }).evaluate((b) => {
      const box = b.querySelector(".glim-checkbox-box")!;
      const probe = document.createElement("span");
      probe.style.color = "var(--stone-text-muted)";
      b.append(probe);
      const muted = getComputedStyle(probe).color;
      probe.remove();
      return { opacity: getComputedStyle(b).opacity, tick: getComputedStyle(box).color === muted };
    });
    expect(locked).toEqual({ opacity: "1", tick: true });
  });

  test("[slider-bubble] a dragged thumb shows its value in a bubble", async ({ page }) => {
    await open(page, "/components/slider");
    const thumb = stage(page, "SliderZag").getByRole("slider", { name: "Keep backups for" });
    const bubble = thumb.locator(".glim-slider-bubble");
    await expect(bubble).toHaveText("30 days");
    expect(await bubble.evaluate((e) => getComputedStyle(e).opacity)).toBe("0");
    const box = (await thumb.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 4 });
    await expect.poll(() => bubble.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    await expect(bubble).not.toHaveText("30 days");
    await page.mouse.up();
    await expect.poll(() => bubble.evaluate((e) => getComputedStyle(e).opacity)).toBe("0");
  });

  test("[num-column] under a mouse the arrows are one column of two halves, and the digits roll", async ({ page }) => {
    await open(page, "/components/number-field");
    const wrap = stage(page, "NumberFieldBasic").locator(".glim-num-wrap");
    const look = await wrap.evaluate((w) => {
      const box = w.getBoundingClientRect();
      const [up, down] = [...w.querySelectorAll(".glim-num-step")].map((b) => b.getBoundingClientRect());
      return { height: Math.round(box.height), halves: Math.round(up!.height + down!.height), end: Math.round(box.right - up!.right), width: Math.round(up!.width) };
    });
    expect(look.halves).toBe(look.height);
    expect(look.end).toBe(0);
    expect(look.width).toBe(24);
    const up = wrap.locator(".glim-num-step").first();
    const rest = await ground(up);
    await up.hover();
    await expect.poll(() => ground(up)).not.toBe(rest);
    await up.click();
    await expect(wrap.locator("input")).toHaveAttribute("data-roll", "up");
  });

  test("[pw-dots] a typed secret in larger dots, the second field asking in words", async ({ page }) => {
    await open(page, "/components/password-field");
    const first = stage(page, "PasswordFieldConfirm").locator('input[aria-label="New password"]');
    const second = stage(page, "PasswordFieldConfirm").getByLabel("Confirm password", { exact: true });
    const look = (field: Locator) => field.evaluate((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), spacing: getComputedStyle(e).letterSpacing }));
    await first.pressSequentially("hunter22");
    await expect(second).toHaveAttribute("placeholder", "Once more");
    const [typed, asking] = [await look(first), await look(second)];
    expect(typed.size).toBeCloseTo(asking.size * 1.15, 0);
    expect(typed.spacing).not.toBe(asking.spacing);
  });

  test("[pw-reveal] a stroke draws itself through the eye once the secret shows", async ({ page }) => {
    await open(page, "/components/password-field");
    const eye = stage(page, "PasswordFieldBasic").getByRole("button", { name: "Show" }).first();
    const slash = eye.locator("svg > path.glim-secret-slash");
    await expect(slash).toHaveAttribute("stroke-dashoffset", "1");
    await eye.click();
    await expect(stage(page, "PasswordFieldBasic").locator("svg > path.glim-secret-slash").first()).toHaveAttribute("stroke-dashoffset", "0");
  });

  test("[pin-groups] six boxes stand as two groups of three, the next one with a caret", async ({ page }) => {
    await open(page, "/components/pin-input");
    const control = stage(page, "PinInputCode").locator(".glim-pin-control");
    const order = await control.evaluate((c) => [...c.children].map((e) => (e.classList.contains("glim-pin-sep") ? "|" : "x")).join(""));
    expect(order).toBe("xxx|xxx");
    const box = stage(page, "PinInputCode").getByRole("textbox", { name: "Character 1 of 6", exact: true });
    await box.focus();
    expect(await box.evaluate((e) => getComputedStyle(e).backgroundImage)).toContain("linear-gradient");
  });

  test("[upload-progress] each row fills as its file goes up, and stops once it is there", async ({ page }) => {
    await open(page, "/components/file-upload");
    await stage(page, "FileUploadImport").locator('input[type="file"]').setInputFiles({ name: "settings.json", mimeType: "application/json", buffer: Buffer.from("{}") });
    const row = stage(page, "FileUploadImport").locator(".glim-upload-file");
    await expect(row).toHaveAttribute("data-progress", "sending");
    await expect(row).toHaveAttribute("aria-busy", "true");
    expect(await row.evaluate((e) => getComputedStyle(e).backgroundImage)).toContain("linear-gradient");
    await expect(row).toHaveAttribute("data-progress", "done");
    await expect(row).not.toHaveAttribute("aria-busy", "true");
    await expect(stage(page, "FileUploadImport").getByText("1 of 1 sent")).toBeVisible();
  });

  test("[date-turn] the next month slides in from its side, and nothing is struck through", async ({ page }) => {
    await open(page, "/components/date-picker");
    await stage(page, "DatePickerKeep").locator(".glim-date-trigger").click();
    const panel = page.locator(".glim-date-panel");
    await expect(panel).toBeVisible();
    const struck = await panel.evaluate((p) => [...p.querySelectorAll(".glim-date-cell")].filter((c) => getComputedStyle(c).textDecorationLine.includes("line-through")).length);
    expect(struck).toBe(0);
    const steps = panel.locator(".glim-date-step:visible");
    await steps.last().click();
    await expect(panel.locator("tbody").first()).toHaveAttribute("data-turn", "next");
    await steps.first().click();
    await expect(panel.locator("tbody").first()).toHaveAttribute("data-turn", "prev");
  });

  test("[rating-hover] the stars fill one after the other", async ({ page }) => {
    await open(page, "/components/rating");
    const delays = await stage(page, "RatingRelease").getByRole("radiogroup").first().evaluate((g) => [...g.querySelectorAll(".glim-rating-fill")].map((f) => parseFloat(getComputedStyle(f).transitionDelay)));
    expect(delays[0]).toBe(0);
    expect(delays[4]).toBeGreaterThan(delays[1]!);
  });

  test("[angle-snap] it snaps every 15°, with a tick at each snap and a hand to the knob", async ({ page }) => {
    await open(page, "/components/angle-slider");
    const dial = stage(page, "AngleSliderTurn").locator(".glim-angle-dial");
    await expect(dial.locator(".glim-angle-mark")).toHaveCount(24);
    await expect(dial.locator(".glim-angle-mark[data-quarter]")).toHaveCount(4);
    await expect(dial.locator(".glim-angle-thumb .glim-angle-hand")).toHaveCount(1);
    await dial.getByRole("slider").focus();
    await page.keyboard.press("ArrowRight");
    await expect(dial.getByRole("slider")).toHaveAttribute("aria-valuenow", "105");
  });
});

test.describe("Lists that open over their trigger", () => {
  test("[select-aligned] the list opens with the chosen row over the trigger", async ({ page }) => {
    await open(page, "/components/select");
    for (const [demo, name, chosen] of [["SelectZag", "Time zone", "Europe/Vienna"], ["SelectSubmenu", "Server time zone", "Europe"]] as const) {
      const trigger = stage(page, demo).getByRole("combobox", { name }).or(stage(page, demo).getByRole("button", { name: new RegExp(`^${name}`) })).first();
      await trigger.click();
      const list = page.locator(".glim-select-content:visible").first();
      await expect(list).not.toHaveAttribute("data-aligning", "");
      const row = demo === "SelectZag" ? list.getByRole("option", { name: chosen }) : list.getByRole("menuitem", { name: chosen });
      const [t, r] = await Promise.all([trigger.boundingBox(), row.boundingBox()]);
      expect(Math.abs(t!.y + t!.height / 2 - (r!.y + r!.height / 2))).toBeLessThan(4);
      await page.keyboard.press("Escape");
    }
  });

  test("[combo-hit] each entry sets apart the part that matches", async ({ page }) => {
    await open(page, "/components/combobox");
    await stage(page, "ComboboxZag").getByRole("combobox").fill("arr");
    const hits = await page.getByRole("listbox").locator(".glim-combobox-hit").allInnerTexts();
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits.map((h) => h.toLowerCase()))).toEqual(new Set(["arr"]));
  });

  test("[ms-hit] a searched long list sets apart the part that matches", async ({ page }) => {
    await open(page, "/components/multi-select");
    await stage(page, "MultiSelectZag").getByRole("combobox").fill("ph");
    await expect(page.getByRole("listbox").locator(".glim-combobox-hit")).toHaveText(["Ph"]);
  });
});

test.describe("ColorPicker presets", () => {
  async function openPicker(page: Page) {
    await open(page, "/components/color-picker");
    const swatch = page.getByRole("button", { name: "Label colour", exact: true });
    await swatch.scrollIntoViewIfNeeded();
    await swatch.click();
    return page.locator(".glim-picker-panel--float");
  }

  test("[picker-presets] the rainbow stands under the bar, and a press takes a colour", async ({ page }) => {
    const panel = await openPicker(page);
    const presets = panel.getByRole("group", { name: "Ready colours" }).getByRole("button");
    await expect(presets).toHaveCount(8);
    const colour = (await presets.nth(2).getAttribute("aria-label"))!;
    await presets.nth(2).click();
    await expect(panel.getByRole("textbox", { name: "Hex" })).toHaveValue(colour);
    await expect(presets.nth(2)).toHaveAttribute("aria-pressed", "true");
  });

  test("[picker-dropper] an eyedropper where the browser has one", async ({ page }) => {
    const panel = await openPicker(page);
    const can = await page.evaluate(() => "EyeDropper" in window);
    await expect(panel.getByRole("button", { name: "Pick from the screen" })).toHaveCount(can ? 1 : 0);
  });
});
