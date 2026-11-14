import { expect, test, type Page } from "@playwright/test";
import { open, relook, stage } from "./page";

// The rows of Avatar, Timer, Marquee, HoverCard and Carousel, each named after its contract row.

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

test.describe("Carousel", () => {
  const region = (page: Page) => stage(page, "CarouselRelease").getByRole("region", { name: "What is new" });
  const dot = (page: Page, n: number) => region(page).getByRole("button", { name: `Slide ${n}`, exact: true });
  const shown = (page: Page) =>
    region(page).locator(".glim-carousel-slides").evaluate((el) => Math.round(el.scrollLeft / el.clientWidth));

  test("[carousel-region] a region named by its label, each slide named by its place", async ({ page }) => {
    await open(page, "/components/carousel");
    await expect(region(page)).toHaveAttribute("aria-roledescription", "carousel");
    await expect(region(page).getByRole("group", { name: "1 of 3" })).toHaveCount(1);
  });

  test("[carousel-steps] Next and Previous move a page, and stop at the ends", async ({ page }) => {
    await open(page, "/components/carousel");
    await expect(region(page).getByRole("button", { name: "Previous slide" })).toBeDisabled();
    await region(page).getByRole("button", { name: "Next slide" }).click();
    await expect(dot(page, 2)).toHaveAttribute("data-current", "");
    await expect.poll(() => shown(page)).toBe(1);
    await region(page).getByRole("button", { name: "Next slide" }).click();
    await expect(region(page).getByRole("button", { name: "Next slide" })).toBeDisabled();
  });

  test("[carousel-dots] a dot goes to its page and the one in force takes the accent", async ({ page }) => {
    await open(page, "/components/carousel");
    await dot(page, 3).click();
    await expect(dot(page, 3)).toHaveAttribute("data-current", "");
    await expect.poll(() => shown(page)).toBe(2);
  });

  test("[carousel-still] without motion a move lands at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/components/carousel");
    await region(page).getByRole("button", { name: "Next slide" }).click();
    expect(await shown(page)).toBe(1);
  });
});

test.describe("Marquee", () => {
  const row = (page: Page) => stage(page, "MarqueeThanks").getByRole("region", { name: "Thanks to" });
  const playing = (page: Page) =>
    row(page).locator(".glim-marquee-content").first().evaluate((el) => {
      const s = getComputedStyle(el);
      return s.animationName !== "none" && s.animationPlayState === "running";
    });

  test("[marquee-region] a region named by its label, read once", async ({ page }) => {
    await open(page, "/components/marquee", { motion: "subtle" });
    await expect(row(page)).toHaveAttribute("aria-roledescription", "marquee");
    await expect(row(page).locator('.glim-marquee-content:not([aria-hidden="true"])')).toHaveCount(1);
  });

  test("[marquee-runs] it runs at a motion level that moves", async ({ page }) => {
    await open(page, "/components/marquee", { motion: "subtle" });
    expect(await playing(page)).toBe(true);
  });

  test("[marquee-hover] it halts while the pointer is on it", async ({ page }) => {
    await open(page, "/components/marquee", { motion: "subtle" });
    await row(page).hover();
    expect(await playing(page)).toBe(false);
  });

  test("[marquee-hold] its button holds it until pressed again", async ({ page }) => {
    await open(page, "/components/marquee", { motion: "subtle" });
    await stage(page, "MarqueeThanks").getByRole("button", { name: "Pause" }).click();
    await page.mouse.move(0, 0);
    expect(await playing(page)).toBe(false);
    await stage(page, "MarqueeThanks").getByRole("button", { name: "Resume" }).click();
    await page.mouse.move(0, 0);
    expect(await playing(page)).toBe(true);
  });

  test("[marquee-still] at off and under reduced motion it does not move", async ({ page }) => {
    await open(page, "/components/marquee");
    await relook(page, { motion: "off" });
    expect(await playing(page)).toBe(false);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await relook(page, { motion: "subtle" });
    expect(await playing(page)).toBe(false);
  });
});
