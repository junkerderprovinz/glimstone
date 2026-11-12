import { expect, test, type Locator, type Page } from "@playwright/test";

// Each test is named after its contract row, "[id] ...", which is how the site
// finds its result.

const SITE = "/";

// Each Playwright project runs every row against one framework's demos alone.
async function open(page: Page, path: string, look?: Record<string, unknown>) {
  if (look) await page.addInitScript((l) => localStorage.setItem("gs-docs-look", JSON.stringify(l)), look);
  await page.goto(`${SITE}#${path}?fw=${test.info().project.name}`);
  await page.locator("main h1").first().waitFor();
  const motion = look?.motion;
  if (motion) expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe(motion);
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

const hexToRgb = (hex: string) => {
  const [r, g, b] = hex.slice(1).match(/../g)!.map((h) => parseInt(h, 16));
  return `rgb(${r}, ${g}, ${b})`;
};

// Zag moves focus into an open list on the next frame; nobody types faster than that.
const listHasFocus = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('[role="listbox"], [role="menu"]'));

const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim());

test.describe("Badge", () => {
  const corner = (page: Page, text: string) =>
    stage(page, "BadgeSizes")
      .locator(".glim-badge", { hasText: text })
      .first()
      .evaluate((b) => ({ r: parseFloat(getComputedStyle(b).borderTopLeftRadius), w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height }));

  const shaped = async (page: Page, shape: string) => {
    await page.evaluate((s) => localStorage.setItem("gs-docs-look", JSON.stringify({ shape: s })), shape);
    await page.reload();
    await page.locator("main h1").first().waitFor();
  };

  test("[badge-form] each form keeps its corners under every shape setting", async ({ page }) => {
    await open(page, "/components/badge");
    for (const shape of ["soft", "square", "round"]) {
      await shaped(page, shape);
      const rounded = await corner(page, "rounded");
      expect(rounded.r).toBeCloseTo(5, 0);
      expect((await corner(page, "square")).r).toBe(0);
      const pill = await corner(page, "pill");
      expect(pill.r).toBeCloseTo(pill.h / 2, 0);
      const circle = await stage(page, "BadgeSizes").getByLabel("Done").evaluate((b) => {
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height, round: getComputedStyle(b).borderTopLeftRadius };
      });
      expect(circle.w).toBeCloseTo(circle.h, 0);
      expect(circle.round).toBe("50%");
    }
  });

  test("[badge-shape-engine] without a form the corners follow the shape setting", async ({ page }) => {
    await open(page, "/components/badge");
    await shaped(page, "square");
    expect((await corner(page, "shape setting")).r).toBe(0);
    await shaped(page, "round");
    const round = await corner(page, "shape setting");
    expect(round.r).toBeGreaterThan(5);
  });
});

test.describe("Button", () => {
  const rowDemo = (page: Page) => stage(page, "ButtonRow");
  const sizes = (page: Page) => stage(page, "ButtonCompact");
  const square = (el: Locator) => el.evaluate((b) => {
    const r = b.getBoundingClientRect();
    return Math.abs(r.width - r.height) < 1;
  });

  test("[button-compact] a square in every mode, with its name", async ({ page }) => {
    await open(page, "/components/button");
    for (const labels of ["text", "textGlyph", "glyph", "reactive"]) {
      await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify({ labels: l })), labels);
      await page.reload();
      await page.locator("main h1").waitFor();
      const jobs = sizes(page).getByRole("button", { name: "All jobs" });
      expect(await square(jobs)).toBe(true);
      await expect(jobs.locator("svg")).toBeVisible();
    }
    const jobs = sizes(page).getByRole("button", { name: "All jobs" });
    await centre(jobs);
    await jobs.hover();
    await expect(page.locator(".glim-bubble", { hasText: "All jobs" })).toBeVisible();
  });

  test("[button-compact-below] it follows the window", async ({ page }) => {
    await open(page, "/components/button");
    const find = sizes(page).getByRole("button", { name: "Find" });
    expect(await square(find)).toBe(false);
    await page.setViewportSize({ width: 800, height: 800 });
    await expect.poll(() => square(find)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => square(find)).toBe(false);
  });

  test("[button-compact-after] a compact button holds its count", async ({ page }) => {
    await open(page, "/components/button");
    const inside = await sizes(page).locator("button:has([data-count])").evaluate((b) => {
      const box = b.getBoundingClientRect();
      const count = b.querySelector("[data-count]")!.getBoundingClientRect();
      return count.left >= box.left && count.right <= box.right;
    });
    expect(inside).toBe(true);
  });

  test("[button-key] the key height", async ({ page }) => {
    await open(page, "/components/button");
    const look = await sizes(page).getByRole("button", { name: "Sign in" }).evaluate((b) => ({ h: b.getBoundingClientRect().height, g: b.querySelector("svg")!.getBoundingClientRect().width }));
    expect(look).toEqual({ h: 40, g: 16 });
  });

  test("[button-flex] the words stay whole in a tight flex row", async ({ page }) => {
    await open(page, "/components/button");
    const look = await rowDemo(page).locator("[data-tight]").evaluate((r) => {
      const label = r.querySelector(".glim-btn-label")!;
      return { whole: label.scrollWidth <= label.clientWidth, inside: r.querySelector(".glim-btn")!.getBoundingClientRect().right <= r.getBoundingClientRect().right + 0.5 };
    });
    expect(look).toEqual({ whole: true, inside: true });
  });

  test("[button-href] an href makes it a link", async ({ page }) => {
    await open(page, "/components/button");
    const link = rowDemo(page).getByRole("link", { name: "Release page" });
    await expect(link).toHaveAttribute("href", "#/guide/palette");
    await expect(link).toHaveClass(/glim-btn/);
    await expect(rowDemo(page).getByRole("button", { name: "Closed page" })).toBeDisabled();
    await expect(rowDemo(page).getByRole("link", { name: "Closed page" })).toHaveCount(0);
  });

  test("[button-slots] before and after stand around the words", async ({ page }) => {
    await open(page, "/components/button");
    const button = rowDemo(page).locator("button", { hasText: "Changes" });
    const order = await button.evaluate((b) => [...b.children].map((c) => c.getAttribute("data-slot") ?? (c.classList.contains("glim-btn-label") ? "label" : "other")));
    expect(order.filter((o) => o !== "other")).toEqual(["before", "label", "after"]);
  });

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

  test("[toggle-off-contrast] the off track holds 3:1 in the light theme", async ({ page }) => {
    await open(page, "/components/toggle", { theme: "light" });
    const ratio = await stage(page, "ToggleBasic").getByRole("switch", { name: "Play a sound" }).evaluate((t) => {
      const lum = (c: string) => {
        const [r, g, b] = c.match(/[\d.]+/g)!.map(Number).map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const contrast = (a: string, b: string) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };
      const track = getComputedStyle(t).backgroundColor;
      return {
        card: contrast(track, "rgb(255, 255, 255)"),
        knob: contrast(track, getComputedStyle(t.querySelector(".glim-toggle-thumb")!).backgroundColor),
      };
    });
    expect(ratio.card).toBeGreaterThanOrEqual(3);
    expect(ratio.knob).toBeGreaterThanOrEqual(3);
  });

  test("[toggle-attrs] an id and a data hook reach the switch, a class stays on the frame", async ({ page }) => {
    await open(page, "/components/toggle");
    await expect(stage(page, "ToggleBasic").locator("#quiet-notifications")).toHaveAttribute("role", "switch");
    await expect(stage(page, "ToggleBasic").locator('[data-hook="quiet"]')).toHaveAttribute("role", "switch");
    await expect(stage(page, "ToggleBasic").locator(".glim-toggle.demo-toggle").getByRole("switch")).toHaveCount(1);
  });

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

  const oled = (page: Page) => stage(page, "ToggleRefused").getByRole("switch", { name: "OLED" });
  const REASON = "Only with Dark or System. Light is chosen above.";
  // aria-disabled counts as disabled for Playwright's own checks, so a press goes in with force.
  const shakes = (sw: Locator) => expect.poll(() => sw.evaluate((e) => !!e.closest(".glim-toggle")?.classList.contains("glim-shake")));

  test("[toggle-refused] a refused switch keeps its state and its focus, dims its track and shakes", async ({ page }) => {
    await open(page, "/components/toggle");
    const sw = oled(page);
    await expect(sw).toHaveAttribute("aria-disabled", "true");
    await expect(sw).not.toHaveAttribute("disabled");
    expect(await sw.evaluate((e) => getComputedStyle(e).backgroundColor)).toMatch(/\/ 0\.5\)$/);
    await sw.click({ force: true });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await shakes(sw).toBe(true);
    await shakes(sw).toBe(false);
    await sw.focus();
    await page.keyboard.press("Space");
    await shakes(sw).toBe(true);
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(sw).toBeFocused();
  });

  test("[toggle-refused-tip] its bubble says why", async ({ page }) => {
    await open(page, "/components/toggle");
    const sw = oled(page);
    await centre(sw);
    await sw.hover({ force: true });
    await expect(page.locator(".glim-bubble", { hasText: REASON })).toBeVisible();
    await expect(sw).toHaveAccessibleDescription(REASON);
    await expect(stage(page, "ToggleRefused").getByText(REASON)).toBeHidden();
  });

  test("[toggle-refused-lifted] under System it flips again", async ({ page }) => {
    await open(page, "/components/toggle");
    await stage(page, "ToggleRefused").getByRole("radio", { name: "System" }).click();
    const sw = oled(page);
    await expect(sw).not.toHaveAttribute("aria-disabled");
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "false");
  });
});

