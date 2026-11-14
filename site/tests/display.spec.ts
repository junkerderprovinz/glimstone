import { expect, test, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

// The rows of Avatar, Timer, Marquee, HoverCard and Carousel, each named after its contract row.

test.beforeEach(({}, info) => test.skip(!["react", "vue"].includes(info.project.name), "React and Vue only so far"));

test.describe("Avatar", () => {
  const person = (page: Page, name: string) => stage(page, "AvatarPeople").getByRole("img", { name, exact: true });

  test("[avatar-name] the name is what a screen reader hears", async ({ page }) => {
    await open(page, "/components/avatar");
    await expect(person(page, "Ada Lovelace")).toHaveCount(1);
    await expect(person(page, "Grace Hopper")).toHaveCount(1);
  });

  test("[avatar-fallback] without a picture, or with one that fails, the initials show", async ({ page }) => {
    await open(page, "/components/avatar");
    await expect(person(page, "Grace Hopper").locator(".glim-avatar-fallback")).toHaveText("GH");
    await expect(person(page, "Linus Torvalds").locator(".glim-avatar-fallback")).toBeVisible();
    await expect(person(page, "Linus Torvalds").locator("img")).toBeHidden();
  });

  test("[avatar-image] once the picture loads it shows and the initials go", async ({ page }) => {
    await open(page, "/components/avatar");
    await expect(person(page, "Ada Lovelace").locator("img")).toBeVisible();
    await expect(person(page, "Ada Lovelace").locator(".glim-avatar-fallback")).toBeHidden();
  });

  test("[avatar-shape] the corners follow the shape setting", async ({ page }) => {
    await open(page, "/components/avatar");
    const corner = () => person(page, "Grace Hopper").evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    await relook(page, { shape: "round" });
    expect(await corner()).toBeGreaterThanOrEqual(20);
    await relook(page, { shape: "square" });
    expect(await corner()).toBe(0);
  });
});

test.describe("Timer", () => {
  const figure = (page: Page) => stage(page, "TimerTest").getByRole("timer");
  const button = (page: Page, name: string) => stage(page, "TimerTest").getByRole("button", { name, exact: true });

  test("[timer-figure] a timer named by the time in words, its digits left to right", async ({ page }) => {
    await open(page, "/components/timer");
    await expect(figure(page)).toHaveText("00:00:03");
    await expect(figure(page)).toHaveAttribute("aria-label", "3 seconds");
    expect(await figure(page).evaluate((el) => getComputedStyle(el).direction)).toBe("ltr");
  });

  test("[timer-run] Start runs it, Pause holds it and Resume goes on", async ({ page }) => {
    await open(page, "/components/timer");
    await button(page, "Start").click();
    await expect(figure(page)).toHaveAttribute("data-running", "");
    await button(page, "Pause").click();
    await expect(button(page, "Resume")).toBeVisible();
    const held = await figure(page).textContent();
    await page.waitForTimeout(1_200);
    await expect(figure(page)).toHaveText(held!);
    await button(page, "Resume").click();
    await expect(button(page, "Pause")).toBeVisible();
  });

  test("[timer-complete] a countdown that reaches zero says so", async ({ page }) => {
    await open(page, "/components/timer");
    await button(page, "Start").click();
    await expect(stage(page, "TimerTest").getByText("Time is up")).toBeVisible({ timeout: 6_000 });
    await expect(figure(page)).toHaveText("00:00:00");
  });

  test("[timer-reset] Reset puts it back to where it started", async ({ page }) => {
    await open(page, "/components/timer");
    await button(page, "Start").click();
    await expect(figure(page)).not.toHaveText("00:00:03", { timeout: 3_000 });
    await button(page, "Reset").click();
    await expect(figure(page)).toHaveText("00:00:03");
    await expect(button(page, "Start")).toBeVisible();
  });

  test("[timer-accent] while it runs the figure takes the accent's ink", async ({ page }) => {
    await open(page, "/components/timer");
    const ink = () => figure(page).evaluate((el) => getComputedStyle(el).color);
    const rest = await ink();
    await button(page, "Start").click();
    await expect(figure(page)).toHaveAttribute("data-running", "");
    expect(await ink()).not.toBe(rest);
  });
});

test.describe("HoverCard", () => {
  const link = (page: Page) => stage(page, "HoverCardServer").getByRole("link", { name: "the server in the cellar" });
  const card = (page: Page) => page.locator(".glim-hovercard");

  test("[hovercard-link] the trigger is a link to the page the card previews", async ({ page }) => {
    await open(page, "/components/hover-card");
    await expect(link(page)).toHaveAttribute("href", "#/components/hover-card");
  });

  test("[hovercard-hover] the card opens once the pointer rests on the link and closes after it leaves", async ({ page }) => {
    await open(page, "/components/hover-card");
    await link(page).hover();
    await expect(card(page)).toBeVisible();
    await expect(card(page)).toContainText("2.1 TB free");
    await page.mouse.move(0, 0);
    await expect(card(page)).toHaveCount(0);
  });

  test("[hovercard-focus] the keyboard reaching the link opens it, and Escape closes it", async ({ page }) => {
    await open(page, "/components/hover-card");
    await link(page).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(card(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card(page)).toHaveCount(0);
    await expect(link(page)).toBeFocused();
  });
});
