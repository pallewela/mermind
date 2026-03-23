import { test, expect } from "./shared/fixtures.js";

test.describe("Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".paneRight");
    await page.waitForTimeout(1000);
  });

  test("Export SVG triggers a download with .svg extension", async ({
    page,
  }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.click('button[title="Export SVG"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    const path = await download.path();
    const fs = await import("fs");
    const content = fs.readFileSync(path, "utf-8");
    expect(content.length).toBeGreaterThan(100);
    expect(content).not.toContain("Tier");
    expect(content).not.toContain("Zoom in");
  });

  test("Export PNG triggers a download with .png extension", async ({
    page,
  }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.click('button[title="Export PNG"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);

    const path = await download.path();
    const fs = await import("fs");
    const stat = fs.statSync(path);
    expect(stat.size).toBeGreaterThan(1000);
  });
});