test.describe("Toggle on a touch screen", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("[toggle-refused-line] the reason stands as a line under the row", async ({ page }) => {
    await open(page, "/components/toggle");
    const demo = stage(page, "ToggleRefused");
    const line = demo.getByText("Only with Dark or System. Light is chosen above.");
    await expect(line).toBeVisible();
    const row = await demo.locator(".glim-field-row-label").boundingBox();
    const sw = await demo.getByRole("switch", { name: "OLED" }).boundingBox();
    const under = await line.boundingBox();
    expect(under!.y).toBeGreaterThanOrEqual(sw!.y + sw!.height);
    expect(under!.x).toBeCloseTo(row!.x, 0);
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
    await expect.poll(() => listHasFocus(page)).toBe(true);
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
    await expect.poll(() => listHasFocus(page)).toBe(true);
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

test.describe("Select's trigger attributes", () => {
  test("[select-list-id] the open list carries its id", async ({ page }) => {
    await open(page, "/components/select");
    await stage(page, "SelectMenuRows").locator(".glim-select-trigger").first().click();
    await expect(page.locator("#demo-sort-list")).toHaveAttribute("role", "listbox");
    await page.keyboard.press("Escape");
    await stage(page, "SelectMenuRows").locator(".glim-select-trigger").last().click();
    await expect(page.locator("#demo-open-with")).toHaveAttribute("role", "menu");
  });

  test("[select-trigger-attrs] the trigger carries them and they follow", async ({ page }) => {
    await open(page, "/components/select");
    const trigger = stage(page, "SelectMenuRows").locator(".glim-select-trigger").first();
    await expect(trigger).toHaveAttribute("data-val", "name");
    await trigger.click();
    await page.getByRole("option", { name: "Kind" }).click();
    await expect(trigger).toHaveAttribute("data-val", "kind");
    await expect(stage(page, "SelectMenuRows").locator(".glim-select-trigger").last()).toHaveAttribute("data-val", "text");
  });
});

test.describe("Select in a well", () => {
  const ground = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);

  test("[select-well] the trigger takes a field's ground and hovers up", async ({ page }) => {
    await open(page, "/components/select");
    for (const place of ["[data-well]", ".glim-subcard"]) {
      const box = stage(page, "SelectWell").locator(place);
      const trigger = box.locator(".glim-select-trigger");
      expect(await ground(trigger)).toBe(await ground(box.locator(".glim-input")));
      await trigger.hover();
      await expect.poll(() => ground(trigger)).toBe(await box.locator(".glim-input").evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--carbon-hover-raised").trim()).then(hexToRgb));
      await page.mouse.move(0, 0);
    }
  });

  test("[select-closed] a closed list leaves nothing on the page", async ({ page }) => {
    await open(page, "/components/select");
    const shown = await page.locator(".glim-select-positioner").evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== "none").length);
    expect(shown).toBe(0);
  });
});

test.describe("Select with menu rows", () => {
  const sort = (page: Page) => stage(page, "SelectMenuRows").locator(".glim-select-trigger").first();
  const list = (page: Page) => page.getByRole("listbox", { name: "Sort by", exact: true });

  async function openSort(page: Page) {
    await open(page, "/components/select");
    await sort(page).focus();
    await page.keyboard.press("Enter");
    await expect(list(page)).toBeVisible();
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="listbox"]'))).toBe(true);
  }

  test("[select-menu-rows] the list draws the rows of a context menu", async ({ page }) => {
    await openSort(page);
    const name = list(page).getByRole("option", { name: "Name" });
    await expect(name).toHaveClass(/glim-menu-item/);
    await expect(name.locator(".glim-menu-glyph svg")).toBeVisible();
    await expect(name.locator(".glim-menu-label")).toHaveText("Name");
    await expect(name.locator(".glim-menu-tick")).toBeVisible();
    await expect(list(page).getByRole("option", { name: "Kind" }).locator(".glim-menu-tick")).toBeHidden();
    const ground = (row: string) => list(page).getByRole("option", { name: row }).evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await ground("Name")).not.toBe(await ground("Kind"));
  });

  test("[select-menu-keys] the keys and the choosing stay those of the select", async ({ page }) => {
    await openSort(page);
    await page.keyboard.press("k");
    await expect(list(page).locator('[role="option"][data-highlighted]')).toHaveText("Kind");
    await page.keyboard.press("Enter");
    await expect(sort(page)).toContainText("Kind");
    await expect(list(page)).toBeHidden();
    await expect(sort(page)).toBeFocused();
  });

  test("[select-menu-sub] a list with submenus draws them alike", async ({ page }) => {
    await open(page, "/components/select");
    await stage(page, "SelectMenuRows").locator(".glim-select-trigger").last().click();
    const menu = page.getByRole("menu", { name: "Open with", exact: true });
    await expect(menu).toBeVisible();
    await expect(menu.locator(".glim-menu-head")).toHaveText("Viewers");
    await expect(menu.getByRole("menuitemradio", { name: "Text" })).toHaveClass(/glim-menu-item/);
    await expect(menu.getByRole("menuitem", { name: "Other" }).locator(".glim-menu-caret")).toBeVisible();
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
    await expect.poll(() => listHasFocus(page)).toBe(true);
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
    await expect.poll(() => listHasFocus(page)).toBe(true);
    await page.keyboard.press("Escape");

    const sub = stage(page, "SelectSubmenu").locator(".glim-select-trigger");
    await centre(sub);
    await sub.focus();
    await page.keyboard.press("Enter");
    const root = page.getByRole("menu", { name: "Server time zone" });
    await expect.poll(() => root.locator(".glim-select-item[data-highlighted]").innerText()).toBe("Europe");
    await expect.poll(() => listHasFocus(page)).toBe(true);
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

test.describe("SidebarRow with slots", () => {
  const demo = (page: Page) => stage(page, "SidebarSlots");

  test("[nav-button] without an href it is a button", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    const row = demo(page).getByRole("button", { name: "Trash", exact: true });
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(demo(page).locator("output")).toHaveText("Opened Trash");
  });

  test("[nav-slots] before and after stand in the row, and the row answers", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    const row = demo(page).locator(".glim-nav-row", { hasText: "Media" });
    const order = await row.evaluate((r) => [...r.children].map((c) => (c.classList.contains("glim-nav-row-main") ? "main" : c.querySelector("[data-slot]")?.getAttribute("data-slot"))));
    expect(order).toEqual(["before", "main", "after"]);
    await row.click({ position: { x: 100, y: 8 } });
    await expect(demo(page).locator("output")).toHaveText("Opened Media");
  });

  test("[nav-slots-gap] the slot keeps a gap to the glyph in reactive mode", async ({ page }) => {
    await open(page, "/components/sidebar-row", { labels: "reactive" });
    const gap = await demo(page).locator(".glim-nav-row", { hasText: "Media" }).evaluate((r) => {
      const slot = r.querySelector("[data-slot=before]")!.getBoundingClientRect();
      const glyph = r.querySelector(".glim-nav-row-main > svg")!.getBoundingClientRect();
      return Math.round(glyph.left - slot.right);
    });
    expect(gap).toBeGreaterThan(0);
  });

  test("[nav-slots-centred] the slots stay where the words hide", async ({ page }) => {
    await open(page, "/components/sidebar-row", { labels: "glyph" });
    const row = demo(page).locator(".glim-nav-row", { hasText: "Media" });
    await expect(row).not.toHaveClass(/glim-nav-row--centred/);
    await row.getByRole("button", { name: "Unpin" }).click();
    await expect(demo(page).locator("output")).toHaveText("Unpinned 1");
  });

  for (const labels of ["textGlyph", "glyph"]) {
    test(`[nav-depth] a deep row steps in, ${labels}`, async ({ page }) => {
      await open(page, "/components/sidebar-row", { labels });
      const look = await demo(page).locator("[data-depth]").evaluateAll((rows) =>
        // The data hook lands on the row's link, inside the row.
        rows.map((link) => {
          const g = link.querySelector("svg")!.getBoundingClientRect();
          return { left: Math.round(g.left - link.closest(".glim-nav-row")!.getBoundingClientRect().left), size: Math.round(g.width * 10) / 10 };
        }),
      );
      expect(look[1].left - look[0].left).toBeGreaterThan(10);
      expect(look[2].left - look[1].left).toBeGreaterThan(10);
      expect(look[0].size).toBeLessThan(20);
    });
  }

  test("[nav-slots-press] a control in a slot does not press the row", async ({ page }) => {
    await open(page, "/components/sidebar-row");
    await demo(page).locator(".glim-nav-row", { hasText: "Media" }).getByRole("button", { name: "Unpin" }).click();
    await expect(demo(page).locator("output")).toHaveText("Unpinned 1");
  });
});

test.describe("GlyphField", () => {
  const demo = (page: Page) => stage(page, "GlyphFieldBasic");
  const box = (page: Page) => demo(page).getByRole("textbox", { name: "Filter" });

  test("[glyph-field-name] the label names it", async ({ page }) => {
    await open(page, "/components/glyph-field");
    await expect(box(page)).toHaveCount(1);
    await expect(demo(page).locator(".glim-glyph-field-glyph").first()).toHaveAttribute("aria-hidden", "true");
    await expect(demo(page).getByRole("textbox", { name: "From the row", exact: true })).toHaveCount(1);
  });

  test("[glyph-field-focus] the box steps up, without a ring", async ({ page }) => {
    await open(page, "/components/glyph-field");
    const frame = demo(page).locator(".glim-glyph-field").first();
    const ground = () => frame.evaluate((e) => getComputedStyle(e).backgroundColor);
    const rest = await ground();
    await box(page).focus();
    expect(await ground()).not.toBe(rest);
    expect(await box(page).evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("none");
    expect(await frame.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("none");
  });

  test("[glyph-field-press] a click on the glyph focuses the field", async ({ page }) => {
    await open(page, "/components/glyph-field");
    await demo(page).locator(".glim-glyph-field-glyph").first().click();
    await expect(box(page)).toBeFocused();
  });

  test("[glyph-field-after] a control after the field acts alone", async ({ page }) => {
    await open(page, "/components/glyph-field");
    await box(page).fill("report");
    await demo(page).getByRole("button", { name: "Clear" }).click();
    await expect(box(page)).toHaveValue("");
    await expect(demo(page).locator("output")).toHaveText("Cleared 1");
  });

  test("[glyph-field-attrs] attributes land on the field, a class on the box", async ({ page }) => {
    await open(page, "/components/glyph-field");
    await expect(box(page)).toHaveAttribute("data-hook", "filter");
    await expect(demo(page).locator(".glim-glyph-field.demo-filter")).toHaveCount(1);
  });
});

test.describe("GlyphTile", () => {
  const tile = (page: Page, name: string) => stage(page, "GlyphTileBasic").locator(`[data-tile="${name}"] .glim-tile`);
  const look = (el: Locator) => el.evaluate((e) => ({ ground: getComputedStyle(e).backgroundColor, ink: getComputedStyle(e).color }));

  test("[tile-look] ground and quiet", async ({ page }) => {
    await open(page, "/components/glyph-tile");
    const plain = await look(tile(page, "plain"));
    expect(plain.ground).toBe("rgba(0, 0, 0, 0)");
    const quiet = await look(tile(page, "quiet"));
    expect(quiet.ink).not.toBe(plain.ink);
    expect((await look(tile(page, "ground"))).ground).not.toBe(plain.ground);
  });

  test("[tile-active] active and reached fill with the accent", async ({ page }) => {
    await open(page, "/components/glyph-tile");
    const active = await look(tile(page, "active"));
    expect(active.ground).not.toBe("rgba(0, 0, 0, 0)");
    const reached = stage(page, "GlyphTileBasic").locator('[data-tile="reached"]');
    await reached.hover();
    await expect.poll(async () => (await look(tile(page, "reached"))).ground).toBe(active.ground);
  });

  test("[tile-hidden] hidden from screen readers", async ({ page }) => {
    await open(page, "/components/glyph-tile");
    await expect(tile(page, "plain")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("Table", () => {
  const demo = (page: Page) => stage(page, "TableBasic");
  const table = (page: Page) => demo(page).getByRole("table", { name: "Largest files" });

  test("[table-role] a real table with headers", async ({ page }) => {
    await open(page, "/components/table");
    await expect(table(page).getByRole("columnheader", { name: "Size" })).toHaveCount(1);
    await expect(table(page).getByRole("cell", { name: "holiday.mkv" })).toHaveCount(1);
  });

  test("[table-no-head] no words, no header row", async ({ page }) => {
    await open(page, "/components/table");
    await expect(demo(page).getByRole("table", { name: "Pairs" }).locator("thead")).toHaveCount(0);
  });

  test("[table-end] an end column stands at the end", async ({ page }) => {
    await open(page, "/components/table");
    const look = await table(page).getByRole("cell", { name: "2.4 GB" }).evaluate((c) => ({ align: getComputedStyle(c).textAlign, num: c.classList.contains("glim-num") }));
    expect(look).toEqual({ align: "end", num: true });
    expect(await table(page).getByRole("columnheader", { name: "Size" }).evaluate((c) => getComputedStyle(c).textAlign)).toBe("end");
  });

  test("[table-cell] the caller draws a cell", async ({ page }) => {
    await open(page, "/components/table");
    await expect(table(page).getByRole("cell", { name: "holiday.mkv" }).locator(".glim-tile")).toHaveCount(1);
  });

  test("[table-more] the more line spans the columns", async ({ page }) => {
    await open(page, "/components/table");
    await expect(table(page).getByRole("cell", { name: "And 3 more" })).toHaveAttribute("colspan", "2");
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

  test("[toast-action] the action keeps its words, runs and dismisses", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "With an action");
    const toast = page.getByRole("status").filter({ hasText: "1,204 files moved to the trash" });
    const action = toast.getByRole("button", { name: "Put them back" });
    const whole = await action.locator(".glim-btn-label").evaluate((l) => l.scrollWidth <= l.clientWidth);
    expect(whole).toBe(true);
    await action.click();
    await expect(stage(page, "ToastDemo").locator("output")).toHaveText("Put back 1");
    await expect(toast).toHaveCount(0);
  });

  test("[toast-room] the action stands under the message", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "With an action");
    const toast = page.getByRole("status").filter({ hasText: "1,204 files moved to the trash" });
    const look = await toast.evaluate(async (t) => {
      // Mid-slide the card's edges sit at fractions, and their difference picks up rounding.
      await Promise.all(t.getAnimations().map((a) => a.finished));
      const message = t.querySelector(".glim-toast-message")!.getBoundingClientRect();
      const action = t.querySelector(".glim-toast-action")!.getBoundingClientRect();
      return { card: t.getBoundingClientRect().width, under: action.top >= message.bottom, room: message.width };
    });
    expect(look.card).toBe(384);
    expect(look.under).toBe(true);
    expect(look.room).toBeGreaterThan(280);
  });

  test("[toast-path] a path breaks after a slash", async ({ page }) => {
    await open(page, "/components/toast");
    await press(page, "A long path");
    const message = page.locator(".glim-toast-message", { hasText: "/mnt/user" });
    await expect(message).toHaveText("2 files restored to /mnt/user/documents/projects/twenty-twenty-six/reports");
    const lines = await message.evaluate((m) => {
      const line = parseFloat(getComputedStyle(m).lineHeight);
      const cut = [...m.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).some((n) => {
        const r = document.createRange();
        r.selectNodeContents(n);
        return new Set([...r.getClientRects()].map((c) => Math.round(c.top))).size > 1 && !/\s/.test(n.textContent!);
      });
      return { count: Math.round(m.getBoundingClientRect().height / line), cut };
    });
    expect(lines.cut).toBe(false);
    expect(lines.count).toBeLessThanOrEqual(3);
  });

  test("[toast-phone] the page stays in view on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await open(page, "/components/toast");
    for (let i = 0; i < 4; i++) await press(page, "A long path");
    const stack = page.locator(".glim-toast-stack");
    const look = await stack.evaluate((s) => {
      const shown = [...s.children].filter((c) => getComputedStyle(c).display !== "none");
      return { shown: shown.length, height: s.getBoundingClientRect().height, width: shown[0].getBoundingClientRect().width };
    });
    expect(look.shown).toBe(2);
    expect(look.height).toBeLessThanOrEqual(700 * 0.45);
    expect(look.width).toBeGreaterThan(360);
  });

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

  // A toast on a half pixel puts every toast above it there too, and Chromium
  // rounds those edges a pixel up or down from one paint to the next.
  test("[toast-pixels] every toast stands on whole pixels", async ({ context }) => {
    test.setTimeout(120_000);
    for (const width of [1280, 390]) {
      for (const dir of ["ltr", "rtl"]) {
        for (const labels of ["text", "textGlyph", "glyph", "reactive"]) {
          const page = await context.newPage();
          await page.setViewportSize({ width, height: 860 });
          await open(page, "/components/toast", { labels });
          await page.evaluate((d) => (document.documentElement.dir = d), dir);
          for (const name of ["Success", "Warning", "Failure", "With an action", "A long path"]) await press(page, name);
          const halves = await page.locator(".glim-toast-stack").evaluate(async (s) => {
            await Promise.all(s.getAnimations({ subtree: true }).map((a) => a.finished));
            return [...s.querySelectorAll<HTMLElement>(".glim-toast-card")]
              .filter((c) => getComputedStyle(c).display !== "none")
              .flatMap((c) => {
                const r = c.getBoundingClientRect();
                return [r.top, r.height].filter((v) => v % 1 !== 0).map((v) => `${c.textContent}: ${v}`);
              });
          });
          expect(halves, `${width}px, ${dir}, ${labels}`).toEqual([]);
          await page.close();
        }
      }
    }
  });

  test("[toast-settled] a toast that has come in holds no transform", async ({ context }) => {
    const levels: [string, boolean][] = [["off", false], ["subtle", false], ["wild", false], ["storm", false], ["subtle", true], ["storm", true]];
    for (const [motion, reduce] of levels) {
      const page = await context.newPage();
      if (reduce) await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, "/components/toast", { motion });
      await press(page, "Success");
      const settled = await page.locator(".glim-toast-card").first().evaluate(async (card) => {
        await Promise.all(card.getAnimations().map((a) => a.finished));
        const pin = document.createElement("div");
        pin.style.cssText = "position: fixed; inset: 0";
        card.append(pin);
        const r = pin.getBoundingClientRect();
        pin.remove();
        const view = document.documentElement;
        return { transform: getComputedStyle(card).transform, pinnedToWindow: r.width === view.clientWidth && r.height === view.clientHeight };
      });
      expect(settled, `${motion}${reduce ? ", reduced" : ""}`).toEqual({ transform: "none", pinnedToWindow: true });
      await page.close();
    }
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
  const steps = (page: Page) => stage(page, "SelectorSteps");

  const row = (page: Page, demo: string) => stage(page, "SelectorOneRow").locator(`[data-row="${demo}"] .glim-sel`);

  // The docs page keeps its stage wide on a phone, so the demo's own box is
  // narrowed to a phone's card.
  async function narrow(page: Page) {
    await open(page, "/components/selector");
    await stage(page, "SelectorOneRow").locator("[data-row]").first().evaluate((r) => (r.parentElement!.style.width = "320px"));
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  }

  // How a strip sits: how many rows its segments take, whether it stays inside
  // its box, and for each label on screen whether it keeps to one line and
  // whether it is cut short.
  const lay = (strip: Locator) =>
    strip.evaluate((s) => {
      const segs = [...s.querySelectorAll<HTMLElement>("[data-sel-id]")];
      const labels = segs
        .map((e) => e.querySelector<HTMLElement>("[data-sel-label]"))
        .filter((l): l is HTMLElement => !!l && !l.classList.contains("glim-sr-only"));
      const box = s.parentElement!.getBoundingClientRect();
      return {
        rows: new Set(segs.map((e) => Math.round(e.getBoundingClientRect().top))).size,
        wrap: getComputedStyle(s).flexWrap,
        inside: s.getBoundingClientRect().right <= box.right + 0.5 && s.scrollWidth <= s.clientWidth,
        oneLine: labels.map((l) => l.getClientRects().length === 1 && l.scrollHeight <= l.clientHeight),
        cut: labels.map((l) => l.scrollWidth > l.clientWidth),
        shown: labels.length,
      };
    });

  for (const demo of ["labels", "glyphs", "cut"]) {
    test(`[sel-one-row] a narrow window keeps the strip on one row, ${demo}`, async ({ page }) => {
      await narrow(page);
      const look = await lay(row(page, demo));
      expect(look.rows).toBe(1);
      expect(look.wrap).toBe("nowrap");
      expect(look.inside).toBe(true);
      expect(look.oneLine).toEqual(look.oneLine.map(() => true));
    });
  }

  test("[sel-one-row] labels that fit together share the row whole", async ({ page }) => {
    await narrow(page);
    const look = await lay(row(page, "labels"));
    expect(look.shown).toBe(2);
    expect(look.cut).toEqual([false, false]);
  });

  test("[sel-one-row] a strip with a glyph on every segment shows the glyphs alone", async ({ page }) => {
    await narrow(page);
    const strip = row(page, "glyphs");
    await expect.poll(async () => (await lay(strip)).shown).toBe(0);
    const dark = strip.getByRole("radio", { name: "Always the dark theme" });
    await centre(dark);
    await dark.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Always the dark theme");
  });

  test("[sel-one-row] a label of a many strip cut short keeps its whole text in the bubble", async ({ page }) => {
    await narrow(page);
    const strip = row(page, "cut");
    await expect.poll(async () => (await lay(strip)).cut).toContain(true);
    expect((await lay(strip)).shown).toBe(3);
    const long = strip.getByRole("button", { name: "Finished in the last 30 days" });
    await centre(long);
    await long.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Finished in the last 30 days");
  });

  const box = (page: Page, demo: string) => stage(page, "SelectorOneRow").locator(`[data-row="${demo}"]`);

  // The class of the track over a run of frames, so a strip that flips
  // between its segments and its dropdown shows more than one.
  const classesOver = (strip: Locator) =>
    strip.evaluate(async (s) => {
      const seen = new Set<string>();
      for (let i = 0; i < 12; i++) {
        seen.add(s.className);
        await new Promise((done) => requestAnimationFrame(done));
      }
      return [...seen];
    });

  test("[sel-list] a strip of one whose labels do not fit becomes a dropdown of whole labels", async ({ page }) => {
    await narrow(page);
    const demo = box(page, "list");
    await expect(demo.getByRole("radiogroup")).toHaveCount(0);
    const list = demo.getByRole("combobox", { name: "Theme" });
    await expect(list).toBeVisible();
    await expect(list).toHaveText("Follow the system");
    expect(await classesOver(row(page, "list"))).toHaveLength(1);
    const edge = await demo.evaluate((d) => d.getBoundingClientRect().right);
    expect((await list.boundingBox())!.x + (await list.boundingBox())!.width).toBeLessThanOrEqual(edge + 0.5);
    await list.click();
    const options = page.getByRole("option");
    await expect(options).toHaveText(["Follow the system", "Always the light theme", "Always the dark theme"]);
    await page.getByRole("option", { name: "Always the dark theme" }).click();
    await expect(list).toHaveText("Always the dark theme");
  });

  test("[sel-list] the segments behind the dropdown take no focus and no name", async ({ page }) => {
    await narrow(page);
    const strip = row(page, "list");
    await expect(box(page, "list").getByRole("combobox")).toBeVisible();
    await expect(box(page, "list").getByRole("radio")).toHaveCount(0);
    const segs = await strip.evaluate((s) =>
      [...s.querySelectorAll<HTMLElement>("[data-sel-id]")].map((e) => ({
        hidden: e.getAttribute("aria-hidden"),
        tab: e.tabIndex,
        boxes: e.getClientRects().length,
      })),
    );
    expect(segs).toHaveLength(3);
    expect(segs).toEqual(segs.map(() => ({ hidden: "true", tab: -1, boxes: 0 })));
  });

  test("[sel-list] a strip of one comes back as segments once its labels fit", async ({ page }) => {
    await narrow(page);
    const demo = box(page, "list");
    await demo.getByRole("combobox", { name: "Theme" }).click();
    await page.getByRole("option", { name: "Always the light theme" }).click();
    await demo.evaluate((d) => (d.parentElement!.style.width = "560px"));
    const group = demo.getByRole("radiogroup", { name: "Theme" });
    await expect(group).toBeVisible();
    await expect(group.getByRole("radio", { name: "Always the light theme" })).toHaveAttribute("aria-checked", "true");
    await expect(demo.getByRole("combobox")).toHaveCount(0);
    expect(await classesOver(row(page, "list"))).toHaveLength(1);
  });

  test("[sel-list] a hugging strip of one turns into a dropdown that spans its box", async ({ page }) => {
    await narrow(page);
    const demo = box(page, "list-inline");
    const list = demo.getByRole("combobox", { name: "Theme, inline" });
    await expect(list).toBeVisible();
    const room = await demo.evaluate((d) => d.getBoundingClientRect().width);
    expect((await list.boundingBox())!.width).toBeGreaterThan(room - 2);
  });

  test("[sel-one-row] a wide window keeps the pinned widths", async ({ page }) => {
    await open(page, "/components/selector");
    const widths = await row(page, "labels")
      .getByRole("radio")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    expect(widths[0]).toBeCloseTo(widths[1], 0);
  });

  test("[sel-numeric] a numeric id comes back as a number", async ({ page }) => {
    await open(page, "/components/selector");
    await expect(steps(page).getByRole("radio", { name: "Even" })).toHaveAttribute("aria-checked", "true");
    await steps(page).getByRole("radio", { name: "Small" }).click();
    await expect(steps(page).getByRole("radio", { name: "Small" })).toHaveAttribute("aria-checked", "true");
    await expect(steps(page).locator("output")).toHaveText("Value 9, pressed 1");
  });

  test("[sel-press] a press on the chosen segment is reported and changes nothing", async ({ page }) => {
    await open(page, "/components/selector");
    await steps(page).getByRole("radio", { name: "Even" }).click();
    await expect(steps(page).locator("output")).toHaveText("Value 5, pressed 1");
    await steps(page).getByRole("radio", { name: "Even" }).focus();
    await page.keyboard.press("Space");
    await expect(steps(page).locator("output")).toHaveText("Value 5, pressed 2");
  });

  test("[sel-attrs] a segment carries the attributes its item names", async ({ page }) => {
    await open(page, "/components/selector");
    await expect(steps(page).locator('[data-level="9"]')).toHaveAttribute("role", "radio");
    await expect(steps(page).locator('[data-level="9"]')).toHaveAccessibleName("Small");
  });

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
  test("[num-focus] focus is a step up the ramp, without a ring", async ({ page }) => {
    await open(page, "/components/number-field");
    const box = page.locator("[data-demo] input[type=number]").first();
    const look = () => box.evaluate((e) => ({ outline: getComputedStyle(e).outlineStyle, ground: getComputedStyle(e).backgroundColor }));
    const rest = await look();
    await box.focus();
    const held = await look();
    expect(held.outline).toBe("none");
    expect(held.ground).not.toBe(rest.ground);
  });

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
  test("[subcard-no-title] no title, no heading, the same step", async ({ page }) => {
    await open(page, "/components/sub-card");
    const plain = stage(page, "SubCardBasic").locator(".glim-subcard:not(:has(h3))");
    await expect(plain).toHaveCount(1);
    const ground = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await ground(plain.locator(".glim-input"))).not.toBe(await ground(plain));
  });

  test("[subcard-region] a region named by its title", async ({ page }) => {
    await open(page, "/components/sub-card");
    await expect(stage(page, "SubCardBasic").getByRole("region", { name: "Retention", exact: true })).toHaveCount(1);
    await expect(stage(page, "SubCardBasic").getByRole("region", { name: "Commands", exact: true })).toHaveCount(1);
  });

  test("[subcard-notch] the title is a section badge on the top edge", async ({ page }) => {
    await open(page, "/components/sub-card");
    const sub = stage(page, "SubCardBasic").getByRole("region", { name: "Retention", exact: true });
    const badge = sub.locator(".glim-badge--notch");
    await expect(badge).toHaveText("Retention");
    const [box, notch] = [await sub.boundingBox(), await badge.boundingBox()];
    expect(Math.abs(notch!.y + notch!.height / 2 - box!.y)).toBeLessThan(1.5);
  });

  test("[subcard-end] the end of the heading's row holds the switch", async ({ page }) => {
    await open(page, "/components/sub-card");
    const sub = stage(page, "SubCardBasic").getByRole("region", { name: "Retention", exact: true });
    const [box, end, content] = [
      await sub.boundingBox(),
      await sub.getByRole("switch", { name: "Prune" }).boundingBox(),
      await sub.locator(".glim-num-field").boundingBox(),
    ];
    expect(Math.abs(box!.x + box!.width - 16 - (end!.x + end!.width))).toBeLessThan(1.5);
    expect(end!.y + end!.height).toBeLessThanOrEqual(content!.y);
  });

  test("[subcard-tiles] resting row tiles stand out from the sub-card", async ({ page }) => {
    await open(page, "/components/sub-card");
    const bg = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
    const sub = stage(page, "SubCardTiles").locator(".glim-subcard");
    const resting = sub.locator(".glim-sel-tile:not(.glim-active)").first();
    const ground = await bg(sub);
    const rest = await bg(resting);
    expect(rest).not.toBe(ground);
    await resting.hover();
    await expect.poll(() => bg(resting)).not.toBe(rest);
    expect(await bg(resting)).not.toBe(ground);
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

test.describe("Pill", () => {
  test("[pill-well] it steps up in a well, and a state keeps its wash", async ({ page }) => {
    await open(page, "/components/pill");
    const ground = (place: string, cls: string) => stage(page, "PillWell").locator(`${place} .${cls}`).first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const plain = await ground("[data-plain]", "glim-pill");
    const well = await ground("[data-well]", "glim-pill");
    const sub = await ground(".glim-subcard", "glim-pill");
    expect(well).not.toBe(plain);
    expect(sub).toBe(well);
    const washed = await ground("[data-well]", "glim-pill--ok");
    expect(washed).not.toBe(well);
    expect(washed).not.toBe(await ground("[data-plain]", "glim-pill--ok"));
  });
});

test.describe("Card", () => {
  test("[card-title-slot] markup stands in the notch", async ({ page }) => {
    await open(page, "/components/card");
    await expect(stage(page, "CardTitleSlot").locator(".glim-panel-heading [data-dot]")).toHaveCount(1);
    await expect(stage(page, "CardTitleSlot").getByRole("heading", { name: "Schedule" })).toHaveCount(1);
  });

  test("[card-title] the heading's words end with the title", async ({ page }) => {
    await open(page, "/components/card");
    const words = await stage(page, "CardBasic").locator(".glim-panel-heading").evaluate((h) => {
      const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      // A framework's empty anchors are text nodes too.
      while (walk.nextNode()) if (walk.currentNode.textContent) return walk.currentNode.textContent;
    });
    expect(words).toBe("Schedule");
  });
});

test.describe("Window", () => {
  const columns = (page: Page) => page.getByRole("dialog", { name: "Columns" });
  const move = (page: Page) => page.getByRole("dialog", { name: "Move files" });

  async function openMove(page: Page) {
    await open(page, "/components/window");
    await stage(page, "WindowHooks").getByRole("button", { name: "Move files" }).click();
    await expect(move(page)).toBeVisible();
  }

  test("[window-action-attrs] a foot button carries the attributes its action names", async ({ page }) => {
    await openMove(page);
    await expect(move(page).locator('.glim-modal-foot [data-action="move"]')).toHaveAccessibleName("Move all 1,204 files to the archive");
  });

  test("[window-title-slot] markup in the notch leaves the name alone", async ({ page }) => {
    await openMove(page);
    await expect(move(page).locator(".glim-window-title [data-count]")).toHaveText("1,204");
    await expect(page.getByRole("dialog", { name: "Move files", exact: true })).toHaveCount(1);
  });

  test("[window-card] the card element is within reach", async ({ page }) => {
    await openMove(page);
    await expect(move(page).getByText(/^\d{3,} px wide$/)).toBeVisible();
  });

  test("[window-foot-steady] foot buttons keep their words beside a long start text", async ({ page }) => {
    await openMove(page);
    const whole = await move(page).locator(".glim-modal-foot .glim-btn-label").evaluateAll((els) => els.map((e) => e.scrollWidth <= e.clientWidth));
    expect(whole).toEqual([true, true]);
  });

  for (const [name, title, count] of [["Compare", "Compare two folders", 3], ["Unsaved", "Unsaved changes", 4]] as const) {
    test(`[window-foot-one-line] ${name} stands on one line`, async ({ page }) => {
      await open(page, "/components/window");
      await stage(page, "WindowBusyFoot").getByRole("button", { name }).click();
      const buttons = page.getByRole("dialog", { name: title }).locator(".glim-modal-foot .glim-btn");
      await expect(buttons).toHaveCount(count);
      const tops = await buttons.evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
      expect(tops).toHaveLength(1);
    });
  }

  test("[window-foot-start] the start text gives way before a button wraps", async ({ page }) => {
    await open(page, "/components/window");
    await stage(page, "WindowBusyFoot").getByRole("button", { name: "Compare" }).click();
    const card = page.getByRole("dialog", { name: "Compare two folders" });
    const look = await card.evaluate((c) => {
      const foot = c.querySelector<HTMLElement>(".glim-modal-foot")!;
      const buttons = [...foot.querySelectorAll<HTMLElement>(".glim-btn")];
      const pad = parseFloat(getComputedStyle(foot).paddingLeft) + parseFloat(getComputedStyle(foot).paddingRight);
      const gap = parseFloat(getComputedStyle(foot).columnGap);
      const need = buttons.reduce((sum, b) => sum + b.getBoundingClientRect().width, 0) + gap * buttons.length;
      (c as HTMLElement).style.width = `${need + pad + 72}px`;
      (c as HTMLElement).style.maxWidth = "none";
      return [...new Set(buttons.map((b) => Math.round(b.getBoundingClientRect().top)))].length;
    });
    expect(look).toBe(1);
  });

  test("[window-foot-floor] a short word keeps the smallest floor", async ({ page }) => {
    await open(page, "/components/window");
    await stage(page, "WindowBusyFoot").getByRole("button", { name: "Unsaved" }).click();
    const width = await page.getByRole("dialog", { name: "Unsaved changes" }).getByRole("button", { name: "Keep" }).evaluate((b) => b.getBoundingClientRect().width);
    expect(width).toBe(88);
  });

  test("[window-foot-wrap] on a phone the foot buttons stay inside the card", async ({ page }) => {
    await page.setViewportSize({ width: 340, height: 700 });
    await openMove(page);
    const room = await move(page).evaluate((card) => {
      const edge = card.getBoundingClientRect().right;
      return [...card.querySelectorAll(".glim-modal-foot .glim-btn")].map((b) => {
        const label = b.querySelector(".glim-btn-label")!;
        return b.getBoundingClientRect().right <= edge && label.scrollWidth <= label.clientWidth;
      });
    });
    expect(room).toEqual([true, true]);
  });
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

  test("[menu-id] the menu carries its id", async ({ page }) => {
    await openMenu(page);
    await expect(page.locator("#demo-file-menu")).toHaveAttribute("role", "menu");
  });

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

  test("[menu-sub-id] a submenu carries the id its row names", async ({ page }) => {
    await openMenu(page);
    await menu(page).getByRole("menuitem", { name: "Sort by" }).hover();
    await expect(page.locator("#demo-sort-menu")).toHaveAttribute("role", "menu");
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

  test("[bar-id] a menu of the bar carries its id", async ({ page }) => {
    await open(page, "/components/menu-bar");
    await word(page, "File").click();
    await expect(page.locator("#demo-bar-file")).toHaveAttribute("role", "menu");
  });

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

test.describe("TextField", () => {
  const box = (page: Page, name: string) => stage(page, "TextFieldBasic").getByRole("textbox", { name, exact: true });

  test("[text-name] the label names the field", async ({ page }) => {
    await open(page, "/components/text-field");
    await expect(box(page, "Job name")).toHaveCount(1);
  });

  test("[text-model] the value follows the typing", async ({ page }) => {
    await open(page, "/components/text-field");
    await box(page, "Job name").fill("nightly");
    await expect(stage(page, "TextFieldBasic").locator("output")).toHaveText("nightly");
  });

  test("[text-width] the widths", async ({ page }) => {
    await open(page, "/components/text-field");
    const width = (name: string) => box(page, name).evaluate((e) => e.getBoundingClientRect().width);
    expect(await width("Port")).toBeCloseTo(88, 0);
    expect(await width("Job name")).toBeCloseTo(352, 0);
    expect(await width("Group")).toBeCloseTo(192, 0);
    const column = await stage(page, "TextFieldBasic").locator("[data-column]").evaluate((e) => e.getBoundingClientRect().width);
    expect(await width("Address")).toBeCloseTo(column, 0);
  });

  test("[text-attrs] attributes land on the field", async ({ page }) => {
    await open(page, "/components/text-field");
    await expect(box(page, "Port")).toHaveAttribute("data-hook", "port");
    await expect(box(page, "Port")).toHaveAttribute("maxlength", "5");
  });

  test("[text-focus] focus is a step up the ramp, without a ring", async ({ page }) => {
    await open(page, "/components/text-field");
    const look = () => box(page, "Address").evaluate((e) => ({ outline: getComputedStyle(e).outlineStyle, ground: getComputedStyle(e).backgroundColor }));
    const rest = await look();
    await box(page, "Address").focus();
    const held = await look();
    expect(held.outline).toBe("none");
    expect(held.ground).not.toBe(rest.ground);
  });

  test("[text-area] a text area is taller and grows", async ({ page }) => {
    await open(page, "/components/text-field");
    const notes = box(page, "Notes");
    await expect(notes).toHaveJSProperty("tagName", "TEXTAREA");
    const look = await notes.evaluate((e) => ({ height: e.getBoundingClientRect().height, resize: getComputedStyle(e).resize }));
    expect(look.height).toBeGreaterThan(40);
    expect(look.resize).toBe("vertical");
  });
});

test.describe("FieldRow", () => {
  const rows = (page: Page) => stage(page, "FieldRowBasic");

  test("[row-grow] a growing field takes what the label leaves", async ({ page }) => {
    await open(page, "/components/field-row");
    const gap = await rows(page).locator(".glim-field-row", { hasText: "Share link" }).evaluate((r) => {
      const name = r.querySelector(".glim-field-row-label")!.getBoundingClientRect();
      const field = r.querySelector("input")!.getBoundingClientRect();
      return { left: Math.round(field.left - name.right), right: Math.round(r.getBoundingClientRect().right - field.right) };
    });
    expect(gap).toEqual({ left: 12, right: 0 });
  });

  test("[row-many] two controls stand together at the row's end", async ({ page }) => {
    await open(page, "/components/field-row");
    const gaps = await rows(page).locator(".glim-field-row", { hasText: /^Hours/ }).evaluate((r) => {
      const [a, b] = r.querySelectorAll("input");
      return { between: Math.round(b.getBoundingClientRect().left - a.getBoundingClientRect().right), end: Math.round(r.getBoundingClientRect().right - b.getBoundingClientRect().right) };
    });
    expect(gaps).toEqual({ between: 12, end: 0 });
  });

  test("[row-name] the row names its control", async ({ page }) => {
    await open(page, "/components/field-row");
    await expect(rows(page).getByRole("textbox", { name: "Name", exact: true })).toHaveCount(1);
    await expect(rows(page).getByRole("switch", { name: "Notify", exact: true })).toHaveCount(1);
    await expect(rows(page).getByRole("radiogroup", { name: "Compression", exact: true })).toHaveCount(1);
    await expect(rows(page).getByRole("combobox", { name: "Keep", exact: true })).toHaveCount(1);
    await expect(rows(page).getByRole("spinbutton", { name: "Copies", exact: true })).toHaveCount(1);
    await expect(rows(page).locator('input[aria-label="Password"]')).toHaveCount(1);
    await expect(rows(page).getByRole("textbox", { name: "Link", exact: true })).toHaveValue("smb://bottich/media");
    await expect(rows(page).getByRole("slider", { name: "Volume", exact: true })).toHaveCount(1);
    await expect(rows(page).getByRole("combobox", { name: "Zone", exact: true })).toHaveCount(1);
    const beside = (name: string, box: string) =>
      rows(page).locator(".glim-field-row", { hasText: new RegExp(`^${name}`) }).evaluate((r, b) => r.querySelector(b)!.getBoundingClientRect().left >= r.querySelector(".glim-field-row-name")!.getBoundingClientRect().right, box);
    expect(await beside("Volume", ".glim-slider")).toBe(true);
    expect(await beside("Zone", ".glim-combobox")).toBe(true);
    const end = await rows(page).locator(".glim-field-row", { hasText: /^Volume/ }).evaluate((r) => Math.round(r.getBoundingClientRect().right - r.querySelector(".glim-slider-value")!.getBoundingClientRect().right));
    expect(end).toBe(0);
  });

  test("[row-own-name] a control's own label wins", async ({ page }) => {
    await open(page, "/components/field-row");
    await expect(rows(page).getByRole("textbox", { name: "Its own name", exact: true })).toHaveCount(1);
  });

  test("[row-press] a click on the label reaches the control", async ({ page }) => {
    await open(page, "/components/field-row");
    await rows(page).getByText("Name", { exact: true }).click();
    await expect(rows(page).getByRole("textbox", { name: "Name", exact: true })).toBeFocused();
    const notify = rows(page).getByRole("switch", { name: "Notify", exact: true });
    await expect(notify).toHaveAttribute("aria-checked", "true");
    await rows(page).getByText("Notify", { exact: true }).click();
    await expect(notify).toHaveAttribute("aria-checked", "false");
    await rows(page).getByText("Compression", { exact: true }).click();
    await expect(rows(page).getByRole("radio", { name: "Even" })).toHaveAttribute("aria-checked", "true");
  });

  test("[row-hint] the (i) stays out of the control's name", async ({ page }) => {
    await open(page, "/components/field-row");
    await expect(rows(page).locator('.glim-info-icon[aria-label="Shown in the list of jobs."]')).toHaveCount(1);
    await expect(rows(page).getByRole("textbox", { name: "Name", exact: true })).toHaveAccessibleName("Name");
  });

  test("[row-words] markup in the label leaves the name alone", async ({ page }) => {
    await open(page, "/components/field-row");
    await expect(rows(page).locator(".glim-field-row-label small")).toHaveText("optional");
    await expect(rows(page).getByRole("textbox", { name: "Token", exact: true })).toHaveCount(1);
  });

  test("[row-value] a lone value is a pill at the row's end", async ({ page }) => {
    await open(page, "/components/field-row");
    await expect(rows(page).locator(".glim-field-row .glim-pill", { hasText: "2 hours ago" })).toHaveCount(1);
    await expect(rows(page).locator(".glim-pill--fail", { hasText: "3" })).toHaveCount(1);
    const ends = await rows(page).locator(".glim-field-row", { hasText: "Last run" }).evaluate((row) => {
      const end = row.querySelector(".glim-pill")!.getBoundingClientRect().right;
      return Math.abs(end - row.getBoundingClientRect().right);
    });
    expect(ends).toBeLessThan(1);
  });

  test("[row-widths] a field keeps its width beside the label", async ({ page }) => {
    await open(page, "/components/field-row");
    const place = (name: string, field: string) =>
      rows(page).locator(".glim-field-row", { hasText: new RegExp(`^${name}`) }).evaluate((r, f) => {
        const box = r.querySelector(f)!.getBoundingClientRect();
        const name = r.querySelector(".glim-field-row-name")!.getBoundingClientRect();
        return { width: Math.round(box.width), beside: box.left >= name.right, end: Math.round(r.getBoundingClientRect().right - box.right) };
      }, field);
    expect(await place("Password", ".glim-secret")).toEqual({ width: 192, beside: true, end: 0 });
    expect(await place("Link", ".glim-copy")).toEqual({ width: 352, beside: true, end: 0 });
    expect(await place("Address", "input")).toEqual({ width: 352, beside: true, end: 0 });
  });

  test("[row-group] the names share one column", async ({ page }) => {
    await open(page, "/components/field-row");
    const group = stage(page, "FieldRowGroup");
    const lefts = await group.locator(".glim-field--grow").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
    const place = await group.locator(".glim-field-row", { hasText: /^Notify/ }).evaluate((r) => Math.round(r.getBoundingClientRect().right - r.querySelector("[role=switch]")!.getBoundingClientRect().right));
    expect(place).toBe(0);
    const hours = await group.locator(".glim-field-row", { hasText: /^Hours/ }).evaluate((r) => {
      const [a, b] = r.querySelectorAll("input");
      return Math.round(b.getBoundingClientRect().left - a.getBoundingClientRect().right);
    });
    expect(hours).toBe(12);
  });

  test("[row-group-columns] two columns line up their own names", async ({ page }) => {
    await open(page, "/components/field-row");
    const look = await stage(page, "FieldRowColumns").locator(".glim-field-row-group").evaluate((g) => {
      const left = (name: string) => {
        const r = [...g.querySelectorAll(".glim-field-row")].find((x) => x.querySelector(".glim-field-row-label")!.textContent === name)!;
        return Math.round(r.querySelector("input")!.getBoundingClientRect().left);
      };
      const wide = [...g.querySelectorAll(".glim-field-row")].find((x) => x.querySelector(".glim-field-row-label")!.textContent === "Look in")!;
      return {
        first: [left("Name"), left("Size at least")],
        second: [left("Changed"), left("Owner")],
        wide: [Math.round(wide.querySelector("input")!.getBoundingClientRect().left), Math.round(g.getBoundingClientRect().right - wide.querySelector("input")!.getBoundingClientRect().right)],
      };
    });
    expect(look.first[0]).toBe(look.first[1]);
    expect(look.second[0]).toBe(look.second[1]);
    expect(look.second[0]).toBeGreaterThan(look.first[0] + 100);
    expect(look.wide).toEqual([look.first[0], 0]);
  });

  test("[row-group-phone] on a phone the rows wrap on their own", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page, "/components/field-row");
    const row = stage(page, "FieldRowGroup").locator(".glim-field-row", { hasText: /^Replace with/ });
    const look = await row.evaluate((r) => {
      const box = r.getBoundingClientRect();
      const field = r.querySelector("input")!.getBoundingClientRect();
      return { display: getComputedStyle(r).display, inside: field.right <= box.right + 0.5 && field.left >= box.left - 0.5 };
    });
    expect(look).toEqual({ display: "flex", inside: true });
  });

  test("[row-narrow] without room the control moves under the label", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page, "/components/field-row");
    const row = rows(page).locator(".glim-field-row", { hasText: "Address" });
    const place = await row.evaluate((r) => {
      const name = r.querySelector(".glim-field-row-name")!.getBoundingClientRect();
      const field = r.querySelector("input")!.getBoundingClientRect();
      return { under: field.top >= name.bottom, end: Math.abs(field.right - r.getBoundingClientRect().right), inside: field.left >= r.getBoundingClientRect().left };
    });
    expect(place.under).toBe(true);
    expect(place.end).toBeLessThan(1);
    expect(place.inside).toBe(true);
  });
});

test.describe("PathField", () => {
  const demo = (page: Page) => stage(page, "PathFieldBasic");
  const field = (page: Page) => demo(page).getByRole("textbox", { name: "Target", exact: true });
  const button = (page: Page) => demo(page).getByRole("button", { name: "Choose a folder" });
  const picker = (page: Page) => page.getByRole("dialog", { name: "Choose a folder" });

  test("[path-name] the row names the field, its words the button", async ({ page }) => {
    await open(page, "/components/path-field");
    await expect(field(page)).toHaveValue("/mnt/user/media");
    await expect(button(page)).toHaveCount(1);
  });

  test("[path-pick] the answer lands in the field", async ({ page }) => {
    await open(page, "/components/path-field");
    await button(page).click();
    await expect(picker(page).getByRole("treeitem", { name: "media" })).toHaveAttribute("aria-selected", "true");
    await picker(page).getByRole("treeitem", { name: "archive" }).click();
    await picker(page).getByRole("button", { name: "Choose", exact: true }).click();
    await expect(field(page)).toHaveValue("/mnt/user/archive");
    await expect(field(page)).toBeFocused();
    await expect(demo(page).locator("output")).toHaveText("Picked /mnt/user/archive");
  });

  test("[path-keep] no answer leaves the field as it was", async ({ page }) => {
    await open(page, "/components/path-field");
    await button(page).click();
    await picker(page).getByRole("button", { name: "Cancel" }).click();
    await expect(field(page)).toHaveValue("/mnt/user/media");
    await expect(field(page)).toBeFocused();
  });

  test("[path-button] the button follows the label mode", async ({ page }) => {
    await open(page, "/components/path-field", { labels: "glyph" });
    const look = await button(page).evaluate((b) => ({ w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height }));
    expect(look.w).toBeCloseTo(look.h, 0);
    await page.evaluate(() => localStorage.setItem("gs-docs-look", JSON.stringify({ labels: "text" })));
    await page.reload();
    await page.locator("main h1").waitFor();
    await expect(button(page).getByText("Choose a folder")).toBeVisible();
  });

  test("[path-half] it stays beside the label in a half column", async ({ page }) => {
    await open(page, "/components/path-field");
    const row = demo(page).locator(".glim-field-row", { hasText: "Half" });
    const beside = await row.evaluate((r) => r.querySelector(".glim-path")!.getBoundingClientRect().left >= r.querySelector(".glim-field-row-name")!.getBoundingClientRect().right);
    expect(beside).toBe(true);
  });

  test("[path-width] the widths", async ({ page }) => {
    await open(page, "/components/path-field");
    const width = await demo(page).locator(".glim-field-row", { hasText: "Short" }).locator(".glim-path").evaluate((p) => Math.round(p.getBoundingClientRect().width));
    expect(width).toBe(192);
  });

  test("[path-narrow] little room leaves the glyph alone", async ({ page }) => {
    await open(page, "/components/path-field");
    const row = demo(page).locator(".glim-field-row", { hasText: /^Half/ });
    const look = await row.evaluate((r) => {
      const b = r.querySelector(".glim-btn")!.getBoundingClientRect();
      return { square: Math.abs(b.width - b.height) < 1, field: r.querySelector("input")!.getBoundingClientRect().width };
    });
    expect(look.square).toBe(true);
    expect(look.field).toBeGreaterThan(200);
    await expect(row.getByRole("button", { name: "Choose" })).toHaveCount(1);
    await expect(button(page).first().getByText("Choose a folder")).toBeVisible();
  });

  test("[path-attrs] attributes reach the field and the button", async ({ page }) => {
    await open(page, "/components/path-field");
    await expect(field(page)).toHaveAttribute("data-hook", "target");
    await expect(button(page)).toHaveAttribute("data-pick-for", "target");
  });
});

test.describe("Tree", () => {
  const tree = (page: Page) => stage(page, "TreeBasic").getByRole("tree", { name: "Folders" });
  const item = (page: Page, name: string) => tree(page).getByRole("treeitem", { name, exact: true });
  const note = (page: Page) => stage(page, "TreeBasic").locator("output");

  async function start(page: Page) {
    await open(page, "/components/tree");
    await expect(item(page, "user")).toBeVisible();
  }

  test("[tree-role] a tree of items that say their place", async ({ page }) => {
    await start(page);
    await expect(item(page, "mnt")).toHaveAttribute("aria-level", "1");
    await expect(item(page, "mnt")).toHaveAttribute("aria-expanded", "true");
    await expect(item(page, "user")).toHaveAttribute("aria-level", "2");
    await expect(item(page, "user")).toHaveAttribute("aria-expanded", "false");
    await expect(item(page, "boot")).not.toHaveAttribute("aria-expanded", /./);
  });

  test("[tree-one-stop] one tab stop on the chosen row", async ({ page }) => {
    await start(page);
    const stops = await tree(page).getByRole("treeitem").evaluateAll((rows) => rows.filter((r) => (r as HTMLElement).tabIndex === 0).map((r) => r.textContent?.trim()));
    expect(stops).toEqual(["user"]);
  });

  test("[tree-arrows] the arrows move the focus and the choice", async ({ page }) => {
    await start(page);
    await item(page, "user").focus();
    await page.keyboard.press("ArrowDown");
    await expect(item(page, "disk1")).toBeFocused();
    await expect(item(page, "disk1")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(item(page, "user")).toBeFocused();
  });

  test("[tree-right] right opens, then goes to the first child", async ({ page }) => {
    await start(page);
    await item(page, "user").focus();
    await page.keyboard.press("ArrowRight");
    await expect(item(page, "user")).toHaveAttribute("aria-expanded", "true");
    await expect(item(page, "media")).toBeVisible();
    await expect(item(page, "user")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(item(page, "media")).toBeFocused();
  });

  test("[tree-left] left closes, then goes to the parent", async ({ page }) => {
    await start(page);
    await item(page, "disk1").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(item(page, "mnt")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(item(page, "mnt")).toHaveAttribute("aria-expanded", "false");
    await expect(item(page, "disk1")).toHaveCount(0);
  });

  test("[tree-home-end] Home and End", async ({ page }) => {
    await start(page);
    await item(page, "user").focus();
    await page.keyboard.press("End");
    await expect(item(page, "boot")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item(page, "mnt")).toBeFocused();
  });

  test("[tree-type] a letter jumps", async ({ page }) => {
    await start(page);
    await item(page, "mnt").focus();
    await page.keyboard.press("b");
    await expect(item(page, "boot")).toBeFocused();
  });

  test("[tree-press] a click chooses, the chevron only opens", async ({ page }) => {
    await start(page);
    await item(page, "disk1").click();
    await expect(item(page, "disk1")).toHaveAttribute("aria-selected", "true");
    await expect(item(page, "user")).toHaveAttribute("aria-selected", "false");
    await item(page, "user").locator(".glim-tree-toggle").click();
    await expect(item(page, "user")).toHaveAttribute("aria-expanded", "true");
    await expect(item(page, "disk1")).toHaveAttribute("aria-selected", "true");
    await item(page, "boot").focus();
    await page.keyboard.press("Space");
    await expect(item(page, "boot")).toHaveAttribute("aria-selected", "true");
  });

  test("[tree-activate] Enter and a double click act on a row", async ({ page }) => {
    await start(page);
    await item(page, "boot").focus();
    await page.keyboard.press("Enter");
    await expect(note(page)).toContainText("Acted on /boot");
    await item(page, "disk1").dblclick();
    await expect(note(page)).toContainText("Acted on /mnt/disk1");
  });

  test("[tree-lazy] a list is asked for once", async ({ page }) => {
    await start(page);
    await expect(note(page)).toContainText("2 lists asked for");
    await item(page, "user").locator(".glim-tree-toggle").click();
    await expect(note(page)).toContainText("3 lists asked for");
    await item(page, "user").locator(".glim-tree-toggle").click();
    await item(page, "user").locator(".glim-tree-toggle").click();
    await expect(item(page, "media")).toBeVisible();
    await expect(note(page)).toContainText("3 lists asked for");
  });

  test("[tree-start-open] rows open from the start show their children", async ({ page }) => {
    await start(page);
    await expect(item(page, "disk1")).toBeVisible();
  });

  test("[tree-chosen-hover] the chosen row stays filled under the pointer", async ({ page }) => {
    await start(page);
    const ground = () => item(page, "user").evaluate((e) => getComputedStyle(e).backgroundColor);
    const rest = await ground();
    await item(page, "user").hover();
    await page.waitForTimeout(200);
    expect(await ground()).toBe(rest);
  });

  test("[tree-attrs] a node's attributes reach its row", async ({ page }) => {
    await start(page);
    await expect(item(page, "boot")).toHaveAttribute("data-pick", "/boot");
  });
});

test.describe("RowMark", () => {
  const marks = (page: Page) => stage(page, "RowMarkBasic").locator(".glim-rowmark");

  test("[mark-look] on fills with the accent and shows the tick", async ({ page }) => {
    await open(page, "/components/row-mark");
    const look = (at: number) =>
      marks(page).nth(at).evaluate((m) => {
        const accent = document.createElement("span");
        accent.style.color = "var(--accent)";
        m.appendChild(accent);
        const want = getComputedStyle(accent).color;
        accent.remove();
        return { ground: getComputedStyle(m).backgroundColor === want, tick: getComputedStyle(m).color };
      });
    const on = await look(0);
    const off = await look(1);
    expect(on.ground).toBe(true);
    expect(on.tick).not.toBe("rgba(0, 0, 0, 0)");
    expect(off.ground).toBe(false);
    expect(off.tick).toBe("rgba(0, 0, 0, 0)");
  });

  test("[mark-round] it reads the pill radius", async ({ page }) => {
    await open(page, "/components/row-mark");
    const radius = async (shape: string) => {
      await page.evaluate((s) => localStorage.setItem("gs-docs-look", JSON.stringify({ shape: s })), shape);
      await page.reload();
      await page.locator("main h1").waitFor();
      return marks(page).first().evaluate((m) => getComputedStyle(m).borderTopLeftRadius);
    };
    expect(await radius("square")).not.toBe(await radius("round"));
  });

  test("[mark-hidden] hidden from screen readers", async ({ page }) => {
    await open(page, "/components/row-mark");
    await expect(marks(page).first()).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("ListRow", () => {
  const demo = (page: Page) => stage(page, "ListRowBasic");
  const row = (page: Page, name: string) => demo(page).getByRole("group", { name, exact: true });
  const actions = (page: Page, name: string) => row(page, name).locator(".glim-list-row-actions");
  const shown = (el: Locator) => el.evaluate((e) => getComputedStyle(e).opacity);

  test("[list-row-rest] the buttons are out of sight at rest", async ({ page }) => {
    await open(page, "/components/list-row");
    await page.mouse.move(0, 0);
    await expect(row(page, "nightly-backup").locator(".glim-pill").first()).toBeVisible();
    await expect.poll(() => shown(actions(page, "nightly-backup"))).toBe("0");
  });

  test("[list-row-hover] the pointer brings the buttons and fills the tile", async ({ page }) => {
    await open(page, "/components/list-row");
    const tile = row(page, "nightly-backup").locator(".glim-list-row-tile");
    const ground = () => tile.evaluate((e) => getComputedStyle(e).backgroundColor);
    const rest = await ground();
    await row(page, "nightly-backup").hover();
    await expect.poll(() => shown(actions(page, "nightly-backup"))).toBe("1");
    await expect.poll(ground).not.toBe(rest);
    await actions(page, "nightly-backup").getByRole("button", { name: "Edit" }).hover();
    await expect.poll(() => shown(actions(page, "nightly-backup"))).toBe("1");
  });

  test("[list-row-focus] the focus brings the buttons", async ({ page }) => {
    await open(page, "/components/list-row");
    await row(page, "nightly-backup").focus();
    await expect.poll(() => shown(actions(page, "nightly-backup"))).toBe("1");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", "Runs at three in the morning.");
    await page.keyboard.press("Tab");
    await expect(actions(page, "nightly-backup").getByRole("button", { name: "Edit" })).toBeFocused();
  });

  test("[list-row-open] a click, Enter and Space open the row", async ({ page }) => {
    await open(page, "/components/list-row");
    await row(page, "nightly-backup").click({ position: { x: 60, y: 10 } });
    await expect(demo(page).locator("output")).toHaveText("Opened 1");
    await row(page, "nightly-backup").focus();
    await page.keyboard.press("Enter");
    await expect(demo(page).locator("output")).toHaveText("Opened 2");
    await page.keyboard.press("Space");
    await expect(demo(page).locator("output")).toHaveText("Opened 3");
  });

  test("[list-row-still] a row without a handler is no tab stop", async ({ page }) => {
    await open(page, "/components/list-row");
    await expect(row(page, "archive-copy")).not.toHaveAttribute("tabindex", /./);
  });

  test("[list-row-actions] its buttons and its (i) do not open it", async ({ page }) => {
    await open(page, "/components/list-row");
    await row(page, "nightly-backup").hover();
    await actions(page, "nightly-backup").getByRole("button", { name: "Edit" }).click();
    await row(page, "nightly-backup").locator(".glim-info-icon").click();
    await expect(demo(page).locator("output")).toHaveText("Opened 0");
  });

  test("[list-row-ellipsis] a long name ends in an ellipsis", async ({ page }) => {
    await open(page, "/components/list-row");
    const look = await demo(page).locator(".glim-list-row-title").last().evaluate((t) => ({ cut: t.scrollWidth > t.clientWidth, height: t.closest(".glim-list-row")!.getBoundingClientRect().height }));
    const other = await row(page, "nightly-backup").evaluate((r) => r.getBoundingClientRect().height);
    expect(look.cut).toBe(true);
    expect(look.height).toBe(other);
  });

  test("[list-row-narrow] below 600px the badges go", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await open(page, "/components/list-row");
    await expect(row(page, "nightly-backup").locator(".glim-list-row-badges")).toBeHidden();
  });
});

test.describe("ListRow on a touch screen", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 800, height: 800 } });

  test("[list-row-touch] the buttons stay visible", async ({ page }) => {
    await open(page, "/components/list-row");
    const actions = stage(page, "ListRowBasic").locator(".glim-list-row-actions").first();
    expect(await actions.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  });
});

test.describe("IconButton", () => {
  const demo = (page: Page) => stage(page, "IconButtonBasic");
  const copy = (page: Page) => demo(page).getByRole("button", { name: "Copy the path" });

  test("[icon-modes] a square with its glyph alone in every label mode", async ({ page }) => {
    await open(page, "/components/icon-button");
    for (const labels of ["text", "textGlyph", "glyph", "reactive"]) {
      await page.evaluate((l) => localStorage.setItem("gs-docs-look", JSON.stringify({ labels: l })), labels);
      await page.reload();
      await page.locator("main h1").waitFor();
      const look = await copy(page).evaluate((b) => ({ w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height, words: b.textContent, glyph: !!b.querySelector("svg") }));
      expect(look).toEqual({ w: 32, h: 32, words: "", glyph: true });
    }
  });

  test("[icon-pressed] the pressed state", async ({ page }) => {
    await open(page, "/components/icon-button");
    const pin = demo(page).getByRole("button", { name: "Pin" });
    await expect(pin).toHaveAttribute("aria-pressed", "false");
    const rest = await pin.evaluate((b) => getComputedStyle(b).backgroundColor);
    await pin.click();
    await page.mouse.move(0, 0);
    await expect(pin).toHaveAttribute("aria-pressed", "true");
    expect(await pin.evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe(rest);
  });

  test("[icon-href] an href makes it a link in the same square", async ({ page }) => {
    await open(page, "/components/icon-button");
    const link = demo(page).getByRole("link", { name: "Open the manual" });
    await expect(link).toHaveAttribute("href", "#/guide/palette");
    const box = await link.evaluate((b) => [b.getBoundingClientRect().width, b.getBoundingClientRect().height]);
    expect(box).toEqual([32, 32]);
  });

  test("[icon-absent] the square stays and no button is drawn", async ({ page }) => {
    await open(page, "/components/icon-button");
    const gap = demo(page).locator("[data-row] > span.glim-icon-btn-gap");
    await expect(gap).toHaveCount(1);
    await expect(demo(page).getByRole("button", { name: "Move up" })).toHaveCount(0);
    expect(await gap.evaluate((g) => g.getBoundingClientRect().width)).toBe(32);
  });

  test("[icon-name] the tip is the name", async ({ page }) => {
    await open(page, "/components/icon-button");
    await expect(copy(page)).toHaveCount(1);
  });

  test("[icon-tip] the tip shows in the bubble", async ({ page }) => {
    await open(page, "/components/icon-button");
    await centre(copy(page));
    await copy(page).hover();
    await expect(page.locator(".glim-bubble", { hasText: "Copy the path" })).toBeVisible();
  });

  test("[icon-keys] Enter and Space act", async ({ page }) => {
    await open(page, "/components/icon-button");
    await copy(page).focus();
    await page.keyboard.press("Enter");
    await expect(demo(page).locator("output")).toHaveText("Pressed 1");
    await page.keyboard.press("Space");
    await expect(demo(page).locator("output")).toHaveText("Pressed 2");
  });

  test("[icon-reach] the glyph takes the accent, the ground stays clear", async ({ page }) => {
    await open(page, "/components/icon-button");
    await page.mouse.move(0, 0);
    const look = () => copy(page).evaluate((b) => ({ ink: getComputedStyle(b).color, ground: getComputedStyle(b).backgroundColor }));
    const rest = await look();
    await centre(copy(page));
    await copy(page).hover();
    await expect.poll(async () => (await look()).ink).not.toBe(rest.ink);
    expect((await look()).ground).toBe("rgba(0, 0, 0, 0)");
  });

  test("[icon-disabled] a disabled one does nothing", async ({ page }) => {
    await open(page, "/components/icon-button");
    const off = demo(page).getByRole("button", { name: "Delete" });
    await expect(off).toBeDisabled();
    await off.click({ force: true });
    await expect(demo(page).locator("output")).toHaveText("Pressed 0");
  });
});

test.describe("PasswordField", () => {
  const field = (page: Page, name: string) => stage(page, "PasswordFieldBasic").locator(`input[aria-label="${name}"]`);
  // A disabled eye sits in the box that keeps its bubble, so it is found from the wrapper.
  const eye = (page: Page, name: string) => field(page, name).locator("xpath=..").getByRole("button");

  test("[pw-expose] the input is within reach, the eye takes attributes", async ({ page }) => {
    await open(page, "/components/password-field");
    await stage(page, "PasswordFieldBasic").getByRole("button", { name: "Focus the password" }).click();
    await expect(field(page, "Password")).toBeFocused();
    await expect(stage(page, "PasswordFieldBasic").locator('[data-hook="eye"]')).toHaveAccessibleName("Show");
  });

  test("[pw-focus] focus is a step up the ramp, without a ring", async ({ page }) => {
    await open(page, "/components/password-field");
    const box = field(page, "Password");
    const look = () => box.evaluate((e) => ({ outline: getComputedStyle(e).outlineStyle, ground: getComputedStyle(e).backgroundColor }));
    const rest = await look();
    await box.focus();
    const held = await look();
    expect(held.outline).toBe("none");
    expect(held.ground).not.toBe(rest.ground);
  });

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

test.describe("SignInCard", () => {
  const card = (page: Page, demo = "SignInCardBasic") => stage(page, demo).locator(".glim-signin-card");
  const field = (page: Page, name: string, demo?: string) => card(page, demo).getByLabel(name, { exact: true });
  const button = (page: Page, name: string, demo?: string) => card(page, demo).getByRole("button", { name, exact: true });
  const said = (page: Page) => stage(page, "SignInCardBasic").locator('[data-hook="said"]');
  const box = async (el: Locator) => (await el.boundingBox())!;
  // A token's colour as the browser computes it, to compare with a computed background.
  const token = (page: Page, name: string) =>
    page.evaluate((n) => {
      const probe = document.body.appendChild(document.createElement("div"));
      probe.style.backgroundColor = `var(${n})`;
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    }, name);
  const ground = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);

  async function openReset(page: Page, demo?: string) {
    await button(page, "Forgot password?", demo).click();
    await expect(field(page, "Code from the container log", demo)).toBeVisible();
  }

  test("[signin-head] the logo large above the centred name, no pill", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const logo = await box(card(page).locator(".glim-signin-logo"));
    const name = card(page).getByRole("heading", { level: 1, name: "GlimStone" });
    const head = await box(name);
    const frame = await box(card(page));
    expect(logo.height).toBeGreaterThanOrEqual(56);
    expect(logo.y + logo.height).toBeLessThanOrEqual(head.y);
    expect(Math.abs(logo.x + logo.width / 2 - (frame.x + frame.width / 2))).toBeLessThan(1);
    expect(await name.evaluate((e) => getComputedStyle(e).textAlign)).toBe("center");
    expect(Math.abs(head.x + head.width / 2 - (frame.x + frame.width / 2))).toBeLessThan(1);
    await expect(stage(page, "SignInCardBasic").locator(".glim-badge, .glim-eyebrow")).toHaveCount(0);
  });

  // A logo the way apps ship one: a viewBox, and no width or height unless given.
  async function setLogo(page: Page, as: "img" | "svg", [w, h]: number[], size?: number) {
    await card(page)
      .locator(".glim-signin-logo")
      .evaluate(
        async (span, { as, markup, size }) => {
          if (as === "img") {
            const img = document.createElement("img");
            img.src = `data:image/svg+xml,${encodeURIComponent(markup)}`;
            span.replaceChildren(img);
            await img.decode();
          } else {
            span.innerHTML = markup;
            if (size) for (const side of ["width", "height"]) span.firstElementChild!.setAttribute(side, String(size));
          }
        },
        { as, markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#888"/></svg>`, size },
      );
    return box(card(page).locator(`.glim-signin-logo > ${as}`));
  }

  test("[signin-logo] every logo 7.5rem tall at its own proportions", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const frame = await box(card(page));
    const own = await box(card(page).locator(".glim-signin-logo > img"));
    expect(own.height).toBeCloseTo(120, 0);
    expect(own.width).toBeCloseTo((120 * 331.5) / 172.9, 0);
    const shapes = [
      [587, 901.8],
      [1000, 1000],
      [331.5, 172.9],
    ];
    for (const as of ["img", "svg"] as const) {
      for (const [w, h] of shapes) {
        const logo = await setLogo(page, as, [w, h]);
        expect(logo.height, `${as} ${w}x${h}`).toBeCloseTo(120, 0);
        expect(logo.width, `${as} ${w}x${h}`).toBeCloseTo((120 * w) / h, 0);
        expect(Math.abs(logo.x + logo.width / 2 - (frame.x + frame.width / 2))).toBeLessThan(1);
      }
    }
    const sized = await setLogo(page, "svg", [411.74, 411.73], 64);
    expect(sized.height).toBeCloseTo(120, 0);
    expect(sized.width).toBeCloseTo(120, 0);
  });

  test("[signin-logo] a wide logo stays inside the card on a phone", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await page.setViewportSize({ width: 375, height: 812 });
    await expect.poll(async () => (await box(card(page))).width).toBeLessThan(384);
    const frame = await box(card(page));
    for (const as of ["img", "svg"] as const) {
      const logo = await setLogo(page, as, [1000, 100]);
      expect(logo.x).toBeGreaterThanOrEqual(frame.x + 32 - 0.5);
      expect(logo.x + logo.width).toBeLessThanOrEqual(frame.x + frame.width - 32 + 0.5);
    }
  });

  test("[signin-labels] each label above its field, in normal case", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const label = card(page).locator("label", { hasText: /^Password$/ });
    expect(await label.evaluate((e) => getComputedStyle(e).textTransform)).toBe("none");
    expect((await box(label)).y + (await box(label)).height).toBeLessThanOrEqual((await box(field(page, "Password"))).y);
    await openReset(page);
    for (const name of ["Code from the container log", "New password", "Confirm password"]) {
      const own = card(page).locator("label", { hasText: name });
      expect(await own.evaluate((e) => getComputedStyle(e).textTransform)).toBe("none");
      expect((await box(own)).y).toBeLessThan((await box(field(page, name))).y);
    }
  });

  test("[signin-focus] the first empty field has the focus, as a field shows it", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const password = field(page, "Password");
    await expect(password).toBeFocused();
    expect(await password.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("none");
    expect(await ground(password)).toBe(await token(page, "--carbon-surface3"));
    await expect(field(page, "Name", "SignInCardSlots")).not.toBeFocused();
  });

  test("[signin-disabled] Sign in waits for the password", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const signIn = button(page, "Sign in");
    await expect(signIn).toBeDisabled();
    await field(page, "Password").pressSequentially("l");
    await expect(signIn).toBeEnabled();
    await field(page, "Password").fill("");
    await expect(signIn).toBeDisabled();
  });

  test("[signin-wide] every button as wide as the fields", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const width = (await box(card(page).locator(".glim-secret"))).width;
    for (const name of ["Sign in", "Sign in with a passkey", "Forgot password?"]) {
      expect((await box(button(page, name))).width).toBeCloseTo(width, 0);
    }
    await openReset(page);
    for (const name of ["Set password", "Back"]) {
      expect((await box(button(page, name))).width).toBeCloseTo(width, 0);
    }
  });

  test("[signin-error] a refusal stands above Sign in", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("wrong");
    await page.keyboard.press("Enter");
    const alert = card(page).getByRole("alert");
    await expect(alert).toHaveText("That password is not right");
    expect((await box(alert)).y).toBeLessThan((await box(button(page, "Sign in"))).y);
    await expect(field(page, "Password")).toHaveValue("wrong");
  });

  test("[signin-steady] the card's top edge stays put through refusals and steps", async ({ page }) => {
    for (const viewport of [{ width: 1280, height: 860 }, { width: 375, height: 812 }]) {
      await page.setViewportSize(viewport);
      // A fresh page, since the hash alone does not reload it.
      await page.goto("about:blank");
      await open(page, "/components/sign-in-card");
      // The demo stands in the page's flow, and the real page fills the window.
      await stage(page, "SignInCardBasic").evaluate((demo) => {
        const wrap = demo.querySelector(".signin-demo")!;
        wrap.classList.remove("signin-demo");
        Object.assign(wrap.querySelector<HTMLElement>(".glim-signin")!.style, { position: "fixed", inset: "0", zIndex: "100", overflow: "auto" });
      });
      // Every top edge the card has in any frame from here on.
      await card(page).evaluate((c) => {
        const tops = new Set<number>();
        Object.assign(window, { signinTops: tops });
        const tick = () => {
          tops.add(Math.round(c.getBoundingClientRect().top * 10) / 10);
          requestAnimationFrame(tick);
        };
        tick();
      });
      const alert = card(page).getByRole("alert");
      await field(page, "Password").fill("wrong");
      await page.keyboard.press("Enter");
      await expect(alert).toHaveText("That password is not right");
      await field(page, "Password").fill("too-many");
      await page.keyboard.press("Enter");
      await expect(alert).toContainText("Too many tries");
      expect((await box(alert)).height).toBeGreaterThan(24);

      await field(page, "Password").fill("two-step");
      await page.keyboard.press("Enter");
      await expect(field(page, "Code")).toBeFocused();
      await expect(alert).toHaveCount(0);
      await field(page, "Code").fill("000000");
      await page.keyboard.press("Enter");
      await expect(alert).toHaveText("That code is not valid");
      await button(page, "Back").click();

      await openReset(page);
      await field(page, "Code from the container log").fill("ABCD-EFGH-JKLM");
      await field(page, "New password").fill("short");
      await field(page, "Confirm password").fill("short");
      await button(page, "Set password").click();
      await expect(alert).toHaveText("The new password needs at least 12 characters.");
      await button(page, "Back").click();
      await expect(field(page, "Password")).toBeVisible();
      expect(await page.evaluate(() => [...(window as typeof window & { signinTops: Set<number> }).signinTops])).toHaveLength(1);
    }
  });

  test("[signin-code] the code field after the password", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("two-step");
    await button(page, "Sign in").click();
    const code = field(page, "Code");
    await expect(code).toBeFocused();
    await expect(card(page).getByRole("alert")).toHaveCount(0);
    await expect(field(page, "Password")).toHaveValue("two-step");
    await expect(button(page, "Sign in")).toBeDisabled();
    await expect(button(page, "Forgot password?")).toHaveCount(0);
    await expect(button(page, "Sign in with a passkey")).toHaveCount(0);
    await code.fill("000000");
    await page.keyboard.press("Enter");
    await expect(card(page).getByRole("alert")).toHaveText("That code is not valid");
    await expect(code).toHaveValue("");
    await code.fill("123456");
    await page.keyboard.press("Enter");
    await expect(said(page)).toHaveText("Signed in with a code");
  });

  test("[signin-code] Back leaves the code step", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("two-step");
    await button(page, "Sign in").click();
    await button(page, "Back").click();
    await expect(field(page, "Code")).toHaveCount(0);
    await expect(button(page, "Forgot password?")).toBeVisible();
  });

  test("[signin-passkey] the passkey button only where it is offered", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const passkey = button(page, "Sign in with a passkey");
    expect((await box(passkey)).y).toBeGreaterThan((await box(button(page, "Sign in"))).y);
    await expect(button(page, "Sign in with a passkey", "SignInCardSlots")).toHaveCount(0);
    await passkey.click();
    await expect(field(page, "Code")).toBeFocused();
    await expect(field(page, "Password")).toBeHidden();
  });

  test("[signin-reset] the reset form in the same card, and back", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await openReset(page);
    await expect(field(page, "Code from the container log")).toBeFocused();
    await expect(field(page, "Password")).toHaveCount(0);
    await expect(card(page).getByRole("heading", { level: 1, name: "GlimStone" })).toBeVisible();
    await button(page, "Back").click();
    await expect(field(page, "Password")).toBeVisible();
    await expect(field(page, "Code from the container log")).toHaveCount(0);
  });

  test("[signin-reset-check] a short or mismatched password is caught before sending", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await openReset(page);
    await field(page, "Code from the container log").fill("ABCD-EFGH-JKLM");
    await field(page, "New password").fill("short");
    await field(page, "Confirm password").fill("short");
    await button(page, "Set password").click();
    await expect(card(page).getByRole("alert")).toHaveText("The new password needs at least 12 characters.");
    await field(page, "New password").fill("correct horse battery");
    await field(page, "Confirm password").fill("correct horse batterx");
    await button(page, "Set password").click();
    await expect(card(page).getByRole("alert")).toHaveText("The two passwords are not the same.");
    await expect(said(page)).toHaveText("Nothing yet");
    await field(page, "Confirm password").fill("correct horse battery");
    await button(page, "Set password").click();
    await expect(said(page)).toHaveText("Password set");
  });

  test("[signin-slots] the app's fields above the password, its actions under Sign in", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const demo = "SignInCardSlots";
    const y = async (el: Locator) => (await box(el)).y;
    expect(await y(field(page, "Name", demo))).toBeLessThan(await y(field(page, "Password", demo)));
    expect(await y(card(page, demo).getByRole("switch", { name: "Stay signed in" }))).toBeLessThan(await y(field(page, "Password", demo)));
    const extra = button(page, "Sign in with Authentik", demo);
    expect(await y(extra)).toBeGreaterThan(await y(button(page, "Sign in", demo)));
    expect(await y(extra)).toBeLessThan(await y(button(page, "Forgot password?", demo)));
    expect((await box(extra)).width).toBeCloseTo((await box(button(page, "Sign in", demo))).width, 0);
  });

  test("[signin-step] the app's own step under the same head", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    const demo = "SignInCardSlots";
    await openReset(page, demo);
    await field(page, "Code from the container log", demo).fill("ABCD-EFGH-JKLM");
    await field(page, "New password", demo).fill("correct horse battery");
    await field(page, "Confirm password", demo).fill("correct horse battery");
    await button(page, "Set password", demo).click();
    await expect(card(page, demo).getByRole("status")).toHaveText(/Your new password is set/);
    await expect(card(page, demo).getByRole("heading", { level: 1, name: "GlimStone" })).toBeVisible();
    await expect(button(page, "Set password", demo)).toHaveCount(0);
  });

  test("[signin-theme] the page and the card follow the system theme", async ({ page }) => {
    const seen: string[] = [];
    for (const colorScheme of ["dark", "light"] as const) {
      await page.emulateMedia({ colorScheme });
      await open(page, "/components/sign-in-card");
      const surface = await ground(card(page));
      expect(await ground(stage(page, "SignInCardBasic").locator(".glim-signin"))).toBe(await token(page, "--carbon-bg"));
      expect(surface).toBe(await token(page, "--carbon-surface"));
      seen.push(surface);
    }
    expect(seen[0]).not.toBe(seen[1]);
  });

  test("[signin-theme] OLED puts the page on black and the card one step down", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await open(page, "/components/sign-in-card", { oled: true });
    expect(await ground(stage(page, "SignInCardBasic").locator(".glim-signin"))).toBe("rgb(0, 0, 0)");
    expect(await ground(card(page))).toBe(hexToRgb("#161616"));
  });

  test("[signin-width] 24rem wide, a phone's width less 16px either side", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    expect((await box(card(page))).width).toBeCloseTo(384, 0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(async () => (await box(card(page))).width).toBeLessThan(384);
    const frame = await box(stage(page, "SignInCardBasic").locator(".glim-signin"));
    const narrow = await box(card(page));
    expect(narrow.width).toBeCloseTo(frame.width - 32, 0);
    expect(narrow.x - frame.x).toBeCloseTo(16, 0);
  });
});

