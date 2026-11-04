import { expect, test, type Locator, type Page } from "@playwright/test";

// Each test is named after its contract row, "[id] ...", which is how the site
// finds its result.

const SITE = "/";

// Each Playwright project runs every row against one framework's demos alone.
async function open(page: Page, path: string, look?: object) {
  if (look) await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto(`${SITE}#${path}?fw=${test.info().project.name}`);
  await page.locator("main h1").waitFor();
  // A width measured before the font arrives is the fallback's.
  await page.evaluate(() => document.fonts.ready);
}

const stage = (page: Page, demo: string) => page.locator(`[data-demo="${demo}"]`);

// A scroll puts a bubble away, and the scroll event of scrollIntoView arrives a
// frame later, so whatever opens a bubble waits for it.
async function centre(el: Locator) {
  await el.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await el.page().evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

// For a component that has no Vue twin, so the Vue run says so instead of
// passing over an empty stage.
function reactOnly() {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "react", "React only"));
}

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

  test("[button-width] the width does not move between text and text with glyph", async ({ page }) => {
    const buttons = () => stage(page, "ButtonTones").getByRole("button");
    const widths = () => buttons().evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width * 10) / 10));
    // The look is set on the page and reloaded rather than through an init
    // script, which would put the first mode back on every reload.
    const switchTo = async (labels: string) => {
      await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify({ labels: l })), labels);
      await page.reload();
      await page.locator("main h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
    };
    await open(page, "/components/button");
    await switchTo("text");
    const text = await widths();
    await switchTo("textGlyph");
    expect(await widths()).toEqual(text);
    // The hiding modes hug the glyph instead.
    await switchTo("glyph");
    const glyph = await widths();
    glyph.forEach((w, i) => expect(w).toBeLessThan(text[i]));
  });

  test("[button-busy] busy keeps the width and says so", async ({ page }) => {
    await open(page, "/components/button");
    const button = stage(page, "ButtonStates").getByRole("button", { name: /Back up now/ });
    const before = (await button.boundingBox())!.width;
    await button.click();
    expect((await button.boundingBox())!.width).toBeCloseTo(before, 0);
    await expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("[button-tint] a surface button takes the accent under the pointer", async ({ page }) => {
    await open(page, "/components/button", { labels: "textGlyph" });
    for (const name of ["Refresh", "Copy"]) {
      const button = stage(page, "ButtonTones").getByRole("button", { name });
      const ground = () => button.evaluate((b) => getComputedStyle(b).backgroundColor);
      const ink = () => button.locator(".glim-btn-glyph").evaluate((g) => getComputedStyle(g).color);
      // A probe inside the button resolves --btn-tint where the button reads it.
      const tint = await button.evaluate((b) => {
        const probe = b.appendChild(document.createElement("span"));
        probe.style.color = "var(--btn-tint)";
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      });
      const rest = await ground();
      expect(await ink()).not.toBe(tint);
      await button.hover();
      await expect.poll(ground).not.toBe(rest);
      await expect.poll(ink).toBe(tint);
    }
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
  reactOnly();
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
    await centre(backend);
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
    // Each framework's demo names its own id, since both stand on one page.
    const label = demo.locator("label[for]").first();
    await expect(trigger).toHaveAttribute("id", (await label.getAttribute("for"))!);
    await label.click();
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
    await centre(sub);
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
  reactOnly();
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
  reactOnly();
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

test.describe("Selector", () => {
  const tabs = (page: Page) => stage(page, "SelectorTabs").getByRole("tablist", { name: "Settings pages" });
  const tab = (page: Page, name: string) => tabs(page).getByRole("tab", { name });
  const theme = (page: Page) => stage(page, "SelectorPickers").getByRole("radiogroup", { name: "Theme" });
  const shown = (page: Page) => stage(page, "SelectorPickers").getByRole("group", { name: "Show" });
  const column = (page: Page) => stage(page, "SelectorTiles").getByRole("tablist", { name: "Settings pages" });
  const tile = (page: Page, name: string) => column(page).getByRole("tab", { name });

  test("[sel-tabs-role] a tab list whose chosen tab names the panel", async ({ page }) => {
    await open(page, "/components/selector");
    await expect(tabs(page).getByRole("tab")).toHaveCount(4);
    await expect(tab(page, "General")).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, "Look")).toHaveAttribute("aria-selected", "false");
    await tab(page, "Look").click();
    const panel = stage(page, "SelectorTabs").getByRole("tabpanel", { name: "Look" });
    await expect(panel).toHaveText("The Look page.");
    await expect(tab(page, "Look")).toHaveAttribute("aria-controls", (await panel.getAttribute("id"))!);
  });

  test("[sel-one-stop] the strip is one tab stop", async ({ page }) => {
    await open(page, "/components/selector");
    await tab(page, "Storage").click();
    await expect(tabs(page).locator('[tabindex="0"]')).toHaveCount(1);
    await expect(tabs(page).locator('[tabindex="0"]')).toHaveAccessibleName("Storage");
  });

  test("[sel-arrows] the arrows move and choose, and wrap", async ({ page }) => {
    await open(page, "/components/selector");
    await tab(page, "General").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Look")).toBeFocused();
    await expect(tab(page, "Look")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "Notifications")).toBeFocused();
    await expect(tab(page, "Notifications")).toHaveAttribute("aria-selected", "true");
  });

  test("[sel-home-end] Home and End jump to the ends", async ({ page }) => {
    await open(page, "/components/selector");
    await tab(page, "General").focus();
    await page.keyboard.press("End");
    await expect(tab(page, "Notifications")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tab(page, "General")).toBeFocused();
    await expect(tab(page, "General")).toHaveAttribute("aria-selected", "true");
  });

  test("[sel-rtl] ArrowLeft goes forward right to left", async ({ page }) => {
    await open(page, "/components/selector");
    await stage(page, "SelectorTabs").evaluate((el) => el.setAttribute("dir", "rtl"));
    await tab(page, "General").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "Look")).toBeFocused();
  });

  test("[sel-manual] a manual strip moves the focus and chooses on Space", async ({ page }) => {
    await open(page, "/components/selector");
    const dark = theme(page).getByRole("radio", { name: "Dark" });
    const system = theme(page).getByRole("radio", { name: "System" });
    await dark.focus();
    await page.keyboard.press("ArrowRight");
    await expect(system).toBeFocused();
    await expect(dark).toHaveAttribute("aria-checked", "true");
    await expect(system).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Space");
    await expect(system).toHaveAttribute("aria-checked", "true");
    await expect(dark).toHaveAttribute("aria-checked", "false");
  });

  test("[sel-many] each segment toggles on its own", async ({ page }) => {
    await open(page, "/components/selector");
    const running = shown(page).getByRole("button", { name: "Running" });
    const stopped = shown(page).getByRole("button", { name: "Stopped" });
    const paused = shown(page).getByRole("button", { name: "Paused" });
    await expect(running).toHaveAttribute("aria-pressed", "true");
    await stopped.focus();
    await page.keyboard.press("Space");
    await expect(stopped).toHaveAttribute("aria-pressed", "true");
    await running.click();
    await expect(running).toHaveAttribute("aria-pressed", "false");
    await expect(paused).toHaveAttribute("aria-pressed", "true");
  });

  test("[sel-disabled] a disabled segment is skipped and says why", async ({ page }) => {
    await open(page, "/components/selector");
    const failed = shown(page).getByRole("button", { name: "Failed" });
    await expect(failed).toBeDisabled();
    await expect(failed).toHaveAccessibleDescription("Nothing has failed");
    await shown(page).getByRole("button", { name: "Paused" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(shown(page).getByRole("button", { name: "Running" })).toBeFocused();
  });

  test("[sel-name] a hidden label stays the name and shows in the bubble", async ({ page }) => {
    await open(page, "/components/selector", { labels: "glyph" });
    const look = tab(page, "Look");
    await expect(look).toHaveCount(1);
    const shownText = await look.evaluate((b) => [...b.querySelectorAll("*")].some((e) => e.textContent === "Look"));
    expect(shownText).toBe(false);
    await centre(look);
    await look.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Look");
  });

  test("[sel-equal] pinned segments are equal and span the strip", async ({ page }) => {
    await open(page, "/components/selector");
    const boxes = await theme(page)
      .getByRole("radio")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right, width: r.width })));
    for (const b of boxes) expect(b.width).toBeCloseTo(boxes[0].width, 0);
    const track = (await theme(page).evaluate((t) => {
      const r = t.getBoundingClientRect();
      const s = getComputedStyle(t);
      return { left: r.left + parseFloat(s.paddingLeft), right: r.right - parseFloat(s.paddingRight) };
    }))!;
    expect(boxes[0].left).toBeCloseTo(track.left, 0);
    expect(boxes.at(-1)!.right).toBeCloseTo(track.right, 0);
  });

  test("[sel-colour] tabs and selectors take colours of their own", async ({ page }) => {
    await open(page, "/components/selector", { rainbow: "on" });
    const ink = (name: string) => tab(page, name).locator("svg").evaluate((s) => getComputedStyle(s).color);
    expect(await ink("Look")).not.toBe(await ink("Storage"));
    const fill = (group: ReturnType<typeof theme>, role: "radio" | "button", name: string) =>
      group.getByRole(role, { name }).evaluate((b) => getComputedStyle(b).backgroundColor);
    expect(await fill(theme(page), "radio", "Dark")).not.toBe(await fill(shown(page), "button", "Running"));
  });

  test("[tiles-role] a vertical tab list of links", async ({ page }) => {
    await open(page, "/components/selector");
    await expect(column(page)).toHaveAttribute("aria-orientation", "vertical");
    await expect(tile(page, "General")).toHaveAttribute("aria-selected", "true");
    await expect(tile(page, "General")).toHaveAttribute("aria-current", "page");
    await expect(tile(page, "Look")).not.toHaveAttribute("aria-current", /.*/);
  });

  test("[tiles-arrows] the arrows move the focus, not the page", async ({ page }) => {
    await open(page, "/components/selector");
    await tile(page, "General").focus();
    await page.keyboard.press("ArrowDown");
    await expect(tile(page, "Look")).toBeFocused();
    await page.keyboard.press("End");
    await expect(tile(page, "App")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(tile(page, "General")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(tile(page, "App")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tile(page, "General")).toBeFocused();
    await expect(tile(page, "General")).toHaveAttribute("aria-selected", "true");
  });

  test("[tiles-open] Enter and Space open the page", async ({ page }) => {
    await open(page, "/components/selector");
    const before = page.url();
    await tile(page, "General").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(tile(page, "Look")).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(tile(page, "Storage locations")).toHaveAttribute("aria-current", "page");
    await expect(stage(page, "SelectorTiles")).toContainText("The Storage locations page.");
    expect(page.url()).toBe(before);
  });

  test("[tiles-link] every tile links to its page", async ({ page }) => {
    await open(page, "/components/selector");
    await expect(tile(page, "Security")).toHaveAttribute("href", "#/settings/security");
    expect(await column(page).locator("a[href]").count()).toBe(6);
  });

  test("[tiles-glyph] glyph mode narrows the column and keeps the names", async ({ page }) => {
    await open(page, "/components/selector", { labels: "glyph" });
    // 3.25rem against 12.75rem with words.
    expect(await column(page).evaluate((c) => c.getBoundingClientRect().width)).toBeLessThan(60);
    await centre(tile(page, "Look"));
    await tile(page, "Look").focus();
    await expect(page.getByRole("tooltip")).toHaveText("Look");
  });

  test("[tiles-height] the tiles share the column's height", async ({ page }) => {
    await open(page, "/components/selector");
    const heights = await column(page)
      .getByRole("tab")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    for (const h of heights) {
      expect(h).toBeGreaterThanOrEqual(40);
      expect(h).toBeCloseTo(heights[0], 0);
    }
    const sum = heights.reduce((a, b) => a + b, 0) + 4 * (heights.length - 1);
    expect(sum).toBeCloseTo(await column(page).evaluate((c) => c.clientHeight), 0);
  });
});

