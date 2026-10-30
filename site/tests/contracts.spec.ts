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

  test("[select-scroll-away] a scroll outside closes", async ({ page }) => {
    await openSelect(page);
    // The wheel inside the list scrolls the list.
    await list(page).hover();
    await page.mouse.wheel(0, 40);
    await expect(list(page)).toBeVisible();
    const vp = page.viewportSize()!;
    await page.mouse.move(vp.width - 20, vp.height - 20);
    await page.mouse.wheel(0, 40);
    await expect(list(page)).toBeHidden();
  });

  test("[select-wheel] the wheel steps the focused trigger", async ({ page }) => {
    await open(page, "/components/select");
    await trigger(page).focus();
    await trigger(page).hover();
    await page.mouse.wheel(0, 100);
    await expect(trigger(page)).toHaveText(/Europe\/Berlin/);
    await page.mouse.wheel(0, -100);
    await page.mouse.wheel(0, -100);
    await expect(trigger(page)).toHaveText(/Europe\/Vienna/);
    await expect(list(page)).toBeHidden();

    // "Network share" at the end is disabled, so the wheel stops on the one before it.
    const target = stage(page, "SelectGroups").locator(".glim-select-trigger").nth(1);
    await target.focus();
    await target.hover();
    await page.mouse.wheel(0, 100);
    await expect(target).toHaveText(/Cloud storage/);
    await page.mouse.wheel(0, 100);
    await expect(target).toHaveText(/Cloud storage/);
  });

  test("[select-wheel-hover] the wheel leaves a trigger without focus alone", async ({ page }) => {
    await open(page, "/components/select");
    await page.locator("main h1").click();
    await trigger(page).hover();
    await page.mouse.wheel(0, 100);
    await expect(trigger(page)).toHaveText(/Europe\/Vienna/);
  });

  test("[select-groups] named groups, arrows run through all", async ({ page }) => {
    await open(page, "/components/select");
    const format = stage(page, "SelectGroups").locator(".glim-select-trigger").first();
    await format.focus();
    await page.keyboard.press("Enter");
    const box = page.getByRole("listbox", { name: "Audio format" });
    await expect(box).toBeVisible();
    await expect(box.getByRole("group", { name: "Convert to" }).getByRole("option")).toHaveText(["FLAC", "WAV"]);
    const lit = () => box.locator(".glim-select-item[data-highlighted]").innerText();
    await expect.poll(lit).toBe("Opus");
    await page.keyboard.press("End");
    expect(await lit()).toBe("WAV");
    await page.keyboard.press("Home");
    expect(await lit()).toBe("Auto");
    await page.keyboard.press("ArrowDown");
    expect(await lit()).toBe("Opus");
  });

  test("[select-placeholder] null shows the placeholder", async ({ page }) => {
    await open(page, "/components/select");
    const backend = stage(page, "SelectStates").locator(".glim-select-trigger").first();
    await expect(backend).toHaveText("Mixed");
    await backend.click();
    const box = page.getByRole("listbox", { name: "Backend" });
    await expect(box).toBeVisible();
    await expect(box.locator('[aria-selected="true"]')).toHaveCount(0);
  });

  test("[select-busy] busy keeps focus and takes nothing", async ({ page }) => {
    await open(page, "/components/select");
    const backend = stage(page, "SelectStates").locator(".glim-select-trigger").first();
    await backend.click();
    await page.getByRole("option", { name: "Real-Debrid" }).click();
    await expect(backend).toHaveAttribute("aria-busy", "true");
    await expect(backend).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox", { name: "Backend" })).toBeHidden();
    await backend.hover();
    await page.mouse.wheel(0, 100);
    await expect(backend).toHaveText(/Real-Debrid/);
    await expect(backend).not.toHaveAttribute("aria-busy", "true");
  });

  test("[select-shake] a refused value shakes the trigger", async ({ page }) => {
    await open(page, "/components/select");
    const backend = stage(page, "SelectStates").locator(".glim-select-trigger").first();
    // The shake is over in a fifth of a second, so it is counted as it starts.
    await backend.evaluate((el) => {
      el.dataset.shakes = "0";
      el.addEventListener("animationstart", (e) => {
        if ((e as AnimationEvent).animationName.startsWith("glim-shake")) el.dataset.shakes = String(Number(el.dataset.shakes) + 1);
      });
    });
    await backend.click();
    await page.getByRole("option", { name: "AllDebrid" }).click();
    await expect(backend).toHaveAttribute("data-shakes", "1");
    await expect(backend).toHaveText("Mixed");
  });

  test("[select-tip] the tip shows in the house bubble", async ({ page }) => {
    await open(page, "/components/select");
    const backend = stage(page, "SelectStates").locator(".glim-select-trigger").first();
    // In view first, since a scroll puts the bubble away again.
    await backend.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await backend.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Which service fetches the selected links");
  });

  test("[select-widths] each width does what it says", async ({ page }) => {
    await open(page, "/components/select");
    const row = (w: string) => stage(page, "SelectWidths").locator(`[data-width="${w}"]`);
    const width = async (w: string) => (await row(w).locator(".glim-select-trigger").boundingBox())!.width;
    // Widths measured in the fallback font are not the ones the house font gives.
    await page.evaluate(() => document.fonts.ready);
    const before = Object.fromEntries(await Promise.all(["fill", "steady", "squeeze", "hug"].map(async (w) => [w, await width(w)])));

    // The rows are 360px, less the 64px name and a 12px gap.
    expect(before.fill).toBeCloseTo(284, 0);
    expect(before.squeeze).toBeLessThan(before.steady);
    expect(before.squeeze).toBeGreaterThanOrEqual(64);
    expect(before.hug).toBeLessThan(before.steady);

    for (const w of ["fill", "steady", "hug"]) {
      await row(w).locator(".glim-select-trigger").click();
      await page.getByRole("listbox", { name: `Keep backups, ${w}` }).getByRole("option", { name: "Until somebody removes them" }).click();
    }
    expect(await width("fill")).toBeCloseTo(before.fill, 0);
    expect(await width("steady")).toBeCloseTo(before.steady, 0);
    expect(await width("hug")).toBeGreaterThan(before.hug);
  });
});

