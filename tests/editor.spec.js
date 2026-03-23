import { test, expect } from "./shared/fixtures.js";

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".cm-editor");
  });

  test("typing in editor updates the diagram", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await editor.click();
    await editor.pressSequentially("\n    TestNewNode", { delay: 30 });
    await page.waitForTimeout(500);
    const rightPane = page.locator(".paneRight");
    await expect(rightPane).toContainText("TestNewNode");
  });

  test("syntax error shows parse error bar", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("this is not valid mermaid");
    await page.waitForTimeout(500);
    await expect(page.locator(".errorBar")).toBeVisible();
    await expect(page.locator(".errorBar")).toContainText("Parse error");
  });

  test("fixing syntax error hides error bar", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("this is not valid mermaid");
    await page.waitForTimeout(500);
    await expect(page.locator(".errorBar")).toBeVisible();

    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("mindmap\n  root(Fixed)");
    await page.waitForTimeout(500);
    await expect(page.locator(".errorBar")).not.toBeVisible();
  });
});
