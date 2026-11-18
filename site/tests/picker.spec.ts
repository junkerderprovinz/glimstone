import { expect, test, type Page } from "@playwright/test";
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
      { title: "Email and webhooks", names: ["Email", "Webhook"] },
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
    await expect(picker(page).locator(".glim-provider-pick li .glim-readme-btn-hint .glim-info-icon")).toHaveCount(count);
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
    expect(await fill("Email")).toBe(accent);
  });

  test("[picker-search] the search narrows every group at once, by name, id and own words, and the window keeps its height", async ({ page }) => {
    await show(page);
    const height = await picker(page).evaluate((card) => card.getBoundingClientRect().height);
    await search(page).fill("mail");
    await expect.poll(() => names(page)).toEqual(["Email"]);
    await search(page).fill("smtp");
    await expect.poll(() => names(page)).toEqual(["Email"]);
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
    await expect(form.locator(".glim-modal-foot button")).toHaveText(["Cancel", "Back", "Save"]);
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

  test("a mark keeps its own colours at rest and lifts the ones a dark tile would swallow", async ({ page }) => {
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
    expect(await fills()).toBe("rgb(130, 130, 130)");
  });
});
