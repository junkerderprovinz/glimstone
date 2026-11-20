import { expect, test, type Locator, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

const picker = (page: Page) => page.getByRole("dialog", { name: "Add a channel" });
const search = (page: Page) => picker(page).getByRole("searchbox", { name: "Search services" });
const tiles = (page: Page) => picker(page).locator(".glim-provider-pick button.glim-readme-btn");
const names = (page: Page) => tiles(page).evaluateAll((all) => all.map((b) => b.getAttribute("aria-label")));
const added = (page: Page) => stage(page, "PickerWindowChannels").locator("output");

async function show(page: Page) {
  await open(page, "/components/picker-window");
  await stage(page, "PickerWindowChannels").getByRole("button", { name: "Add a channel" }).click();
  await expect(picker(page)).toBeVisible();
}

test.describe("PickerWindow", () => {
  test("[picker-dialog] a dialog named by its notch, the search focused and only the way out in its foot", async ({ page }) => {
    await show(page);
    await expect(picker(page)).toHaveAttribute("aria-modal", "true");
    await expect(search(page)).toBeFocused();
    await expect(picker(page).locator(".glim-modal-foot button")).toHaveText(["Close"]);
    await expect(picker(page).locator(".glim-window-title .glim-info-icon")).toHaveCount(1);
  });

  test("[picker-groups] each group under its eyebrow in the order given, alphabetical, the catch-all last", async ({ page }) => {
    await show(page);
    const sections = await picker(page)
      .locator(".glim-pick-section")
      .evaluateAll((all) =>
        all.map((s) => ({
          title: s.querySelector(".glim-eyebrow")?.textContent,
          names: [...s.querySelectorAll("button.glim-readme-btn")].map((b) => b.getAttribute("aria-label")),
        })),
      );
    expect(sections).toEqual([
      { title: "Services", names: ["Apprise", "Discord", "Gotify", "Healthchecks.io", "Matrix", "ntfy", "Shoutrrr", "Slack"] },
      { title: "Email and webhooks", names: ["Email SMTP", "Webhook"] },
    ]);
  });

  test("[picker-tiles] every tile is a button named by its label, with its mark and its hint in a bubble", async ({ page }) => {
    await show(page);
    const count = await tiles(page).count();
    expect(count).toBe(10);
    for (let i = 0; i < count; i++) {
      const tile = tiles(page).nth(i);
      await expect(tile).toHaveAttribute("type", "button");
      await expect(tile.locator(".glim-readme-btn-mark svg")).toHaveCount(1);
    }
    // Every tile but the webhook's, which carries a tooltip instead.
    await expect(picker(page).locator(".glim-provider-pick li .glim-readme-btn-hint .glim-info-icon")).toHaveCount(count - 1);
    await expect(picker(page)).not.toContainText("Pushes each message");
  });

  test("[picker-lit] a brand's tile fills with its own colour under the pointer, any other with the accent", async ({ page }) => {
    await show(page);
    const fill = async (name: string) => {
      const tile = picker(page).getByRole("button", { name, exact: true });
      await tile.hover();
      return tile.evaluate((b) => getComputedStyle(b).backgroundColor);
    };
    expect(await fill("Discord")).toBe("rgb(88, 101, 242)");
    expect(await fill("Gotify")).toBe("rgb(113, 202, 238)");
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--accent)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    expect(await fill("Email SMTP")).toBe(accent);
  });

  test("[picker-search] the search narrows every group at once, by name, id and own words, and the window keeps its height", async ({ page }) => {
    await show(page);
    const height = await picker(page).evaluate((card) => card.getBoundingClientRect().height);
    await search(page).fill("mail");
    await expect.poll(() => names(page)).toEqual(["Email SMTP"]);
    await search(page).fill("smtp");
    await expect.poll(() => names(page)).toEqual(["Email SMTP"]);
    await search(page).fill("pushover");
    await expect.poll(() => names(page)).toEqual(["Shoutrrr"]);
    expect(await picker(page).evaluate((card) => card.getBoundingClientRect().height)).toBeCloseTo(height, 0);
    await expect(picker(page).locator(".glim-eyebrow")).toHaveText(["Services"]);
  });

  test("[picker-none] a query that matches nothing is answered with one sentence", async ({ page }) => {
    await show(page);
    await search(page).fill("carrier pigeon");
    await expect(tiles(page)).toHaveCount(0);
    await expect(picker(page).locator(".glim-pick-none")).toHaveText("Nothing matches “carrier pigeon”. A webhook reaches almost anything.");
  });

  test("[picker-pick] a click or Enter on the one tile left hands its id over", async ({ page }) => {
    await show(page);
    await picker(page).getByRole("button", { name: "Gotify", exact: true }).click();
    await expect(picker(page)).toBeHidden();
    await expect(added(page)).toHaveText("Added: Gotify");
    await stage(page, "PickerWindowChannels").getByRole("button", { name: "Add a channel" }).click();
    await search(page).fill("slack");
    await expect.poll(() => names(page)).toEqual(["Slack"]);
    await search(page).press("Enter");
    await expect(picker(page)).toBeHidden();
    await expect(added(page)).toHaveText("Added: Gotify, Slack");
  });

  test("[picker-arrows] the arrows go from the search into the grid, across it, and back up to the search", async ({ page }) => {
    await show(page);
    const focused = () => page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    await search(page).press("ArrowDown");
    expect(await focused()).toBe("Apprise");
    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe("Discord");
    await page.keyboard.press("ArrowDown");
    const below = await focused();
    const column = async (name: string) =>
      picker(page).getByRole("button", { name, exact: true }).evaluate((b) => Math.round(b.getBoundingClientRect().left));
    expect(await column(below!)).toBe(await column("Discord"));
    await page.keyboard.press("End");
    expect(await focused()).toBe("Webhook");
    await page.keyboard.press("Home");
    expect(await focused()).toBe("Apprise");
    await page.keyboard.press("ArrowUp");
    await expect(search(page)).toBeFocused();
  });

  test("[picker-form] a form after the pick takes the tiles' place, with Cancel, Back and Save in the foot", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    const chooser = page.getByRole("dialog", { name: "Connect a service" });
    await chooser.getByRole("searchbox", { name: "Search services" }).fill("got");
    await chooser.getByRole("button", { name: "Gotify", exact: true }).click();
    const form = page.getByRole("dialog", { name: "Gotify" });
    const address = form.getByRole("textbox", { name: "Address" });
    await expect(address).toBeFocused();
    await expect(form.locator(".glim-field-row-label")).toHaveText("Address");
    await expect(form.locator(".glim-provider-pick")).toHaveCount(0);
    await expect(form.locator(".glim-modal-foot button")).toHaveText(["Cancel", "Back", "Test connection", "Save"]);
    await form.getByRole("button", { name: "Back" }).click();
    const again = page.getByRole("dialog", { name: "Connect a service" });
    await expect(again.getByRole("searchbox", { name: "Search services" })).toHaveValue("got");
    await expect(again.locator(".glim-provider-pick button.glim-readme-btn")).toHaveAccessibleName("Gotify");
    await again.getByRole("button", { name: "Gotify", exact: true }).click();
    await page.getByRole("dialog", { name: "Gotify" }).getByRole("textbox", { name: "Address" }).fill("https://push.example.org");
    await page.getByRole("dialog", { name: "Gotify" }).getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(stage(page, "PickerWindowForm").locator("output")).toHaveText("Saved: Gotify at https://push.example.org");
  });

  test("[picker-sub] a tile's second line names what kind of thing it is, under the pointer", async ({ page }) => {
    await show(page);
    const email = picker(page).getByRole("button", { name: "Email SMTP", exact: true });
    await expect(email.locator(".glim-readme-btn-name")).toHaveText("Email");
    await expect(email.locator(".glim-readme-btn-sub")).toHaveText("SMTP");
  });

  test("[picker-tip] a tile with a tooltip shows it under the pointer and carries no (i)", async ({ page }) => {
    await show(page);
    const webhook = picker(page).getByRole("button", { name: "Webhook", exact: true });
    await expect(webhook.locator("xpath=ancestor::li").locator(".glim-info-icon")).toHaveCount(0);
    await webhook.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Any address that takes a request");
  });

  test("[picker-search-clear] the search empties with a button of its own, and the browser's is hidden", async ({ page }) => {
    await show(page);
    const clear = picker(page).getByRole("button", { name: "Clear the search" });
    await expect(clear).toHaveCount(0);
    await search(page).fill("slack");
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
    await expect(tiles(page)).toHaveCount(10);
    expect(await search(page).evaluate((el) => getComputedStyle(el).textOverflow)).toBe("ellipsis");
    // Chromium draws a clear button of its own and computes no style for it, so the rule that hides it is read instead.
    test.skip(test.info().project.use.browserName !== "chromium", "Only Chromium draws its own clear button");
    const hidden = await page.evaluate(() => {
      const rules = (list: CSSRuleList): CSSRule[] => [...list].flatMap((r) => ("cssRules" in r ? [r, ...rules((r as CSSGroupingRule).cssRules)] : [r]));
      return [...document.styleSheets]
        .flatMap((sheet) => rules(sheet.cssRules))
        .some((r) => r instanceof CSSStyleRule && r.selectorText.includes(".glim-pick-search") && r.selectorText.includes("search-cancel-button") && r.style.display === "none");
    });
    expect(hidden).toBe(true);
  });

  test("[picker-name-descenders] a tile's name keeps the descenders of g, p and y inside its box", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowIdentity").getByRole("button", { name: "Add single sign-on" }).click();
    const window = page.getByRole("dialog", { name: "Add single sign-on" });
    await expect(window).toBeVisible();
    const cut = await window.locator(".glim-readme-btn-name").evaluateAll((all) =>
      all.filter((el) => el.scrollHeight > el.clientHeight).map((el) => el.textContent),
    );
    expect(cut).toEqual([]);
  });

  test("[picker-search-fits] a long placeholder ends in an ellipsis inside the field rather than being cut", async ({ page }) => {
    await show(page);
    const field = picker(page).locator(".glim-pick-search");
    const box = await field.boundingBox();
    const card = await picker(page).boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(card!.x + card!.width);
    await search(page).evaluate((el) => ((el as HTMLInputElement).placeholder = "Speicher und Clouds durchsuchen, auch die ganz entlegenen"));
    expect(await search(page).evaluate((el) => getComputedStyle(el).textOverflow)).toBe("ellipsis");
  });

  test("[picker-form-backdrop] a press beside the form leaves it open, a press beside the tiles closes the window", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    await page.getByRole("dialog", { name: "Gotify" }).getByRole("textbox", { name: "Address" }).fill("https://push.example.org");
    await page.mouse.click(8, 8);
    await expect(page.getByRole("dialog", { name: "Gotify" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Gotify" }).getByRole("textbox", { name: "Address" })).toHaveValue("https://push.example.org");
    await page.getByRole("dialog").getByRole("button", { name: "Back" }).click();
    await page.mouse.click(8, 8);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("[picker-form-width] the form narrows to a form's width around the same middle", async ({ page }) => {
    await open(page, "/components/picker-window", { motion: "off" });
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    const tilesBox = (await page.getByRole("dialog").boundingBox())!;
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    await expect.poll(async () => (await page.getByRole("dialog", { name: "Gotify" }).boundingBox())!.width).toBeLessThan(tilesBox.width - 64);
    const formBox = (await page.getByRole("dialog", { name: "Gotify" }).boundingBox())!;
    expect(formBox.x + formBox.width / 2).toBeCloseTo(tilesBox.x + tilesBox.width / 2, 0);
  });

  test("[picker-hue] a picker opened from a card wears the card's rainbow colour", async ({ page }) => {
    await open(page, "/components/picker-window", { rainbow: "on" });
    const opener = stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" });
    const cardAccent = await opener.evaluate((el) => getComputedStyle(el).getPropertyValue("--accent").trim());
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveClass(/glim-hue/);
    expect(await dialog.evaluate((el) => getComputedStyle(el).getPropertyValue("--accent").trim())).toBe(cardAccent);
  });

  test("[window-action-state] a foot button runs with a ring, keeps its width, and turns green when it worked", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    const form = page.getByRole("dialog", { name: "Gotify" });
    await form.getByRole("textbox", { name: "Address" }).fill("https://push.example.org");
    const button = form.getByRole("button", { name: "Test connection" });
    const width = (await button.boundingBox())!.width;
    await button.click();
    await expect(button).toHaveAttribute("aria-busy", "true");
    expect((await button.boundingBox())!.width).toBeCloseTo(width, 0);
    await expect(button).not.toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveClass(/glim-btn--ok/);
    await expect(form).toBeVisible();
    await form.getByRole("textbox", { name: "Address" }).fill("http://plain.example.org");
    await button.click();
    await expect(button).toHaveClass(/glim-btn--danger/);
  });

  test("[picker-form-scroll] a form scrolls inside the window like any window's body, and the tiles hold their height", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    const body = page.getByRole("dialog").locator(".glim-window-body");
    expect(await body.evaluate((el) => getComputedStyle(el).overflowY)).toBe("hidden");
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    const formBody = page.getByRole("dialog", { name: "Gotify" }).locator(".glim-window-body");
    expect(await formBody.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
  });

  test("[picker-start] the foot's start line carries what the app puts there, such as a test's verdict", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    const form = page.getByRole("dialog", { name: "Gotify" });
    await expect(form.locator(".glim-window-start")).toHaveCount(0);
    await form.getByRole("textbox", { name: "Address" }).fill("https://push.example.org");
    await form.getByRole("button", { name: "Test connection" }).click();
    await expect(form.locator(".glim-modal-foot > .glim-window-start")).toHaveText("Reached");
  });

  test("[picker-start-empty] an empty start line leaves no element, and the buttons share one line", async ({ page }) => {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowForm").getByRole("button", { name: "Connect a service" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Gotify", exact: true }).click();
    const form = page.getByRole("dialog", { name: "Gotify" });
    await expect(form.locator(".glim-modal-foot .glim-btn")).toHaveCount(4);
    await expect(form.locator(".glim-window-start")).toHaveCount(0);
    // Read through the picker's data hook: evaluateAll under a named dialog crashes Firefox.
    const rows = await page.locator('[data-glim="PickerWindow"] .glim-modal-foot .glim-btn').evaluateAll((all) => new Set(all.map((b) => Math.round(b.getBoundingClientRect().top))).size);
    expect(rows).toBe(1);
  });

  test("[picker-escape] Escape empties the search first and closes the window from an empty one", async ({ page }) => {
    await show(page);
    await search(page).fill("slack");
    await search(page).press("Escape");
    await expect(search(page)).toHaveValue("");
    await expect(picker(page)).toBeVisible();
    await expect(tiles(page)).toHaveCount(10);
    await search(page).press("Escape");
    await expect(picker(page)).toBeHidden();
  });

  test("a mark keeps its own colours at rest, and a black one turns white on the dark tile", async ({ page }) => {
    const fills = async () =>
      picker(page)
        .getByRole("button", { name: "Matrix", exact: true })
        .locator("svg")
        .first()
        .evaluate((svg) => getComputedStyle(svg).fill);
    const opener = () => stage(page, "PickerWindowChannels").getByRole("button", { name: "Add a channel" });
    await open(page, "/components/picker-window");
    await relook(page, { theme: "light" });
    await opener().click();
    expect(await fills()).toBe("rgb(0, 0, 0)");
    await relook(page, { theme: "dark" });
    await opener().click();
    expect(await fills()).toBe("rgb(255, 255, 255)");
  });
});

