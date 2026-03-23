import { test, expect } from "./shared/fixtures.js";

test.describe("Persistence", () => {
  test("editor text persists in localStorage across reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector(".cm-editor");

    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("mindmap\n  root(Persisted)");
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForSelector(".cm-editor");
    await expect(page.locator(".cm-content")).toContainText("Persisted");
  });

  test("Copy link button produces a hash URL", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.waitForSelector(".cm-editor");

    await page.click('button[title="Copy share link"]');
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toContain("#mindmap=");
  });
});
