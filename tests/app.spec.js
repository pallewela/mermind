import { test, expect } from "./shared/fixtures.js";

test.describe("App shell", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearPermissions();
    await page.goto("/");
    await page.waitForSelector(".app");
  });

  test("loads without console errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForSelector(".app");
    expect(errors).toEqual([]);
  });

  test("shows two panes and header", async ({ page }) => {
    await expect(page.locator(".paneLeft")).toBeVisible();
    await expect(page.locator(".paneRight")).toBeVisible();
    await expect(page.locator(".topbar")).toBeVisible();
    await expect(page.locator(".brand")).toHaveText("Mindmap");
  });

  test("default example text is loaded in editor", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await expect(editor).toContainText("Mind Mapping");
  });

  test("switching example and clicking Reset loads new text", async ({
    page,
  }) => {
    await page.selectOption('select[title="Examples"]', "cafe");
    await page.click('button[title="Reset"]');
    const editor = page.locator(".cm-content");
    await expect(editor).toContainText("Cafe");
  });
});

test.describe("Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".app");
  });

  test("clicking Dark applies dark theme attribute", async ({ page }) => {
    await page.click("text=Dark");
    const app = page.locator(".app");
    await expect(app).toHaveAttribute("data-theme", "dark");
  });

  test("clicking Light applies light theme attribute", async ({ page }) => {
    await page.click("text=Dark");
    await page.click("text=Light");
    const app = page.locator(".app");
    await expect(app).toHaveAttribute("data-theme", "light");
  });

  test("theme persists across reload", async ({ page }) => {
    await page.click("text=Dark");
    await page.reload();
    await page.waitForSelector(".app");
    const app = page.locator(".app");
    await expect(app).toHaveAttribute("data-theme", "dark");
  });
});