test.describe("SignInCard refusals and engines", () => {
  const card = (page: Page) => stage(page, "SignInCardBasic").locator(".glim-signin-card");
  const field = (page: Page, name: string) => card(page).getByLabel(name, { exact: true });
  const button = (page: Page, name: string) => card(page).getByRole("button", { name, exact: true });
  const shaking = (el: Locator) => expect.poll(() => el.evaluate((e) => e.classList.contains("glim-shake")));
  const selected = (el: Locator) => el.evaluate((e: HTMLInputElement) => e.selectionStart === 0 && e.selectionEnd === e.value.length && e.value.length > 0);
  // Every transform the button wears while a refused password comes back.
  const movesOnRefusal = (page: Page) =>
    card(page).evaluate((c) => {
      // Found again on every frame, since the busy bubble wraps the button in a new node.
      const button = () => c.querySelector<HTMLButtonElement>('[data-signin="submit"]')!;
      const seen = new Set<string>();
      const start = performance.now();
      return new Promise<string[]>((done) => {
        const tick = () => {
          seen.add(getComputedStyle(button()).transform);
          if (performance.now() - start < 900) requestAnimationFrame(tick);
          else done([...seen].filter((t) => t !== "none"));
        };
        button().click();
        tick();
      });
    });
  const tokenStyle = (page: Page, prop: string, value: string) =>
    page.evaluate(
      ([p, v]) => {
        const probe = document.body.appendChild(document.createElement("div"));
        probe.style.setProperty(p, v);
        const out = getComputedStyle(probe).getPropertyValue(p);
        probe.remove();
        return out;
      },
      [prop, value],
    );

  test("[signin-shake] a refused password shakes Sign in and selects the password", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("wrong");
    await page.keyboard.press("Enter");
    await shaking(button(page, "Sign in")).toBe(true);
    await expect(card(page).getByRole("alert")).toHaveText("That password is not right");
    await expect(field(page, "Password")).toBeFocused();
    expect(await selected(field(page, "Password"))).toBe(true);
  });

  test("[signin-shake] a refused code shakes Sign in and takes the code field", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("two-step");
    await page.keyboard.press("Enter");
    await expect(field(page, "Code")).toBeFocused();
    expect(await button(page, "Sign in").evaluate((e) => e.classList.contains("glim-shake"))).toBe(false);
    await field(page, "Code").fill("000000");
    await page.keyboard.press("Enter");
    await shaking(button(page, "Sign in")).toBe(true);
    await expect(field(page, "Code")).toBeFocused();
  });

  test("[signin-shake] a refused new password shakes Set password", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await button(page, "Forgot password?").click();
    await field(page, "Code from the container log").fill("ABCD-EFGH-JKLM");
    await field(page, "New password").fill("correct horse battery");
    await field(page, "Confirm password").fill("correct horse batterx");
    await page.keyboard.press("Enter");
    await shaking(button(page, "Set password")).toBe(true);
    await expect(field(page, "Confirm password")).toBeFocused();
    expect(await selected(field(page, "Confirm password"))).toBe(true);
  });

  test("[signin-still] the shake moves at the default motion", async ({ page }) => {
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("wrong");
    expect((await movesOnRefusal(page)).length).toBeGreaterThan(0);
  });

  test("[signin-still] nothing moves with motion off", async ({ page }) => {
    await open(page, "/components/sign-in-card", { motion: "off" });
    await field(page, "Password").fill("wrong");
    expect(await movesOnRefusal(page)).toEqual([]);
    await expect(card(page).getByRole("alert")).toHaveText("That password is not right");
  });

  test("[signin-still] nothing moves under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/components/sign-in-card");
    await field(page, "Password").fill("wrong");
    expect(await movesOnRefusal(page)).toEqual([]);
    await expect(card(page).getByRole("alert")).toHaveText("That password is not right");
  });

  test("[signin-engines] Sign in wears the accent", async ({ page }) => {
    await open(page, "/components/sign-in-card", { accent: "#4DABF7" });
    await field(page, "Password").fill("x");
    expect(await button(page, "Sign in").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(77, 171, 247)");
  });

  test("[signin-engines] the card, fields and buttons take the shape", async ({ context }) => {
    const radii: Record<string, string[]> = {};
    for (const shape of ["round", "square"]) {
      // A page of its own per shape, since the look is read when the page loads.
      const page = await context.newPage();
      await open(page, "/components/sign-in-card", { shape });
      const radius = (el: Locator) => el.evaluate((e) => getComputedStyle(e).borderTopLeftRadius);
      const seen = [await radius(card(page)), await radius(field(page, "Password")), await radius(button(page, "Sign in"))];
      expect(seen).toEqual([
        await tokenStyle(page, "border-top-left-radius", "var(--radius-card)"),
        await tokenStyle(page, "border-top-left-radius", "var(--radius-control)"),
        await tokenStyle(page, "border-top-left-radius", "var(--radius-pill)"),
      ]);
      radii[shape] = seen;
    }
    expect(radii.square).not.toEqual(radii.round);
  });
});