test.describe("NumberField", () => {
  const field = (page: Page) => stage(page, "NumberFieldBasic").getByRole("spinbutton", { name: "Snapshots to keep" });
  const said = (page: Page) => stage(page, "NumberFieldBasic").locator("p");
  const arrows = (page: Page) => stage(page, "NumberFieldBasic").locator(".glim-num-step");

  test("[num-role] a spinbutton with its range", async ({ page }) => {
    await open(page, "/components/number-field");
    await expect(field(page)).toHaveValue("7");
    await expect(field(page)).toHaveAttribute("min", "1");
    await expect(field(page)).toHaveAttribute("max", "30");
  });

  test("[num-arrows] the arrow keys step", async ({ page }) => {
    await open(page, "/components/number-field");
    await field(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(said(page)).toHaveText("Keeps 8 snapshots.");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(said(page)).toHaveText("Keeps 6 snapshots.");
  });

  test("[num-steppers] the arrows step and keep the focus", async ({ page }) => {
    await open(page, "/components/number-field");
    await field(page).focus();
    await arrows(page).first().click();
    await expect(said(page)).toHaveText("Keeps 8 snapshots.");
    await arrows(page).last().click();
    await arrows(page).last().click();
    await expect(said(page)).toHaveText("Keeps 6 snapshots.");
    await expect(field(page)).toBeFocused();
  });

  test("[num-ends] the up arrow greys out at the maximum", async ({ page }) => {
    await open(page, "/components/number-field");
    await field(page).fill("30");
    await expect(arrows(page).first()).toBeDisabled();
    await expect(arrows(page).last()).toBeEnabled();
    await arrows(page).first().click({ force: true });
    await expect(field(page)).toHaveValue("30");
  });

  test("[num-wheel] the wheel steps a focused field", async ({ page }) => {
    await open(page, "/components/number-field");
    await field(page).focus();
    await field(page).hover();
    const top = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, -100);
    await expect(said(page)).toHaveText("Keeps 8 snapshots.");
    await page.mouse.wheel(0, 100);
    await page.mouse.wheel(0, 100);
    await expect(said(page)).toHaveText("Keeps 6 snapshots.");
    expect(await page.evaluate(() => scrollY)).toBe(top);
  });

  test("[num-wheel-hover] the wheel leaves a field without focus alone", async ({ page }) => {
    await open(page, "/components/number-field");
    await page.locator("main h1").click();
    await field(page).hover();
    await page.mouse.wheel(0, -100);
    await expect(field(page)).toHaveValue("7");
  });

  test("[num-hidden] the arrows are out of the tab order and the tree", async ({ page }) => {
    await open(page, "/components/number-field");
    await expect(stage(page, "NumberFieldBasic").locator(".glim-num-steppers")).toHaveAttribute("aria-hidden", "true");
    await field(page).focus();
    await page.keyboard.press("Tab");
    const landed = await page.evaluate(() => document.activeElement?.className ?? "");
    expect(landed).not.toContain("glim-num-step");
  });
});

