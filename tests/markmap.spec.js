import { test, expect } from "./shared/fixtures.js";

test.describe("Markmap renderer", () => {
  test.beforeEach(async ({ page, renderer }) => {
    test.skip(renderer !== "markmap", "Markmap tests only");
    await page.goto("/");
    await page.waitForSelector(".markmapSvg");
    await page.waitForTimeout(500);
  });

  test("toolbar buttons are visible", async ({ page }) => {
    const toolbar = page.locator('[aria-label="Map navigation"]');
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator('button[title*="Zoom in"]')).toBeVisible();
    await expect(toolbar.locator('button[title*="Zoom out"]')).toBeVisible();
    await expect(toolbar.locator('button[title*="Fit"]')).toBeVisible();
    await expect(toolbar.locator("text=Tier−")).toBeVisible();
    await expect(toolbar.locator("text=Tier+")).toBeVisible();
  });

  test("Tier- folds one depth level", async ({ page }) => {
    const tierMinus = page.locator(
      '[aria-label="Map navigation"] button:has-text("Tier−")',
    );
    await expect(tierMinus).toBeEnabled();
    await tierMinus.click();
    await page.waitForTimeout(500);

    const foldedNodes = page.locator(".markmap-fold");
    const count = await foldedNodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Tier+ expands after Tier- fold", async ({ page }) => {
    const tierMinus = page.locator(
      '[aria-label="Map navigation"] button:has-text("Tier−")',
    );
    const tierPlus = page.locator(
      '[aria-label="Map navigation"] button:has-text("Tier+")',
    );

    await tierMinus.click();
    await page.waitForTimeout(400);
    const foldedBefore = await page.locator(".markmap-fold").count();
    expect(foldedBefore).toBeGreaterThan(0);

    await expect(tierPlus).toBeEnabled();
    await tierPlus.click();
    await page.waitForTimeout(400);

    const foldedAfter = await page.locator(".markmap-fold").count();
    expect(foldedAfter).toBeLessThan(foldedBefore);
  });

  test("Tier- disables when fully collapsed", async ({ page }) => {
    const tierMinus = page.locator(
      '[aria-label="Map navigation"] button:has-text("Tier−")',
    );
    for (let i = 0; i < 20; i++) {
      if (await tierMinus.isDisabled()) break;
      await tierMinus.click();
      await page.waitForTimeout(200);
    }
    await expect(tierMinus).toBeDisabled();
  });

  test("error overlay appears when editor is cleared", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("broken text no mindmap header");
    await page.waitForTimeout(500);

    await expect(page.locator(".mindOverlay")).toBeVisible();
    await expect(page.locator(".overlayCard")).toContainText("Fix the Mermaid");
  });

  test("mindmap renders nodes from default example", async ({ page }) => {
    const svg = page.locator(".markmapSvg");
    await expect(svg).toBeVisible();
    await expect(svg).toContainText("Mind Mapping");
    await expect(svg).toContainText("Planning");
  });
});