test.describe("Select sizes and labels", () => {
  test("[select-sizes] row and inset", async ({ page }) => {
    await open(page, "/components/select");
    const row = stage(page, "SelectSizes").locator('[data-size="row"] .glim-select-trigger');
    const inset = stage(page, "SelectSizes").locator('[data-size="inset"] .glim-select-trigger');
    expect((await row.boundingBox())!.height).toBeCloseTo(32, 0);
    expect(await row.evaluate((el) => getComputedStyle(el).fontSize)).toBe("12px");
    expect((await inset.boundingBox())!.height).toBeCloseTo(24, 0);
    for (const t of [row, inset]) await expect(t.locator("xpath=../..")).toHaveClass(/glim-select--steady/);
  });

  test("[select-min-width] a small trigger opens a full list", async ({ page }) => {
    await open(page, "/components/select");
    const row = stage(page, "SelectSizes").locator('[data-size="row"] .glim-select-trigger');
    await row.click();
    const box = page.getByRole("listbox", { name: "Quality" });
    await expect(box).toBeVisible();
    expect((await row.boundingBox())!.width).toBeLessThan(208);
    expect((await box.boundingBox())!.width).toBeGreaterThanOrEqual(208);
  });

  test("[select-label-for] an outside label and a ref", async ({ page }) => {
    await open(page, "/components/select");
    const demo = stage(page, "SelectLabelled");
    const trigger = demo.locator(".glim-select-trigger");
    await expect(trigger).toHaveAttribute("id", "backup-destination");
    await demo.locator('label[for="backup-destination"]').click();
    await expect(page.getByRole("listbox", { name: "Destination" })).toBeVisible();
    await page.keyboard.press("Escape");
    await demo.getByRole("button", { name: "Choose the destination" }).click();
    await expect(trigger).toBeFocused();
  });

  test("[select-wrap] a long value wraps", async ({ page }) => {
    await open(page, "/components/select");
    await page.evaluate(() => document.fonts.ready);
    const trigger = stage(page, "SelectLabelled").locator(".glim-select-trigger");
    expect((await trigger.boundingBox())!.height).toBeGreaterThan(40);
    const cut = await trigger
      .locator(".glim-select-value > *")
      .evaluateAll((els) => els.some((e) => e.scrollWidth > e.clientWidth + 1));
    expect(cut).toBe(false);
  });
});

test.describe("Select with submenus", () => {
  const trigger = (page: Page) => stage(page, "SelectSubmenu").locator(".glim-select-trigger");
  const root = (page: Page) => page.getByRole("menu", { name: "Server time zone" });
  const europe = (page: Page) => page.getByRole("menu", { name: "Europe" });
  // A submenu is a list of its own on the body, so a menu holds only its own rows.
  const lit = (menu: ReturnType<typeof root>) => menu.locator(".glim-select-item[data-highlighted]").innerText();

  // The submenu takes the keys once it holds the focus.
  async function enterEurope(page: Page) {
    await page.keyboard.press("ArrowRight");
    await expect(europe(page)).toBeVisible();
    await expect.poll(() => lit(europe(page))).toBe("Berlin");
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe("Europe");
  }

  async function openMenu(page: Page) {
    await open(page, "/components/select");
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    await expect(root(page)).toBeVisible();
    await expect.poll(() => lit(root(page))).toBe("Europe");
  }

  test("[select-submenu-home] opens on the row that holds the value", async ({ page }) => {
    await openMenu(page);
    await expect(trigger(page)).toHaveAccessibleName("Server time zone: Vienna");
  });

  test("[select-submenu-open] ArrowRight opens the submenu", async ({ page }) => {
    await openMenu(page);
    await enterEurope(page);
    const parent = (await root(page).boundingBox())!;
    await expect.poll(async () => (await europe(page).boundingBox())!.x - (parent.x + parent.width)).toBeGreaterThanOrEqual(-8);
    await expect(europe(page).getByRole("menuitemradio", { name: "Vienna" })).toHaveAttribute("aria-checked", "true");
  });

  test("[select-submenu-back] ArrowLeft closes it", async ({ page }) => {
    await openMenu(page);
    await enterEurope(page);
    await page.keyboard.press("ArrowLeft");
    await expect(europe(page)).toBeHidden();
    await expect(root(page)).toBeVisible();
    expect(await lit(root(page))).toBe("Europe");
  });

  test("[select-submenu-pick] Enter chooses and closes everything", async ({ page }) => {
    await openMenu(page);
    await enterEurope(page);
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => lit(europe(page))).toBe("Lisbon");
    await page.keyboard.press("Enter");
    await expect(root(page)).toBeHidden();
    await expect(europe(page)).toBeHidden();
    await expect(trigger(page)).toHaveAccessibleName("Server time zone: Lisbon");
    await expect(trigger(page)).toBeFocused();
  });
});

