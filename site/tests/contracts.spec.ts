import { expect, test, type Page } from "@playwright/test";

// Each test is named after its contract row, "[id] ...", which is how the site
// finds its result.

const SITE = "/";

async function open(page: Page, path: string, look?: object) {
  if (look) await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto(`${SITE}#${path}`);
  await page.locator("main h1").waitFor();
}

const stage = (page: Page, demo: string) => page.locator(`[data-demo="${demo}"]`);
const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim());

test.describe("Button", () => {
  test("[button-keys] Enter and Space act", async ({ page }) => {
    await open(page, "/components/confirm-dialog");
    const trigger = stage(page, "ConfirmDelete").getByRole("button", { name: "Delete snapshot" });
    for (const key of ["Enter", "Space"]) {
      await trigger.focus();
      await page.keyboard.press(key);
      await expect(page.getByRole("dialog")).toHaveCount(1);
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });

  test("[button-name] the label stays the name in glyph mode", async ({ page }) => {
    await open(page, "/components/button", { labels: "glyph" });
    const save = stage(page, "ButtonTones").getByRole("button", { name: "Save" });
    await expect(save).toHaveCount(1);
    // The words stay in the tree as screen-reader text, clipped to nothing on screen.
    const shown = await save.evaluate((b) =>
      [...b.querySelectorAll("*")].some((e) => e.textContent === "Save" && e.getBoundingClientRect().width > 1),
    );
    expect(shown).toBe(false);
  });

  test("[button-width] the width does not move between label modes", async ({ page }) => {
    const widths = async () =>
      stage(page, "ButtonTones")
        .getByRole("button")
        .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width * 10) / 10));
    await open(page, "/components/button", { labels: "text" });
    const text = await widths();
    for (const labels of ["textGlyph", "glyph"]) {
      await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify({ labels: l })), labels);
      await page.reload();
      await page.locator("main h1").waitFor();
      expect(await widths(), labels).toEqual(text);
    }
  });

  test("[button-busy] busy keeps the width and says so", async ({ page }) => {
    await open(page, "/components/button");
    const button = stage(page, "ButtonStates").getByRole("button", { name: /Back up now/ });
    const before = (await button.boundingBox())!.width;
    await button.click();
    expect((await button.boundingBox())!.width).toBeCloseTo(before, 0);
    await expect(button).toHaveAttribute("aria-busy", "true");
  });
});

test.describe("Toggle", () => {
  const quiet = (page: Page) => stage(page, "ToggleBasic").getByRole("switch", { name: "Quiet notifications" });

  test("[toggle-role] switch with aria-checked", async ({ page }) => {
    await open(page, "/components/toggle");
    await expect(quiet(page)).toHaveAttribute("aria-checked", "true");
  });

  test("[toggle-space] Space flips", async ({ page }) => {
    await open(page, "/components/toggle");
    await quiet(page).focus();
    await page.keyboard.press("Space");
    await expect(quiet(page)).toHaveAttribute("aria-checked", "false");
  });

  test("[toggle-enter] Enter flips", async ({ page }) => {
    await open(page, "/components/toggle");
    await quiet(page).focus();
    await page.keyboard.press("Enter");
    await expect(quiet(page)).toHaveAttribute("aria-checked", "false");
  });

  test("[toggle-name] the label is the name", async ({ page }) => {
    await open(page, "/components/toggle");
    await expect(quiet(page)).toHaveCount(1);
  });

  test("[toggle-disabled] a disabled switch ignores clicks", async ({ page }) => {
    await open(page, "/components/toggle");
    await quiet(page).click();
    const sound = stage(page, "ToggleBasic").getByRole("switch", { name: "Play a sound" });
    await expect(sound).toBeDisabled();
    await sound.click({ force: true });
    await expect(sound).toHaveAttribute("aria-checked", "false");
  });
});

