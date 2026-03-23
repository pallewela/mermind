import { test, expect, selectAllInFocusedEditor } from "./shared/fixtures.js";

/**
 * Compute the WCAG contrast ratio between markmap node text and the
 * pane background. Returns the ratio (e.g. 7.0 means 7:1).
 */
async function getNodeTextContrast(page) {
  return page.evaluate(() => {
    function parseRgb(str) {
      const m = str.match(/(\d+)/g);
      return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
    }
    function luminance([r, g, b]) {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    const node = document.querySelector(
      ".markmapSvg .markmap-node foreignObject div",
    );
    const bg = document.querySelector(".paneRight");
    if (!node || !bg) return 0;
    const textRgb = parseRgb(getComputedStyle(node).color);
    const bgRgb = parseRgb(getComputedStyle(bg).backgroundColor);
    const l1 = luminance(textRgb);
    const l2 = luminance(bgRgb);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

/**
 * Poll until the markmap d3 zoom transform stabilises (transition done).
 * Returns the final scale value.
 */
async function stableZoom(page) {
  return page.evaluate(async () => {
    const svg = document.querySelector(".markmapSvg");
    const read = () => svg?.__zoom?.k ?? 1;
    let prev = read();
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 60));
      const cur = read();
      if (cur === prev) return cur;
      prev = cur;
    }
    return prev;
  });
}

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

  test("zoom in button increases zoom level", async ({ page }) => {
    const before = await stableZoom(page);
    await page.click('button[title*="Zoom in"]');
    const after = await stableZoom(page);
    expect(after).toBeGreaterThan(before);
  });

  test("zoom out button decreases zoom level", async ({ page }) => {
    const before = await stableZoom(page);
    await page.click('button[title*="Zoom out"]');
    const after = await stableZoom(page);
    expect(after).toBeLessThan(before);
  });

  test("zoom in ×2 then zoom out ×2 returns to original scale", async ({
    page,
  }) => {
    const original = await stableZoom(page);

    await page.click('button[title*="Zoom in"]');
    await stableZoom(page);
    await page.click('button[title*="Zoom in"]');
    const zoomedIn = await stableZoom(page);
    expect(zoomedIn).toBeGreaterThan(original);

    await page.click('button[title*="Zoom out"]');
    await stableZoom(page);
    await page.click('button[title*="Zoom out"]');
    const restored = await stableZoom(page);
    expect(restored).toBeCloseTo(original, 2);
  });

  test("Fit button resets zoom after zooming in", async ({ page }) => {
    const initial = await stableZoom(page);

    for (let i = 0; i < 5; i++) {
      await page.click('button[title*="Zoom in"]');
      await stableZoom(page);
    }
    const zoomedIn = await stableZoom(page);
    expect(zoomedIn).toBeGreaterThan(initial * 1.5);

    await page.click('button[title*="Fit"]');
    const afterFit = await stableZoom(page);
    expect(afterFit).toBeLessThan(zoomedIn);
  });

  test("error overlay appears when editor is cleared", async ({ page }) => {
    const editor = page.locator(".cm-content");
    await editor.click();
    await selectAllInFocusedEditor(page);
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

  test("node text is readable in light mode", async ({ page }) => {
    await page.click("text=Light");
    await page.waitForTimeout(300);
    const contrast = await getNodeTextContrast(page);
    expect(contrast).toBeGreaterThan(4.5);
  });

  test("node text is readable in dark mode", async ({ page }) => {
    await page.click("text=Dark");
    await page.waitForTimeout(300);
    const contrast = await getNodeTextContrast(page);
    expect(contrast).toBeGreaterThan(4.5);
  });
});