test.describe("Select right to left", () => {
  test.beforeEach(async ({ page }) => {
    // The script runs before <html> exists, so it waits for it.
    await page.addInitScript(() => {
      new MutationObserver((_, watch) => {
        if (!document.documentElement) return;
        document.documentElement.dir = "rtl";
        watch.disconnect();
      }).observe(document, { childList: true });
    });
  });

  test("[select-rtl] lines up on the right and opens submenus to the left", async ({ page }) => {
    await open(page, "/components/select");
    // The hug trigger is narrower than its list, so the side it lines up on shows.
    const unit = stage(page, "SelectWidths").locator('[data-width="hug"] .glim-select-trigger');
    await unit.click();
    const box = page.getByRole("listbox", { name: "Keep backups, hug" });
    await expect(box).toBeVisible();
    const t = (await unit.boundingBox())!;
    // Zag places the list on the frame after it shows.
    await expect.poll(async () => {
      const l = (await box.boundingBox())!;
      return Math.abs(l.x + l.width - (t.x + t.width));
    }).toBeLessThanOrEqual(2);
    expect((await box.boundingBox())!.width).toBeGreaterThan(t.width + 20);
    await page.keyboard.press("Escape");

    const sub = stage(page, "SelectSubmenu").locator(".glim-select-trigger");
    await sub.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await sub.focus();
    await page.keyboard.press("Enter");
    const root = page.getByRole("menu", { name: "Server time zone" });
    await expect.poll(() => root.locator(".glim-select-item[data-highlighted]").innerText()).toBe("Europe");
    await page.keyboard.press("ArrowLeft");
    const europe = page.getByRole("menu", { name: "Europe" });
    await expect(europe).toBeVisible();
    const p = (await root.boundingBox())!;
    await expect.poll(async () => {
      const c = (await europe.boundingBox())!;
      return c.x + c.width - p.x;
    }).toBeLessThanOrEqual(8);
  });
});

test.describe("Select under reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("[select-reduced-motion] the list appears without a fade", async ({ page }) => {
    await open(page, "/components/select");
    await stage(page, "SelectZag").locator(".glim-select-trigger").click();
    const box = page.getByRole("listbox", { name: "Time zone", exact: true });
    await expect(box).toBeVisible();
    expect(await box.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });
});

test.describe("Select on a touch screen", () => {
  test.use({ hasTouch: true });

  test("[select-touch] a tap opens it and rows fit a finger", async ({ page }) => {
    await open(page, "/components/select");
    await stage(page, "SelectZag").locator(".glim-select-trigger").tap();
    const box = page.getByRole("listbox", { name: "Time zone", exact: true });
    await expect(box).toBeVisible();
    const heights = await box.getByRole("option").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);

    await box.getByRole("option", { name: "UTC" }).tap();
    await expect(box).toBeHidden();
    const sub = stage(page, "SelectSubmenu").locator(".glim-select-trigger");
    await sub.tap();
    await page.getByRole("menuitem", { name: "America" }).tap();
    await expect(page.getByRole("menu", { name: "America" })).toBeVisible();
  });
});

test.describe("Select without a framework", () => {
  test("[select-vanilla] groups and the wheel", async ({ page }) => {
    await open(page, "/components/select");
    const zone = stage(page, "SelectVanilla").locator(".glim-select-trigger");
    await zone.click();
    const box = page.getByRole("listbox", { name: "Time zone, no framework" });
    await expect(box.getByRole("group", { name: "Europe" }).getByRole("option")).toHaveText(["Europe/Berlin", "Europe/Vienna"]);
    await page.keyboard.press("Escape");
    await expect(box).toBeHidden();
    await zone.focus();
    await zone.hover();
    await page.mouse.wheel(0, 100);
    await expect(zone).toHaveText(/Europe\/Berlin/);
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