test.describe("PickerWindow states", () => {
  const places = (page: Page) => page.getByRole("dialog", { name: "Choose a place" });
  const focused = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label"));

  async function showPlaces(page: Page) {
    await open(page, "/components/picker-window");
    await stage(page, "PickerWindowStates").getByRole("button", { name: "Choose a place" }).click();
    await expect(places(page)).toBeVisible();
  }

  test("[picker-group-badge] a group's badge and its (i) stand in the eyebrow's line", async ({ page }) => {
    await showPlaces(page);
    // Firefox's content process crashes on evaluateAll under a dialog found by its name, so the window's own marker finds it.
    const lines = await page
      .locator('[data-glim="PickerWindow"] .glim-pick-section')
      .evaluateAll((all) =>
        all.map((s) => {
          const eyebrow = s.querySelector(".glim-eyebrow")!.getBoundingClientRect();
          const badge = s.querySelector('[data-glim="Badge"]');
          const box = badge?.getBoundingClientRect();
          return {
            title: s.querySelector(".glim-eyebrow")?.textContent,
            badge: badge?.textContent,
            info: s.querySelectorAll(".glim-pick-eyebrow .glim-info-icon").length,
            inLine: !!box && box.top < eyebrow.bottom && box.bottom > eyebrow.top,
          };
        }),
      );
    expect(lines).toEqual([
      { title: "On this server", badge: "Best fit", info: 0, inLine: true },
      { title: "On your network", badge: "Good", info: 0, inLine: true },
      { title: "In the cloud", badge: "Slower", info: 1, inLine: true },
    ]);
  });

  test("[picker-status] a tile that cannot be picked yet stays in view with its reason, and neither a click nor the keys pick it", async ({ page }) => {
    await showPlaces(page);
    const usb = places(page).locator('.glim-provider-pick [aria-disabled="true"]', { hasText: "USB disk" });
    await expect(usb).toBeVisible();
    await expect(usb).toContainText("Not plugged in");
    await expect(places(page).getByRole("button", { name: /USB disk/ })).toHaveCount(0);
    await usb.click();
    await expect(places(page).getByRole("searchbox")).toBeVisible();

    await places(page).getByRole("searchbox").fill("usb");
    await page.keyboard.press("Enter");
    await expect(places(page).getByRole("searchbox")).toBeVisible();

    await places(page).getByRole("searchbox").fill("");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("Folder On this server's disks");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("NFS Unix share");
  });

  test("[picker-selected] Back from the form marks the tile picked before and puts the focus on it", async ({ page }) => {
    await showPlaces(page);
    await places(page).getByRole("button", { name: "SMB Windows share" }).click();
    const form = page.getByRole("dialog", { name: "SMB" });
    await expect(form.getByRole("textbox", { name: "Path" })).toBeVisible();
    await form.getByRole("button", { name: "Back" }).click();
    const smb = places(page).getByRole("button", { name: "SMB Windows share" });
    await expect(smb).toHaveAttribute("aria-current", "true");
    await expect(smb).toBeFocused();
    await expect(places(page).locator('[aria-current="true"]')).toHaveCount(1);
  });

  test("[picker-mark-hover] a mark brings its own class and shows its hover drawing on the lit tile", async ({ page }) => {
    await showPlaces(page);
    const folder = places(page).getByRole("button", { name: "Folder On this server's disks" });
    const box = folder.locator(".glim-readme-btn-mark");
    await expect(box).toHaveClass(/glim-demo-folder-mark/);
    await expect(box.locator(".glim-mark-rest")).toBeVisible();
    await expect(box.locator(".glim-mark-hover")).toBeHidden();
    await folder.hover();
    await expect(box.locator(".glim-mark-rest")).toBeHidden();
    await expect(box.locator(".glim-mark-hover")).toBeVisible();
  });

  test("[picker-wordmark] a wordmark stands alone where a tile's mark starts, and the tile keeps its name for the search and the screen reader", async ({ page }) => {
    await showPlaces(page);
    const nimbo = places(page).getByRole("button", { name: "Nimbo Cloud drive", exact: true });
    await expect(nimbo.locator(".glim-readme-btn-name")).toBeHidden();
    await expect(nimbo.locator(".glim-readme-btn-mark")).toHaveClass(/glim-readme-btn-mark--wordmark/);
    for (const dir of ["ltr", "rtl"]) {
      await page.evaluate((d) => (document.documentElement.dir = d), dir);
      const { tile, mark, box } = await drawn(nimbo);
      expect(mark.left, dir).toBeGreaterThanOrEqual(tile.left + 8);
      expect(mark.right, dir).toBeLessThanOrEqual(tile.right - 8);
      expect(mark.top, dir).toBeGreaterThanOrEqual(tile.top + 8);
      expect(mark.bottom, dir).toBeLessThanOrEqual(tile.bottom - 8);
      // 14px is the start of the mark box on every tile.
      if (dir === "ltr") expect(Math.abs(mark.left - tile.left - 14), dir).toBeLessThan(1.5);
      else expect(Math.abs(tile.right - 14 - mark.right), dir).toBeLessThan(1.5);
      // Wider than the square mark box a tile with a name gives its mark.
      expect(box.width, dir).toBeGreaterThan(tile.width * 0.8);
    }
    await places(page).getByRole("searchbox").fill("nimbo");
    await expect(places(page).locator(".glim-provider-pick button.glim-readme-btn")).toHaveAccessibleName("Nimbo Cloud drive");
  });

  test("[picker-wordmark-lit] a wordmark tile lights up in its colour, and its wordmark rises in the tile's ink above the second line", async ({ page }) => {
    await open(page, "/components/picker-window", { motion: "off" });
    await stage(page, "PickerWindowStates").getByRole("button", { name: "Choose a place" }).click();
    const nimbo = places(page).getByRole("button", { name: "Nimbo Cloud drive", exact: true });
    const rest = await drawn(nimbo);
    await nimbo.hover();
    await expect(nimbo.locator(".glim-readme-btn-sub")).toHaveCSS("opacity", "0.9");
    expect(await nimbo.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(11, 107, 203)");
    expect(await nimbo.locator("svg").evaluate((svg) => getComputedStyle(svg).stroke)).toBe("rgb(255, 255, 255)");
    const lit = await drawn(nimbo);
    expect(lit.mark.top).toBeLessThan(rest.mark.top);
    expect(Math.abs(lit.mark.left - rest.mark.left)).toBeLessThan(1.5);
    expect(lit.mark.bottom).toBeLessThanOrEqual(lit.sub.top);
    expect(lit.mark.top).toBeGreaterThanOrEqual(lit.tile.top);
  });
});

/** Where a tile's wordmark is drawn, its box, and the line of its second line, in page pixels. */
const drawn = (tile: Locator) =>
  tile.evaluate((b) => {
    const rect = (el: Element) => {
      const { left, right, top, bottom, width } = el.getBoundingClientRect();
      return { left, right, top, bottom, width };
    };
    // The second line's box reaches past its line to keep the descenders, so its line starts below the padding.
    const sub = b.querySelector(".glim-readme-btn-sub")!;
    const line = rect(sub);
    line.top += parseFloat(getComputedStyle(sub).paddingTop);
    // Firefox bounds a stroked path generously, so the drawing is placed from its own box in the viewBox,
    // which the SVG scales into its element as preserveAspectRatio's default does.
    const svg = b.querySelector<SVGSVGElement>(".glim-readme-btn-mark svg")!;
    const path = svg.querySelector("path")!;
    const style = getComputedStyle(path);
    const half = style.stroke === "none" ? 0 : parseFloat(style.strokeWidth) / 2;
    const view = svg.viewBox.baseVal;
    const at = rect(svg);
    const height = at.bottom - at.top;
    const scale = Math.min(at.width / view.width, height / view.height);
    const left = at.left + (at.width - view.width * scale) / 2;
    const top = at.top + (height - view.height * scale) / 2;
    const own = path.getBBox();
    const mark = {
      left: left + (own.x - half - view.x) * scale,
      right: left + (own.x + own.width + half - view.x) * scale,
      top: top + (own.y - half - view.y) * scale,
      bottom: top + (own.y + own.height + half - view.y) * scale,
    };
    return { tile: rect(b), box: rect(b.querySelector(".glim-readme-btn-mark")!), mark, sub: line };
  });
