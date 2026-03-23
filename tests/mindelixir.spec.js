import { test, expect } from "./shared/fixtures.js";

test.describe("MindElixir renderer", () => {
  test.beforeEach(async ({ page, renderer }) => {
    test.skip(renderer !== "mindelixir", "MindElixir tests only");
    await page.goto("/");
    await page.waitForSelector(".mind-elixir");
  });

  test("toolbar buttons are visible", async ({ page }) => {
    const toolbar = page.locator('[aria-label="Map navigation"]');
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator('button[title*="Zoom in"]')).toBeVisible();
    await expect(toolbar.locator('button[title*="Zoom out"]')).toBeVisible();
    await expect(
      toolbar.locator('button[title*="100% zoom"]'),
    ).toBeVisible();
    await expect(toolbar.locator("text=Pan")).toBeVisible();
  });

  test("Pan toggle sets aria-pressed", async ({ page }) => {
    const panBtn = page.locator(
      '[aria-label="Map navigation"] button:has-text("Pan")',
    );
    await expect(panBtn).toHaveAttribute("aria-pressed", "false");
    await panBtn.click();
    await expect(panBtn).toHaveAttribute("aria-pressed", "true");
    await panBtn.click();
    await expect(panBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("zoom in button increases zoom level", async ({ page }) => {
    const getZoom = () =>
      page.evaluate(() => {
        const el = document.querySelector(".mind-elixir");
        return el?.__mindElixir?.scaleVal ?? 1;
      });
    const before = await getZoom();
    await page.click('button[title*="Zoom in"]');
    await page.waitForTimeout(300);
    const after = await getZoom();
    expect(after).toBeGreaterThan(before);
  });

  test("zoom out button decreases zoom level", async ({ page }) => {
    const getZoom = () =>
      page.evaluate(() => {
        const el = document.querySelector(".mind-elixir");
        return el?.__mindElixir?.scaleVal ?? 1;
      });
    const before = await getZoom();
    await page.click('button[title*="Zoom out"]');
    await page.waitForTimeout(300);
    const after = await getZoom();
    expect(after).toBeLessThan(before);
  });

  test("zoom in then zoom out returns to original scale", async ({
    page,
  }) => {
    const getZoom = () =>
      page.evaluate(() => {
        const el = document.querySelector(".mind-elixir");
        return el?.__mindElixir?.scaleVal ?? 1;
      });
    const original = await getZoom();

    await page.click('button[title*="Zoom in"]');
    await page.waitForTimeout(200);
    await page.click('button[title*="Zoom in"]');
    await page.waitForTimeout(200);
    const zoomedIn = await getZoom();
    expect(zoomedIn).toBeGreaterThan(original);

    await page.click('button[title*="Zoom out"]');
    await page.waitForTimeout(200);
    await page.click('button[title*="Zoom out"]');
    await page.waitForTimeout(200);
    const restored = await getZoom();
    expect(restored).toBeCloseTo(original, 4);
  });

  test("100% button resets zoom to 1", async ({ page }) => {
    await page.click('button[title*="Zoom in"]');
    await page.click('button[title*="Zoom in"]');
    await page.click('button[title*="Zoom in"]');
    await page.waitForTimeout(300);

    await page.click('button[title*="100% zoom"]');
    await page.waitForTimeout(300);

    const zoom = await page.evaluate(() => {
      const el = document.querySelector(".mind-elixir");
      return el?.__mindElixir?.scaleVal ?? 1;
    });
    expect(zoom).toBeCloseTo(1, 4);
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
    const pane = page.locator(".paneRight");
    await expect(pane).toContainText("Mind Mapping");
    await expect(pane).toContainText("Planning");
  });
});
