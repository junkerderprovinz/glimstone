import { expect, test, type Page } from "@playwright/test";
import { open, stage } from "./page";

// The rows of Accordion and Collapsible, each named after its contract row.

test.describe("Accordion", () => {
  const row = (page: Page, name: string) => stage(page, "AccordionHelp").getByRole("button", { name });
  const where = "Where are the backups kept?";
  const howLong = "How long is a backup kept?";
  const restore = "Can a single file be restored?";

  test("[accordion-heading] each row is a button in a heading that points at its text", async ({ page }) => {
    await open(page, "/components/accordion");
    const heading = stage(page, "AccordionHelp").getByRole("heading", { level: 3, name: where });
    await expect(heading.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    const controls = await row(page, where).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`[id="${controls}"]`)).toHaveCount(1);
  });

  test("[accordion-toggle] Enter and Space open and close a row's text", async ({ page }) => {
    await open(page, "/components/accordion");
    await row(page, where).focus();
    await page.keyboard.press("Enter");
    await expect(row(page, where)).toHaveAttribute("aria-expanded", "true");
    await expect(stage(page, "AccordionHelp").getByText("In the storage locations")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(row(page, where)).toHaveAttribute("aria-expanded", "false");
    await expect(stage(page, "AccordionHelp").getByText("In the storage locations")).toBeHidden();
  });

  test("[accordion-one] opening one item closes the other", async ({ page }) => {
    await open(page, "/components/accordion");
    await row(page, where).click();
    await row(page, howLong).click();
    await expect(row(page, howLong)).toHaveAttribute("aria-expanded", "true");
    await expect(row(page, where)).toHaveAttribute("aria-expanded", "false");
  });

  test("[accordion-arrows] the arrows, Home and End move between the rows", async ({ page }) => {
    await open(page, "/components/accordion");
    await row(page, where).focus();
    await page.keyboard.press("ArrowDown");
    await expect(row(page, howLong)).toBeFocused();
    await page.keyboard.press("End");
    await expect(row(page, restore)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(row(page, howLong)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(row(page, where)).toBeFocused();
  });

  test("[accordion-region] an open item's text is a region named by its row", async ({ page }) => {
    await open(page, "/components/accordion");
    await row(page, restore).click();
    await expect(stage(page, "AccordionHelp").getByRole("region", { name: restore })).toContainText("Open the backup");
  });
});

test.describe("Collapsible", () => {
  const row = (page: Page) => stage(page, "CollapsibleBasic").getByRole("button", { name: "What a relay sees" });
  const text = (page: Page) => stage(page, "CollapsibleBasic").getByText("Only the encrypted parcels");

  test("[collapsible-toggle] Enter and Space open and close the text", async ({ page }) => {
    await open(page, "/components/collapsible");
    await row(page).focus();
    await page.keyboard.press("Enter");
    await expect(row(page)).toHaveAttribute("aria-expanded", "true");
    await expect(text(page)).toBeVisible();
    await page.keyboard.press("Space");
    await expect(row(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("[collapsible-hidden] closed, the text is hidden", async ({ page }) => {
    await open(page, "/components/collapsible");
    await expect(text(page)).toBeHidden();
    await row(page).click();
    await expect(text(page)).toBeVisible();
    await row(page).click();
    await expect(text(page)).toBeHidden();
  });

  test("[collapsible-still] without motion the text comes and goes at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/components/collapsible");
    await row(page).click();
    expect(await text(page).evaluate((el) => getComputedStyle(el.closest(".glim-disclosure-content")!).animationName)).toBe("none");
    await row(page).click();
    await expect(text(page)).toBeHidden({ timeout: 200 });
  });
});