test.describe("ConfirmDialog", () => {
  async function openDialog(page: Page, byKeyboard = false) {
    await open(page, "/components/confirm-dialog");
    const trigger = stage(page, "ConfirmDelete").getByRole("button", { name: "Delete snapshot" });
    if (byKeyboard) {
      await trigger.focus();
      await page.keyboard.press("Enter");
    } else await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    return trigger;
  }

  test("[dialog-role] named, described, modal", async ({ page }) => {
    await openDialog(page);
    const dialog = page.getByRole("dialog", { name: "Confirm" });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAccessibleDescription(/Delete the snapshot/);
  });

  test("[dialog-focus] focus lands on Cancel", async ({ page }) => {
    await openDialog(page);
    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  });

  test("[dialog-escape] Escape cancels", async ({ page }) => {
    await openDialog(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("[dialog-trap] Tab wraps inside the window", async ({ page }) => {
    await openDialog(page);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `after ${i + 1} Tab`).toBe(true);
    }
  });

  test("[dialog-return] focus returns to the opener", async ({ page }) => {
    const trigger = await openDialog(page, true);
    await page.getByRole("button", { name: "Cancel" }).press("Enter");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("[dialog-backdrop] a click outside cancels", async ({ page }) => {
    await openDialog(page);
    await page.mouse.click(8, 400);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("DropdownListbox", () => {
  async function openList(page: Page) {
    await open(page, "/components/dropdown-listbox");
    const trigger = stage(page, "DropdownSelect").locator("button.field");
    await trigger.click();
    await expect(page.getByRole("listbox", { name: "Time zone" })).toBeVisible();
    await expect.poll(() => focusedText(page)).toBe("Europe/Vienna");
    return trigger;
  }

  test("[list-open-focus] focus on the selected option", async ({ page }) => {
    await openList(page);
    expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-selected"))).toBe("true");
  });

  test("[list-arrows] arrows move between options", async ({ page }) => {
    await openList(page);
    await page.keyboard.press("ArrowDown");
    expect(await focusedText(page)).toBe("Europe/Berlin");
    await page.keyboard.press("ArrowUp");
    expect(await focusedText(page)).toBe("Europe/Vienna");
  });

  test("[list-home-end] Home and End", async ({ page }) => {
    await openList(page);
    await page.keyboard.press("End");
    expect(await focusedText(page)).toBe("UTC");
    await page.keyboard.press("Home");
    expect(await focusedText(page)).toBe("Europe/Vienna");
  });

  test("[list-typeahead] a letter jumps", async ({ page }) => {
    test.fail(true, "DropdownListbox is deprecated; Select carries this row");
    await openList(page);
    await page.keyboard.press("a");
    expect(await focusedText(page)).toBe("America/New_York");
  });

  test("[list-escape] Escape closes and returns focus", async ({ page }) => {
    const trigger = await openList(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("[list-outside] a click outside closes", async ({ page }) => {
    await openList(page);
    await page.locator("main h1").click();
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });
});

test.describe("Select", () => {
  const trigger = (page: Page) => stage(page, "SelectZag").locator(".glim-select-trigger");
  const list = (page: Page) => page.getByRole("listbox", { name: "Time zone", exact: true });
  const highlighted = (page: Page) => list(page).locator('[role="option"][data-highlighted]').innerText();

  async function openSelect(page: Page) {
    await open(page, "/components/select");
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    await expect(list(page)).toBeVisible();
    // Zag moves focus into the list on the next frame; nobody types faster than that.
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="listbox"]'))).toBe(true);
  }

  test("[select-open-focus] opens on the selected option", async ({ page }) => {
    await openSelect(page);
    expect(await highlighted(page)).toBe("Europe/Vienna");
  });

  test("[select-arrows] arrows move the highlight", async ({ page }) => {
    await openSelect(page);
    await page.keyboard.press("ArrowDown");
    expect(await highlighted(page)).toBe("Europe/Berlin");
    await page.keyboard.press("ArrowUp");
    expect(await highlighted(page)).toBe("Europe/Vienna");
  });

  test("[select-home-end] Home and End", async ({ page }) => {
    await openSelect(page);
    await page.keyboard.press("End");
    expect(await highlighted(page)).toBe("UTC");
    await page.keyboard.press("Home");
    expect(await highlighted(page)).toBe("Europe/Vienna");
  });

  test("[select-typeahead] a letter jumps", async ({ page }) => {
    await openSelect(page);
    await page.keyboard.press("a");
    expect(await highlighted(page)).toBe("America/New_York");
  });

  test("[select-enter] Enter chooses and closes", async ({ page }) => {
    await openSelect(page);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(list(page)).toBeHidden();
    await expect(trigger(page)).toHaveText(/Europe\/Berlin/);
  });

  test("[select-escape] Escape closes, focus stays on the trigger", async ({ page }) => {
    await openSelect(page);
    await page.keyboard.press("Escape");
    await expect(list(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });

  test("[select-outside] a click outside closes", async ({ page }) => {
    await openSelect(page);
    await page.locator("main h1").click();
    await expect(list(page)).toBeHidden();
  });
});

test.describe("Combobox", () => {
  const input = (page: Page) => stage(page, "ComboboxZag").getByRole("combobox");
  const list = (page: Page) => page.getByRole("listbox");

  test("[combo-filter] typing filters", async ({ page }) => {
    await open(page, "/components/combobox");
    await input(page).fill("arr");
    await expect(list(page)).toBeVisible();
    const items = await list(page).getByRole("option").allInnerTexts();
    expect(items.sort()).toEqual(["bazarr", "lidarr", "prowlarr", "radarr", "sonarr"]);
  });

  test("[combo-pick] arrow and Enter fill the field", async ({ page }) => {
    await open(page, "/components/combobox");
    await input(page).fill("plex");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input(page)).toHaveValue("plex");
  });

  test("[combo-active] focus stays in the field", async ({ page }) => {
    await open(page, "/components/combobox");
    await input(page).fill("arr");
    await page.keyboard.press("ArrowDown");
    await expect(input(page)).toBeFocused();
    const id = await input(page).getAttribute("aria-activedescendant");
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id}"]`)).toHaveAttribute("data-highlighted", "");
  });

  test("[combo-escape] Escape closes", async ({ page }) => {
    await open(page, "/components/combobox");
    await input(page).fill("arr");
    await expect(list(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(list(page)).toBeHidden();
  });

  test("[combo-empty] no match is said", async ({ page }) => {
    await open(page, "/components/combobox");
    await input(page).fill("zzz");
    await expect(page.getByText("No container matches.")).toBeVisible();
  });
});

test.describe("Slider", () => {
  const thumb = (page: Page) => stage(page, "SliderZag").getByRole("slider");

  test("[slider-role] values and text", async ({ page }) => {
    await open(page, "/components/slider");
    await expect(thumb(page)).toHaveAttribute("aria-valuenow", "30");
    await expect(thumb(page)).toHaveAttribute("aria-valuemin", "1");
    await expect(thumb(page)).toHaveAttribute("aria-valuemax", "365");
    await expect(thumb(page)).toHaveAttribute("aria-valuetext", "30 days");
  });

  test("[slider-arrows] one step", async ({ page }) => {
    await open(page, "/components/slider");
    await thumb(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(thumb(page)).toHaveAttribute("aria-valuenow", "31");
    await page.keyboard.press("ArrowLeft");
    await expect(thumb(page)).toHaveAttribute("aria-valuenow", "30");
  });

  test("[slider-page] a large step", async ({ page }) => {
    await open(page, "/components/slider");
    await thumb(page).focus();
    // Zag lands a large step on the grid of tens counted from the minimum.
    const now = async () => Number(await thumb(page).getAttribute("aria-valuenow"));
    await page.keyboard.press("PageUp");
    expect(await now()).toBeGreaterThanOrEqual(39);
    expect(await now()).toBeLessThanOrEqual(41);
    await page.keyboard.press("PageDown");
    expect(await now()).toBeGreaterThanOrEqual(29);
    expect(await now()).toBeLessThanOrEqual(31);
  });

  test("[slider-home-end] minimum and maximum", async ({ page }) => {
    await open(page, "/components/slider");
    await thumb(page).focus();
    await page.keyboard.press("End");
    await expect(thumb(page)).toHaveAttribute("aria-valuenow", "365");
    await page.keyboard.press("Home");
    await expect(thumb(page)).toHaveAttribute("aria-valuenow", "1");
  });
});

test.describe("InfoBubble", () => {
  const info = (page: Page) => stage(page, "InfoBubbleBasic").locator('span[tabindex="0"][aria-label]');

  async function focusByKeyboard(page: Page) {
    await open(page, "/components/info-bubble");
    await stage(page, "InfoBubbleBasic").getByRole("switch").focus();
    await page.keyboard.press("Tab");
    await expect(info(page)).toBeFocused();
  }

  test("[bubble-focus] keyboard focus opens it", async ({ page }) => {
    await focusByKeyboard(page);
    await expect(page.getByRole("tooltip")).toBeVisible();
  });

  test("[bubble-hover] hover opens it", async ({ page }) => {
    await open(page, "/components/info-bubble");
    await info(page).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
  });

  test("[bubble-escape] Escape closes, focus stays", async ({ page }) => {
    await focusByKeyboard(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(info(page)).toBeFocused();
  });

  test("[bubble-described] tooltip role and aria-describedby", async ({ page }) => {
    await focusByKeyboard(page);
    const id = await page.getByRole("tooltip").getAttribute("id");
    await expect(info(page)).toHaveAttribute("aria-describedby", id!);
  });

  test("[bubble-viewport] stays inside the window at the edge", async ({ page }) => {
    await open(page, "/components/info-bubble");
    await info(page).evaluate((el) => {
      Object.assign(el.style, { position: "fixed", right: "2px", bottom: "2px" });
    });
    await info(page).hover();
    const box = (await page.getByRole("tooltip").boundingBox())!;
    const vp = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  });
});

test.describe("IconTipButton", () => {
  test("[icontip-name] the tip is the name", async ({ page }) => {
    await open(page, "/components/icon-tip-button");
    await expect(stage(page, "IconTipBasic").getByRole("button", { name: "Move up" })).toHaveCount(1);
  });

  test("[icontip-focus] the house bubble, not the browser's", async ({ page }) => {
    await open(page, "/components/icon-tip-button");
    const button = stage(page, "IconTipBasic").getByRole("button", { name: "Move up" });
    await button.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Move up");
    await expect(button).not.toHaveAttribute("title", /.*/);
  });
});

test.describe("Toast", () => {
  const press = (page: Page, name: string) => stage(page, "ToastDemo").getByRole("button", { name }).click();

  test("[toast-roles] alert for a failure, status for a success", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "Failure");
    await expect(page.getByRole("alert").filter({ hasText: "Could not reach the target." })).toBeVisible();
    await press(page, "Success");
    await expect(page.getByRole("status").filter({ hasText: "Settings saved." })).toBeVisible();
  });

  test("[toast-expire] leaves after four seconds", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "Success");
    const toast = page.getByRole("status").filter({ hasText: "Settings saved." });
    await expect(toast).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCount(0, { timeout: 2500 });
  });

  test("[toast-pause] hover keeps it", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "Warning");
    const toast = page.getByRole("alert").filter({ hasText: "The target is almost full." });
    await toast.hover();
    await page.waitForTimeout(5500);
    await expect(toast).toBeVisible();
    await page.mouse.move(10, 10);
    await expect(toast).toHaveCount(0, { timeout: 5000 });
  });

  test("[toast-dismiss] only that toast leaves", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "Success");
    await press(page, "Warning");
    const success = page.getByRole("status").filter({ hasText: "Settings saved." });
    await success.getByRole("button", { name: "Dismiss" }).click();
    await expect(success).toHaveCount(0);
    await expect(page.getByRole("alert").filter({ hasText: "The target is almost full." })).toBeVisible();
  });
});

test.describe("WindowBar", () => {
  const bar = (page: Page) => stage(page, "WindowBarDemo").locator(".glim-window-bar");
  const button = (page: Page, name: string) => bar(page).getByRole("button", { name, exact: true });
  const log = (page: Page) => stage(page, "WindowBarDemo").getByRole("status");

  // A spot on the bar away from its buttons.
  const EMPTY = { x: 24, y: 20 };

  // Rests the pointer on the bar, where it stands once the page has settled.
  async function restOn(page: Page) {
    await bar(page).hover({ position: EMPTY });
    const box = (await bar(page).boundingBox())!;
    return { x: box.x + EMPTY.x, y: box.y + EMPTY.y };
  }

  test("[window-name] named after the app, no text, three buttons", async ({ page }) => {
    await open(page, "/components/window-bar");
    await expect(bar(page)).toHaveAttribute("aria-label", "Example");
    await expect(bar(page)).toHaveText("");
    await expect(bar(page).getByRole("button")).toHaveCount(3);
    for (const name of ["Minimise", "Maximise", "Close"]) await expect(button(page, name)).toHaveCount(1);
  });

  test("[window-order] Tab goes from minimise to maximise to close", async ({ page }) => {
    await open(page, "/components/window-bar");
    await button(page, "Minimise").focus();
    await page.keyboard.press("Tab");
    await expect(button(page, "Maximise")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(button(page, "Close")).toBeFocused();
  });

  test("[window-keys] Enter and Space act", async ({ page }) => {
    await open(page, "/components/window-bar");
    await button(page, "Minimise").focus();
    await page.keyboard.press("Enter");
    await expect(log(page)).toHaveText("Minimised");
    await button(page, "Close").focus();
    await page.keyboard.press("Space");
    await expect(log(page)).toHaveText("Closed");
  });

  test("[window-restore] a maximised window offers to restore", async ({ page }) => {
    await open(page, "/components/window-bar");
    await button(page, "Maximise").click();
    await expect(button(page, "Restore")).toHaveCount(1);
    await expect(button(page, "Maximise")).toHaveCount(0);
  });

  test("[window-tip] the name shows in the house bubble", async ({ page }) => {
    await open(page, "/components/window-bar");
    await button(page, "Close").focus();
    await expect(page.getByRole("tooltip")).toHaveText("Close");
    await expect(button(page, "Close")).not.toHaveAttribute("title", /.*/);
  });

  test("[window-drag] a press that moves drags, one that does not stays a click", async ({ page }) => {
    await open(page, "/components/window-bar");
    const { x, y } = await restOn(page);
    await page.mouse.down();
    await page.mouse.up();
    await expect(log(page)).toHaveText("Nothing yet");
    await page.mouse.down();
    await page.mouse.move(x + 30, y);
    await page.mouse.up();
    await expect(log(page)).toHaveText("Moving the window");
  });

  test("[window-drag-button] a press on a button never drags", async ({ page }) => {
    await open(page, "/components/window-bar");
    await button(page, "Minimise").hover();
    const box = (await button(page, "Minimise").boundingBox())!;
    await page.mouse.down();
    await page.mouse.move(box.x - 30, box.y + box.height / 2);
    await page.mouse.up();
    await expect(log(page)).not.toHaveText("Moving the window");
  });

  test("[window-dblclick] the bar maximises and restores, a button does not", async ({ page }) => {
    await open(page, "/components/window-bar");
    await bar(page).dblclick({ position: EMPTY });
    await expect(button(page, "Restore")).toHaveCount(1);
    await button(page, "Minimise").dblclick();
    await expect(button(page, "Restore")).toHaveCount(1);
    await bar(page).dblclick({ position: EMPTY });
    await expect(button(page, "Maximise")).toHaveCount(1);
  });
});
