import { expect, test, type Locator, type Page } from "@playwright/test";
import { open, stage } from "./page";

const demo = (page: Page) => stage(page, "FieldErrors");
const port = (page: Page) => demo(page).getByRole("textbox", { name: "Port" });
const below = async (line: Locator, field: Locator) => (await line.boundingBox())!.y >= (await field.boundingBox())!.y + (await field.boundingBox())!.height;

test.describe("Field errors", () => {
  test("[field-error-invalid] a field with an error is invalid and described by it", async ({ page }) => {
    await open(page, "/components/text-field");
    await port(page).fill("80800");
    await expect(port(page)).toHaveAttribute("aria-invalid", "true");
    await expect(port(page)).toHaveAccessibleDescription("A port is a number up to 65535");
  });

  test("[field-error-line] the line stands under the field, in the fault colour", async ({ page }) => {
    await open(page, "/components/text-field");
    await port(page).fill("80800");
    const line = demo(page).getByText("A port is a number up to 65535");
    expect(await below(line, port(page))).toBe(true);
    const fault = await line.evaluate((l) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--status-fail-text)";
      l.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c === getComputedStyle(l).color;
    });
    expect(fault).toBe(true);
  });

  test("[field-error-row] in a field row the line stands under the field and the name keeps its place", async ({ page }) => {
    await open(page, "/components/text-field");
    const row = demo(page).locator(".glim-field-row");
    const name = row.locator(".glim-field-row-name");
    const field = row.getByRole("textbox", { name: "Job name" });
    const before = (await name.boundingBox())!;
    await field.fill("");
    const line = row.getByText("A job needs a name");
    await expect(line).toBeVisible();
    expect(await below(line, field)).toBe(true);
    expect((await name.boundingBox())!.x).toBeCloseTo(before.x, 0);
  });

  test("[field-error-clear] fixing the value takes the error away and the focus stays", async ({ page }) => {
    await open(page, "/components/text-field");
    await port(page).fill("80800");
    await port(page).press("Backspace");
    await expect(port(page)).not.toHaveAttribute("aria-invalid");
    await expect(demo(page).getByText("A port is a number up to 65535")).toHaveCount(0);
    await expect(port(page)).toBeFocused();
  });

  test("[field-error-kinds] a password and a number field carry an error the same way", async ({ page }) => {
    await open(page, "/components/text-field");
    for (const [name, words] of [["Token", "A token has 32 characters"], ["Keep", "Keep at least one copy"]]) {
      const field = demo(page).getByLabel(name, { exact: true });
      await expect(field).toHaveAttribute("aria-invalid", "true");
      await expect(field).toHaveAccessibleDescription(words);
    }
  });
});
