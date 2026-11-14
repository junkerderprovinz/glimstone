import { expect, test } from "@playwright/test";
import { open, relook, stage } from "./page";

// The rows of Avatar, Timer, Marquee, HoverCard and Carousel, each named after its contract row.

test.beforeEach(({}, info) => test.skip(!["react", "vue"].includes(info.project.name), "React and Vue only so far"));

test.describe("Avatar", () => {
  const person = (page: import("@playwright/test").Page, name: string) => stage(page, "AvatarPeople").getByRole("img", { name, exact: true });

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