test.describe("useDragArmed", () => {
  const tiles = (page: Page) => stage(page, "DragArmedTiles").getByRole("list");
  const rows = (page: Page) => stage(page, "DragArmedRows").getByRole("list");
  const item = (list: Locator, name: string) => list.getByRole("listitem").filter({ hasText: name });

  async function hold(list: Locator, name: string) {
    const held = item(list, name);
    await centre(held);
    const box = (await held.boundingBox())!;
    await list.page().mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await list.page().mouse.down();
  }

  // The largest turn of each tile over a few frames, longer than a beat at every level.
  const turns = (list: Locator) =>
    list.evaluate(async (l) => {
      const most: Record<string, number> = {};
      for (let frame = 0; frame < 16; frame++) {
        for (const tile of l.children) {
          const name = tile.textContent!.trim();
          most[name] = Math.max(most[name] ?? 0, Math.abs(parseFloat(getComputedStyle(tile).rotate) || 0));
        }
        await new Promise((done) => requestAnimationFrame(done));
      }
      return most;
    });

  // How far the top edge of each item's box travels over a whole cycle of its
  // animation, read by seeking it while paused. Frames watched for a while can
  // miss a swing: an alternating beat goes three quarters of its cycle without
  // reaching one extreme, and the first frames after the start stand still.
  const travel = (list: Locator) =>
    list.evaluate((l) =>
      Object.fromEntries(
        [...l.children].map((row) => {
          const tops = [row.getBoundingClientRect().top];
          for (const a of row.getAnimations()) {
            const { duration, direction } = a.effect!.getTiming();
            const cycle = Number(duration) * (direction?.startsWith("alternate") ? 2 : 1);
            const at = a.currentTime;
            a.pause();
            for (let step = 0; step <= 64; step++) {
              a.currentTime = (cycle * step) / 64;
              tops.push(row.getBoundingClientRect().top);
            }
            a.currentTime = at;
            a.play();
          }
          return [row.textContent!.trim(), Math.max(...tops) - Math.min(...tops)];
        }),
      ),
    );

  const animations = (list: Locator) =>
    list.evaluate((l) => Object.fromEntries([...l.children].map((i) => [i.textContent!.trim(), getComputedStyle(i).animationName])));

  const othersTremble = async (list: Locator, held: string) => {
    const seen = await turns(list);
    expect(seen[held]).toBe(0);
    for (const [name, turn] of Object.entries(seen)) if (name !== held) expect(turn, name).toBeGreaterThan(0.5);
  };

  test("[drag-wiggle] the others tremble while one is held", async ({ page }) => {
    await open(page, "/engines/motion");
    await hold(tiles(page), "Mail");
    await othersTremble(tiles(page), "Mail");
    const delays = await tiles(page).evaluate((l) => [...l.children].slice(1).map((t) => getComputedStyle(t).animationDelay));
    expect(new Set(delays).size).toBeGreaterThan(1);
    await page.mouse.up();
    expect(Object.values(await turns(tiles(page)))).toEqual([0, 0, 0, 0, 0, 0]);
  });

  test("[drag-wiggle-rerender] the tremble outlasts the list's own class", async ({ page }) => {
    await open(page, "/engines/motion");
    await hold(tiles(page), "Music");
    await page.mouse.move(0, 0, { steps: 4 });
    await expect(tiles(page)).toHaveClass(/is-moving/);
    await othersTremble(tiles(page), "Music");
  });

  // Each level's beat in ms and row lift in px from tokens.css, read back before
  // measuring so a variant cannot run at another level. Compared as numbers,
  // since the built stylesheet writes 100ms as .1s.
  const ROW_DIALS = { wild: [120, 1.5], subtle: [140, 1], storm: [100, 2] } as const;

  for (const motion of ["wild", "subtle", "storm"] as const) {
    test(`[drag-wiggle-rows] full-width rows tremble with the row wiggle at ${motion}`, async ({ page }) => {
      await open(page, "/engines/motion", { motion });
      await hold(rows(page), "debian-13.iso");
      const dials = await item(rows(page), "podcast-episode-212.mp3").evaluate((r) => {
        const dur = getComputedStyle(r).getPropertyValue("--motion-wiggle-dur").trim();
        const lift = getComputedStyle(r).getPropertyValue("--motion-row-tremble-lift").trim();
        return [parseFloat(dur) * (dur.endsWith("ms") ? 1 : 1000), parseFloat(lift)];
      });
      expect(dials).toEqual(ROW_DIALS[motion]);
      const names = await animations(rows(page));
      expect(names["debian-13.iso"]).toBe("none");
      for (const [name, animation] of Object.entries(names)) if (name !== "debian-13.iso") expect(animation, name).toBe("glim-row-wiggle");
      const seen = await travel(rows(page));
      for (const [name, moved] of Object.entries(seen)) if (name !== "debian-13.iso") expect(moved, name).toBeGreaterThanOrEqual(1.5);
      expect(Math.max(...Object.values(seen))).toBeLessThan(6);
      await page.mouse.up();
      expect(Object.values(await animations(rows(page)))).toEqual(Array(5).fill("none"));
    });
  }

  for (const marker of ["aria-grabbed", "data-held"]) {
    test(`[drag-wiggle-held] an item marked ${marker}="true" stays still`, async ({ page }) => {
      await open(page, "/engines/motion");
      for (const [list, held, marked] of [
        [tiles(page), "Mail", "Notes"],
        [rows(page), "debian-13.iso", "firmware-v4.bin"],
      ] as const) {
        await hold(list, held);
        await item(list, marked).evaluate((el, m) => el.setAttribute(m, "true"), marker);
        expect((await animations(list))[marked]).toBe("none");
        expect((await travel(list))[marked]).toBe(0);
        await item(list, marked).evaluate((el, m) => el.removeAttribute(m), marker);
        await page.mouse.up();
      }
    });
  }

  test("[drag-drop-edge] an item passes its neighbour once its leading edge crosses the neighbour's middle", async ({ page }) => {
    await open(page, "/engines/motion");
    for (const [list, axis] of [
      [tiles(page), "x"],
      [rows(page), "y"],
    ] as const) {
      const names = () => list.getByRole("listitem").allTextContents();
      const [first, second, ...rest] = await names();
      await centre(item(list, first));
      const held = (await item(list, first).boundingBox())!;
      const next = (await item(list, second).boundingBox())!;
      // How far the held item's leading edge is from the next one's middle.
      const reach = axis === "x" ? next.x + next.width / 2 - (held.x + held.width) : next.y + next.height / 2 - (held.y + held.height);
      // Pressed by its trailing edge, so the pointer is still over the item
      // when its leading edge is already past the neighbour's middle.
      const x = axis === "x" ? held.x + 4 : held.x + held.width / 2;
      const y = axis === "y" ? held.y + 4 : held.y + held.height / 2;
      for (const [by, order] of [
        [reach - 6, [first, second, ...rest]],
        [reach + 6, [second, first, ...rest]],
      ] as const) {
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(axis === "x" ? x + by : x, axis === "y" ? y + by : y, { steps: 4 });
        await page.mouse.up();
        expect(await names()).toEqual(order);
      }
    }
  });

  for (const [what, look, reduce] of [
    ["with motion off", { motion: "off" }, false],
    ["under reduced motion", undefined, true],
  ] as const) {
    test(`[drag-wiggle-still] nothing trembles ${what}`, async ({ page }) => {
      if (reduce) await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, "/engines/motion", look);
      await hold(tiles(page), "Mail");
      await expect(item(tiles(page), "Mail")).toHaveClass(/glim-drag-lift/);
      expect(Object.values(await turns(tiles(page)))).toEqual([0, 0, 0, 0, 0, 0]);
      await page.mouse.up();
      await hold(rows(page), "debian-13.iso");
      await expect(item(rows(page), "debian-13.iso")).toHaveClass(/glim-drag-lift/);
      expect(Object.values(await travel(rows(page)))).toEqual([0, 0, 0, 0, 0]);
    });
  }
});