test.describe("SidebarRow", () => {
  const rail = (page: Page) => stage(page, "SidebarRail").getByRole("navigation", { name: "Main" });
  const row = (page: Page, name: string | RegExp) => rail(page).getByRole("link", { name });

  test("[nav-current] the showing destination is the current page", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    await expect(row(page, "Overview")).toHaveAttribute("aria-current", "page");
    await expect(rail(page).locator('[aria-current="page"]')).toHaveCount(1);
  });

  test("[nav-enter] Enter follows the link", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    await row(page, "Restore").focus();
    await page.keyboard.press("Enter");
    await expect(row(page, "Restore")).toHaveAttribute("aria-current", "page");
    await expect(row(page, "Overview")).not.toHaveAttribute("aria-current", /.*/);
  });

  test("[nav-name] a hidden name stays the link's name", async ({ page }) => {
    await open(page, "/components/sidebar-row", { labels: "glyph" });
    await expect(row(page, "Settings")).toHaveCount(1);
    const box = await row(page, "Settings").locator(".glim-sr-only").evaluate((s) => s.getBoundingClientRect().width);
    expect(box).toBeLessThanOrEqual(1);
  });

  test("[nav-tip] the name shows in the bubble on keyboard focus", async ({ page }) => {
    await open(page, "/components/sidebar-row", { labels: "glyph" });
    await centre(row(page, "Restore"));
    await row(page, "Restore").focus();
    await expect(page.getByRole("tooltip")).toHaveText("Restore");
  });

  test("[nav-count] the count is read in words", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    await expect(row(page, "Backups 3 need attention")).toHaveCount(1);
    await expect(row(page, /Backups/).locator(".glim-nav-count")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("EmptyState", () => {
  test("[empty-text] the glyph is hidden, the words are read", async ({ page }) => {
    await open(page, "/components/empty-state");
    const first = stage(page, "EmptyStateBasic").locator(".glim-empty").first();
    await expect(first.locator(".glim-empty-glyph")).toHaveAttribute("aria-hidden", "true");
    await expect(first.locator("p")).toHaveText(["No backups yet", "Choose what to back up, and the first run starts tonight."]);
  });

  test("[empty-action] the action is a filled button", async ({ page }) => {
    await open(page, "/components/empty-state");
    const add = stage(page, "EmptyStateBasic").getByRole("button", { name: "Add a backup" });
    const ground = await add.evaluate((b) => getComputedStyle(b).backgroundColor);
    expect(ground).not.toBe("rgba(0, 0, 0, 0)");
  });
});

test.describe("SubCard", () => {
  test("[subcard-region] a region named by its title", async ({ page }) => {
    await open(page, "/components/sub-card");
    await expect(stage(page, "SubCardBasic").getByRole("region", { name: "Retention", exact: true })).toHaveCount(1);
    await expect(stage(page, "SubCardBasic").getByRole("region", { name: "Commands", exact: true })).toHaveCount(1);
  });

  test("[subcard-step] what sits inside takes the next surface", async ({ page }) => {
    await open(page, "/components/sub-card");
    const bg = (sel: string) =>
      stage(page, "SubCardBasic").locator(sel).first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const sub = await bg(".glim-subcard");
    expect(await bg(".glim-num-field")).not.toBe(sub);
    expect(await bg(".glim-btn")).not.toBe(sub);
  });
});

test.describe("Window", () => {
  const columns = (page: Page) => page.getByRole("dialog", { name: "Columns" });
  const about = (page: Page) => page.getByRole("dialog", { name: "About columns" });
  const footNames = (dialog: Locator) =>
    dialog.locator(".glim-modal-foot").getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? e.textContent?.trim()));

  async function openColumns(page: Page) {
    await open(page, "/components/window");
    const trigger = stage(page, "WindowColumns").getByRole("button", { name: "Choose columns" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(columns(page)).toBeVisible();
    return trigger;
  }

  test("[window-role] named by its notch, modal", async ({ page }) => {
    await openColumns(page);
    await expect(columns(page)).toHaveAttribute("aria-modal", "true");
  });

  test("[window-focus] focus lands on the first field, else on the forward button", async ({ page }) => {
    await openColumns(page);
    await expect(page.getByRole("searchbox", { name: "Find a column" })).toBeFocused();
    await columns(page).getByRole("button", { name: "About columns" }).click();
    await expect(about(page).getByRole("button", { name: "Got it" })).toBeFocused();
  });

  test("[window-way-out] Cancel comes first, the forward action last", async ({ page }) => {
    await openColumns(page);
    expect(await footNames(columns(page))).toEqual(["Cancel", "Reset", "Apply"]);
  });

  test("[window-own-way-out] an action that leaves gets no Cancel beside it", async ({ page }) => {
    await openColumns(page);
    await columns(page).getByRole("button", { name: "About columns" }).click();
    expect(await footNames(about(page))).toEqual(["Got it"]);
  });

  test("[window-keep] an action that returns false keeps the window", async ({ page }) => {
    await openColumns(page);
    const kind = columns(page).getByRole("checkbox", { name: "Kind" });
    await kind.click();
    await expect(kind).toHaveAttribute("aria-checked", "true");
    await columns(page).getByRole("button", { name: "Reset" }).click();
    await expect(columns(page)).toBeVisible();
    await expect(kind).toHaveAttribute("aria-checked", "false");
  });

  test("[window-escape] Escape closes only the window in front", async ({ page }) => {
    await openColumns(page);
    await columns(page).getByRole("button", { name: "About columns" }).click();
    await expect(about(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(about(page)).toHaveCount(0);
    await expect(columns(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(columns(page)).toHaveCount(0);
  });

  test("[window-trap] Tab wraps inside the window in front", async ({ page }) => {
    await openColumns(page);
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press(key);
        expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `after ${i + 1} ${key}`).toBe(true);
      }
    }
  });

  test("[window-return] focus returns to the opener", async ({ page }) => {
    const trigger = await openColumns(page);
    await page.keyboard.press("Escape");
    await expect(columns(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("[window-backdrop] a press beside the window closes it", async ({ page }) => {
    await openColumns(page);
    await page.mouse.click(8, 400);
    await expect(columns(page)).toHaveCount(0);
  });
});

test.describe("ContextMenu", () => {
  const menu = (page: Page) => page.getByRole("menu", { name: "File" });
  const sortMenu = (page: Page) => page.getByRole("menu", { name: "Sort by" });
  const last = (page: Page) => stage(page, "ContextMenuRows").locator("[data-last]");

  async function openMenu(page: Page) {
    await open(page, "/components/context-menu");
    const more = stage(page, "ContextMenuRows").getByRole("button", { name: "More" });
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toBeVisible();
    return more;
  }

  test("[menu-role] a menu of items, checkboxes and radios", async ({ page }) => {
    await openMenu(page);
    await expect(menu(page).getByRole("menuitem", { name: "Open" })).toHaveCount(1);
    await expect(menu(page).getByRole("menuitemcheckbox", { name: "Show hidden files" })).toHaveAttribute("aria-checked", "false");
    await menu(page).getByRole("menuitem", { name: "Sort by" }).hover();
    await expect(sortMenu(page).getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true");
    await expect(sortMenu(page).getByRole("menuitemradio", { name: "Size" })).toHaveAttribute("aria-checked", "false");
  });

  test("[menu-focus] focus is on the first row", async ({ page }) => {
    await openMenu(page);
    await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
  });

  test("[menu-focus-ring] opened with the pointer, the ring waits for a key", async ({ page }) => {
    const outline = (el: Locator) => el.evaluate((e) => getComputedStyle(e).outlineStyle);
    const wash = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
    const row = (name: string) => menu(page).getByRole("menuitem", { name: new RegExp(`^${name}`) });
    const more = await openMenu(page);
    expect(await outline(row("Open"))).toBe("solid");
    await page.keyboard.press("Escape");
    await expect(menu(page)).toHaveCount(0);

    await more.click();
    await expect(row("Open")).toBeFocused();
    await page.mouse.move(0, 0);
    expect(await outline(row("Open"))).toBe("none");
    expect(await wash(row("Open"))).toBe("rgba(0, 0, 0, 0)");
    await page.keyboard.press("ArrowDown");
    await expect(row("Rename")).toBeFocused();
    expect(await outline(row("Rename"))).toBe("solid");
  });

  test("[menu-arrows] the arrows skip disabled rows and wrap", async ({ page }) => {
    await openMenu(page);
    // A row is named by its label and then its key, as a desktop menu reads it.
    const row = (name: string) => menu(page).getByRole("menuitem", { name: new RegExp(`^${name}`) });
    await page.keyboard.press("ArrowDown");
    await expect(row("Rename")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(row("Sort by")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(row("Open")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(row("Downloads")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(row("Open")).toBeFocused();
  });

  test("[menu-home-end] Home and End reach the ends", async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press("End");
    await expect(menu(page).getByRole("menuitem", { name: "Downloads" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(menu(page).getByRole("menuitem", { name: "Open" })).toBeFocused();
  });

  test("[menu-pick] a choice runs, closes and hands focus back", async ({ page }) => {
    const more = await openMenu(page);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menu(page)).toHaveCount(0);
    await expect(last(page)).toContainText("Last choice: Rename");
    await expect(more).toBeFocused();
  });

  test("[menu-check] an on or off row flips and the menu stays", async ({ page }) => {
    await openMenu(page);
    const hidden = menu(page).getByRole("menuitemcheckbox", { name: "Show hidden files" });
    await hidden.focus();
    await page.keyboard.press("Enter");
    await expect(hidden).toHaveAttribute("aria-checked", "true");
    await expect(hidden).toBeFocused();
    await page.keyboard.press("Space");
    await expect(hidden).toHaveAttribute("aria-checked", "false");
    await expect(menu(page)).toBeVisible();
  });

  test("[menu-radio] a choice in a submenu is ticked and every menu closes", async ({ page }) => {
    await openMenu(page);
    await menu(page).getByRole("menuitem", { name: "Sort by" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(last(page)).toContainText("Sorted by Size");
  });

  test("[menu-sub-open] ArrowRight opens the submenu beside its row, on the body", async ({ page }) => {
    await openMenu(page);
    const host = menu(page).getByRole("menuitem", { name: "Sort by" });
    await host.focus();
    await page.keyboard.press("ArrowRight");
    await expect(sortMenu(page).getByRole("menuitemradio", { name: "Name" })).toBeFocused();
    await expect(host).toHaveAttribute("aria-expanded", "true");
    expect(await sortMenu(page).evaluate((m) => m.parentElement === document.body)).toBe(true);
    const row = (await host.boundingBox())!;
    const box = (await sortMenu(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(row.x + row.width);
  });

  test("[menu-sub-back] ArrowLeft closes the submenu and returns to its row", async ({ page }) => {
    await openMenu(page);
    const host = menu(page).getByRole("menuitem", { name: "Sort by" });
    await host.focus();
    await page.keyboard.press("ArrowRight");
    await expect(sortMenu(page)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(sortMenu(page)).toHaveCount(0);
    await expect(host).toBeFocused();
  });

  test("[menu-sub-hover] the pointer opens and closes a submenu", async ({ page }) => {
    await openMenu(page);
    await menu(page).getByRole("menuitem", { name: "Sort by" }).hover();
    await expect(sortMenu(page)).toBeVisible();
    await menu(page).getByRole("menuitem", { name: "Rename" }).hover();
    await expect(sortMenu(page)).toHaveCount(0);
  });

  test("[menu-head-edit] the pencil is a row named by its tip", async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowUp");
    await expect(menu(page).getByRole("menuitem", { name: "Edit bookmarks" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toHaveCount(0);
    await expect(last(page)).toContainText("Last choice: Edit bookmarks");
  });

  test("[menu-tidy] doubled and trailing separators are dropped", async ({ page }) => {
    await openMenu(page);
    await expect(menu(page).getByRole("separator")).toHaveCount(2);
  });

  test("[menu-escape] Escape closes every menu and hands focus back", async ({ page }) => {
    const more = await openMenu(page);
    await menu(page).getByRole("menuitem", { name: "Sort by" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(sortMenu(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(more).toBeFocused();
  });

  test("[menu-outside] a click outside closes it", async ({ page }) => {
    await openMenu(page);
    await page.locator("main h1").click();
    await expect(menu(page)).toHaveCount(0);
  });

  test("[menu-edge] the menu stays inside the window", async ({ page }) => {
    await open(page, "/components/context-menu");
    const list = stage(page, "ContextMenuRows").getByRole("list", { name: "Files" });
    await list.evaluate((el) =>
      el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: innerWidth - 4, clientY: innerHeight - 4 })),
    );
    await expect(menu(page)).toBeVisible();
    const box = (await menu(page).boundingBox())!;
    const view = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(view.width);
    expect(box.y + box.height).toBeLessThanOrEqual(view.height);
  });
});

test.describe("MenuBar", () => {
  const bar = (page: Page) => stage(page, "MenuBarDemo").getByRole("menubar", { name: "Menu" });
  const word = (page: Page, name: string) => bar(page).getByRole("menuitem", { name });
  const menuOf = (page: Page, name: string) => page.getByRole("menu", { name });

  test("[bar-role] a named menubar of words that open menus", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await expect(bar(page).getByRole("menuitem")).toHaveCount(4);
    await expect(word(page, "File")).toHaveAttribute("aria-haspopup", "menu");
    await expect(word(page, "File")).toHaveAttribute("aria-expanded", "false");
  });

  test("[bar-one-stop] the bar is one tab stop", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await expect(bar(page).locator('[tabindex="0"]')).toHaveCount(1);
    await word(page, "File").focus();
    await page.keyboard.press("Tab");
    expect(await bar(page).evaluate((b) => b.contains(document.activeElement))).toBe(false);
  });

  test("[bar-arrows] the arrows move between the words and wrap", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").focus();
    await page.keyboard.press("ArrowRight");
    await expect(word(page, "Edit")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(word(page, "Help")).toBeFocused();
  });

  test("[bar-open] ArrowDown and Enter open the menu on its first row", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").focus();
    await page.keyboard.press("ArrowDown");
    await expect(menuOf(page, "File").getByRole("menuitem", { name: "New folder" })).toBeFocused();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Enter");
    await expect(menuOf(page, "File").getByRole("menuitem", { name: "New folder" })).toBeFocused();
    await expect(word(page, "File")).toHaveAttribute("aria-expanded", "true");
  });

  test("[bar-step] left and right move to the next menu", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(menuOf(page, "File")).toHaveCount(0);
    await expect(menuOf(page, "Edit").getByRole("menuitem", { name: "Copy" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(menuOf(page, "File").getByRole("menuitem", { name: "New folder" })).toBeFocused();
  });

  test("[bar-hover] the pointer on another word opens its menu", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").click();
    await expect(menuOf(page, "File")).toBeVisible();
    await word(page, "Edit").hover();
    await expect(menuOf(page, "Edit")).toBeVisible();
    await expect(menuOf(page, "File")).toHaveCount(0);
  });

  test("[bar-toggle] a click on the open menu's word closes it", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").click();
    await expect(menuOf(page, "File")).toBeVisible();
    await word(page, "File").click();
    await expect(menuOf(page, "File")).toHaveCount(0);
  });

  test("[bar-escape] Escape closes the menu and returns to its word", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "View").click();
    await expect(menuOf(page, "View")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuOf(page, "View")).toHaveCount(0);
    await expect(word(page, "View")).toBeFocused();
  });
});

test.describe("Checkbox", () => {
  const again = (page: Page) => stage(page, "CheckboxBasic").getByRole("checkbox", { name: "Don't show again" });

  test("[check-role] checkbox with aria-checked", async ({ page }) => {
    await open(page, "/components/checkbox");
    await expect(again(page)).toHaveAttribute("aria-checked", "false");
  });

  test("[check-space] Space flips", async ({ page }) => {
    await open(page, "/components/checkbox");
    await again(page).focus();
    await page.keyboard.press("Space");
    await expect(again(page)).toHaveAttribute("aria-checked", "true");
  });

  test("[check-name] the label is the name, also hidden", async ({ page }) => {
    await open(page, "/components/checkbox");
    await expect(again(page)).toHaveCount(1);
    const write = stage(page, "CheckboxBasic").getByRole("checkbox", { name: "The owner may write" });
    await expect(write).toHaveCount(1);
    await expect(write).toHaveText("");
  });

  test("[check-slim] a slim box is the box alone, named by its label", async ({ page }) => {
    await open(page, "/components/checkbox");
    const box = stage(page, "CheckboxSlim").getByRole("checkbox", { name: "desktop.ini" });
    await expect(box).toHaveAttribute("aria-checked", "false");
    await expect(box).toHaveText("");
    expect(await box.evaluate((e) => getComputedStyle(e).paddingInlineStart)).toBe("0px");
    const size = await box.evaluate((e) => [e.getBoundingClientRect().width, (e.firstElementChild as HTMLElement).getBoundingClientRect().width]);
    expect(size[0]).toBe(size[1]);
    await box.hover();
    expect(await box.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    await box.click();
    await expect(box).toHaveAttribute("aria-checked", "true");
  });

  test("[check-disabled] a disabled box ignores clicks", async ({ page }) => {
    await open(page, "/components/checkbox");
    const name = stage(page, "CheckboxBasic").getByRole("checkbox", { name: "Name, always shown" });
    await expect(name).toBeDisabled();
    await name.click({ force: true });
    await expect(name).toHaveAttribute("aria-checked", "true");
  });
});

// A custom property as the element resolves it, through a probe inside it.
function token(el: Locator, name: string) {
  return el.evaluate((e, n) => {
    const probe = e.appendChild(document.createElement("span"));
    probe.style.color = `var(${n})`;
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, name);
}

test.describe("PasswordField", () => {
  const field = (page: Page, name: string) => stage(page, "PasswordFieldBasic").locator(`input[aria-label="${name}"]`);
  // A disabled eye sits in the box that keeps its bubble, so it is found from the wrapper.
  const eye = (page: Page, name: string) => field(page, name).locator("xpath=..").getByRole("button");

  test("[pw-hidden] hidden at first, the eye named Show", async ({ page }) => {
    await open(page, "/components/password-field");
    await expect(field(page, "Password")).toHaveAttribute("type", "password");
    await expect(eye(page, "Password")).toHaveAccessibleName("Show");
  });

  test("[pw-reveal] Enter shows, Space hides again", async ({ page }) => {
    await open(page, "/components/password-field");
    await eye(page, "Password").focus();
    await page.keyboard.press("Enter");
    await expect(field(page, "Password")).toHaveAttribute("type", "text");
    await expect(eye(page, "Password")).toHaveAccessibleName("Hide");
    await page.keyboard.press("Space");
    await expect(field(page, "Password")).toHaveAttribute("type", "password");
    await expect(eye(page, "Password")).toHaveAccessibleName("Show");
  });

  test("[pw-keep] the value stays as typed", async ({ page }) => {
    await open(page, "/components/password-field");
    await field(page, "Password").fill("hunter2 and more");
    await eye(page, "Password").click();
    await expect(field(page, "Password")).toHaveValue("hunter2 and more");
  });

  test("[pw-width] as wide as a plain field, the eye inside", async ({ page }) => {
    await open(page, "/components/password-field");
    const plain = (await field(page, "User name").boundingBox())!;
    const secret = (await field(page, "Password").boundingBox())!;
    const glyph = (await eye(page, "Password").boundingBox())!;
    expect(secret.width).toBeCloseTo(plain.width, 0);
    expect(glyph.x).toBeGreaterThan(secret.x);
    expect(glyph.x + glyph.width).toBeLessThanOrEqual(secret.x + secret.width);
  });

  test("[pw-disabled] a disabled field has a disabled eye", async ({ page }) => {
    await open(page, "/components/password-field");
    await expect(field(page, "Token")).toBeDisabled();
    await expect(eye(page, "Token")).toBeDisabled();
  });
});

test.describe("CopyField", () => {
  const value = (page: Page) => stage(page, "CopyFieldBasic").getByRole("textbox", { name: "Share address" });
  const button = (page: Page) => stage(page, "CopyFieldBasic").getByRole("button");

  test("[copy-name] a read-only field and a Copy button", async ({ page }) => {
    await open(page, "/components/copy-field");
    await expect(value(page)).toHaveAttribute("readonly", "");
    await expect(value(page)).toHaveValue("smb://bottich/media/filme");
    await expect(button(page)).toHaveAccessibleName("Copy");
  });

  test("[copy-press] Enter copies and says so", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, "/components/copy-field");
    await button(page).focus();
    await page.keyboard.press("Enter");
    await expect(button(page)).toHaveAccessibleName("Copied");
    await expect(stage(page, "CopyFieldBasic").getByRole("status")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("smb://bottich/media/filme");
  });

  test("[copy-back] the button reads Copy again", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, "/components/copy-field");
    await button(page).click();
    await expect(button(page)).toHaveAccessibleName("Copied");
    await expect(button(page)).toHaveAccessibleName("Copy", { timeout: 4000 });
  });

  test("[copy-refused] the value is selected instead", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) } });
      document.execCommand = () => false;
    });
    await open(page, "/components/copy-field");
    await button(page).click();
    await expect(value(page)).toBeFocused();
    const selected = await value(page).evaluate((e: HTMLInputElement) => e.value.slice(e.selectionStart!, e.selectionEnd!));
    expect(selected).toBe("smb://bottich/media/filme");
    await expect(button(page)).toHaveAccessibleName("Copy");
  });
});

test.describe("Meter", () => {
  const meters = (page: Page) => stage(page, "MeterLevels");

  test("[meter-role] a meter with its value and words", async ({ page }) => {
    await open(page, "/components/meter");
    const disk = meters(page).getByRole("meter", { name: "disk1" });
    await expect(disk).toHaveAttribute("aria-valuenow", "42");
    await expect(disk).toHaveAttribute("aria-valuetext", "2.3 TB free of 4 TB");
  });

  test("[meter-full] at the threshold the fill is the fault colour", async ({ page }) => {
    await open(page, "/components/meter");
    const fill = (name: string) => meters(page).getByRole("meter", { name }).locator(".glim-meter-fill");
    const fault = await token(meters(page), "--status-fail-solid");
    expect(await fill("cache").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(fault);
    expect(await fill("backups").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(fault);
    expect(await fill("disk1").evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(fault);
  });

  test("[meter-busy] without a value a busy progressbar with still stripes", async ({ page }) => {
    await open(page, "/components/meter");
    const disk = meters(page).getByRole("progressbar", { name: "disk2" });
    await expect(disk).toHaveAttribute("aria-busy", "true");
    await expect(disk).not.toHaveAttribute("aria-valuenow");
    const fill = disk.locator(".glim-meter-fill");
    expect(await fill.evaluate((e) => getComputedStyle(e).backgroundImage)).toContain("repeating-linear-gradient");
    expect(await fill.evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
  });

  test("[meter-still] nothing moves on a meter, even in a storm", async ({ page }) => {
    await open(page, "/components/meter", { motion: "storm" });
    for (const demo of ["MeterLevels", "MeterQuiet"]) {
      const moving = await stage(page, demo).evaluate((root) =>
        Array.from(root.querySelectorAll(".glim-meter-track, .glim-meter-fill")).filter(
          (e) => getComputedStyle(e).animationName !== "none" || getComputedStyle(e, "::after").animationName !== "none",
        ).length,
      );
      expect(moving).toBe(0);
    }
  });

  test("[meter-quiet] slim and grey, the accent under the pointer, red from the threshold", async ({ page }) => {
    await open(page, "/components/meter");
    const quiet = stage(page, "MeterQuiet");
    const fill = (name: string) => quiet.getByRole("meter", { name }).locator(".glim-meter-fill");
    const colour = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
    const track = quiet.getByRole("meter", { name: "holiday.mkv" });
    expect(await track.evaluate((e) => e.getBoundingClientRect().height)).toBeLessThanOrEqual(6);
    expect(await colour(fill("holiday.mkv"))).toBe(await token(quiet, "--carbon-text-muted"));
    expect(await colour(fill("photos"))).toBe(await token(quiet, "--status-fail-solid"));
    expect(await colour(fill("disk1"))).toBe(await token(quiet, "--carbon-text-muted"));
    await quiet.getByRole("button", { name: /free/ }).hover();
    expect(await colour(fill("disk1"))).toBe(await token(quiet, "--accent"));
  });

  test("[meter-tip] the words show in the bubble", async ({ page }) => {
    await open(page, "/components/meter");
    const disk = meters(page).getByRole("meter", { name: "cache" });
    await centre(disk);
    await disk.hover();
    await expect(page.getByRole("tooltip")).toHaveText("50 GB free of 1 TB");
  });
});

test.describe("ProgressBar", () => {
  const bar = (page: Page, name: string) => stage(page, "ProgressBarStates").getByRole("progressbar", { name });
  const sheen = (page: Page, name: string) =>
    bar(page, name).locator(".glim-progress-fill").evaluate((e) => getComputedStyle(e, "::after").animationName);

  test("[progress-role] a progressbar with its value", async ({ page }) => {
    await open(page, "/components/progress-bar");
    await expect(bar(page, "Copying")).toHaveAttribute("aria-valuenow", "62");
    await expect(bar(page, "Copying")).toHaveAttribute("aria-valuetext", "2.5 GB of 4 GB");
  });

  test("[progress-sheen] a sheen crosses the fill while the work runs", async ({ page }) => {
    await open(page, "/components/progress-bar");
    expect(await sheen(page, "Copying")).toBe("glim-progress-sheen");
  });

  test("[progress-still] paused, done and failed stand still", async ({ page }) => {
    await open(page, "/components/progress-bar");
    for (const name of ["Paused", "Done", "Failed"]) expect(await sheen(page, name)).toBe("none");
    const fill = (name: string) => bar(page, name).locator(".glim-progress-fill").evaluate((e) => getComputedStyle(e).backgroundColor);
    const states = stage(page, "ProgressBarStates");
    expect(await fill("Paused")).toBe(await token(states, "--status-neutral-solid"));
    expect(await fill("Failed")).toBe(await token(states, "--status-fail-solid"));
  });

  test("[progress-reduced] no sheen under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/components/progress-bar");
    expect(await sheen(page, "Copying")).toBe("none");
    expect(await bar(page, "Preparing").locator(".glim-progress-fill").evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
  });

  test("[progress-busy] without a value no aria-valuenow and a moving light", async ({ page }) => {
    await open(page, "/components/progress-bar");
    await expect(bar(page, "Preparing")).not.toHaveAttribute("aria-valuenow");
    expect(await bar(page, "Preparing").locator(".glim-progress-fill").evaluate((e) => getComputedStyle(e).animationName)).toBe("glim-indeterminate");
  });
});

test.describe("ColorPicker", () => {
  const swatch = (page: Page, name = "Label colour") => page.getByRole("button", { name, exact: true });
  const panel = (page: Page) => page.locator(".glim-picker-panel--float");
  const square = (page: Page) => panel(page).getByRole("slider", { name: "Saturation and brightness" });
  const hue = (page: Page) => panel(page).getByRole("slider", { name: "Hue" });
  const hex = (page: Page) => panel(page).getByRole("textbox", { name: "Hex" });
  const applied = (page: Page) => stage(page, "ColorPickerSwatch").locator("[data-applied]").first();

  async function openPicker(page: Page) {
    await open(page, "/components/color-picker");
    await centre(swatch(page));
    await swatch(page).click();
    await expect(panel(page)).toBeVisible();
  }

  test("[picker-role] two named sliders, the square's value the colour", async ({ page }) => {
    await openPicker(page);
    await expect(square(page)).toHaveAttribute("aria-valuetext", "#1b6b73");
    await expect(hue(page)).toHaveAttribute("aria-valuenow", /^\d+$/);
  });

  test("[picker-open] it floats beside its control, focus on the square", async ({ page }) => {
    await openPicker(page);
    await expect(square(page)).toBeFocused();
    const trigger = (await swatch(page).boundingBox())!;
    const box = (await panel(page).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(trigger.y + trigger.height);
  });

  test("[picker-arrows] the arrows move the colour, Shift further", async ({ page }) => {
    await openPicker(page);
    await page.keyboard.press("ArrowRight");
    await expect(hex(page)).not.toHaveValue("#1b6b73");
    await expect(hex(page)).toHaveValue(await square(page).getAttribute("aria-valuetext") as string);
    await hue(page).focus();
    const before = Number(await hue(page).getAttribute("aria-valuenow"));
    await page.keyboard.press("ArrowRight");
    await expect(hue(page)).toHaveAttribute("aria-valuenow", String(before + 3));
    await page.keyboard.press("Shift+ArrowRight");
    await expect(hue(page)).toHaveAttribute("aria-valuenow", String(before + 33));
  });

  test("[picker-drag] the handle follows past the edge", async ({ page }) => {
    await openPicker(page);
    const box = (await square(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 60, box.y + box.height + 60, { steps: 4 });
    await page.mouse.up();
    await expect(hex(page)).toHaveValue("#000000");
    // The handle stands on the square's far corner, though the pointer went past it.
    const corner = await square(page)
      .locator(".glim-picker-dot")
      .evaluate((dot) => [parseFloat(getComputedStyle(dot).left) - dot.parentElement!.clientWidth, parseFloat(getComputedStyle(dot).top) - dot.parentElement!.clientHeight]);
    corner.forEach((d) => expect(Math.abs(d)).toBeLessThan(0.5));
  });

  test("[picker-hex] a typed colour moves the square and the name", async ({ page }) => {
    await openPicker(page);
    await hex(page).fill("#e53935");
    await expect(square(page)).toHaveAttribute("aria-valuetext", "#e53935");
    await expect(panel(page).locator(".glim-picker-name")).toHaveText("Rot");
  });

  test("[picker-name] the nearest name in OKLab", async ({ page }) => {
    await openPicker(page);
    await expect(panel(page).locator(".glim-picker-name")).toHaveText("Petrol");
    await hex(page).fill("#2a90f5");
    await expect(panel(page).locator(".glim-picker-name")).toHaveText("Azurblau");
  });

  test("[picker-apply] Enter applies, closes and gives the focus back", async ({ page }) => {
    await openPicker(page);
    await hex(page).fill("#1e6fe0");
    await page.keyboard.press("Enter");
    await expect(panel(page)).toHaveCount(0);
    await expect(applied(page)).toHaveText("Blau #1e6fe0");
    await expect(swatch(page)).toBeFocused();
  });

  test("[picker-escape] Escape closes without applying", async ({ page }) => {
    await openPicker(page);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(panel(page)).toHaveCount(0);
    await expect(applied(page)).toHaveText("Petrol #1b6b73");
    await expect(swatch(page)).toBeFocused();
  });

  test("[picker-outside] a click beside it closes without applying", async ({ page }) => {
    await openPicker(page);
    await page.keyboard.press("ArrowUp");
    await page.locator("main h1").click();
    await expect(panel(page)).toHaveCount(0);
    await expect(applied(page)).toHaveText("Petrol #1b6b73");
  });

  test("[picker-window] over a window, Escape and Tab stay with the picker", async ({ page }) => {
    await open(page, "/components/color-picker");
    await stage(page, "ColorPickerSwatch").getByRole("button", { name: "Open in a window" }).click();
    const dialog = page.getByRole("dialog", { name: "Label" });
    await expect(dialog).toBeVisible();
    await swatch(page, "Label colour in the window").click();
    await expect(square(page)).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest(".glim-picker-panel"))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(panel(page)).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
