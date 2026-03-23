import { test as base } from "@playwright/test";

/**
 * Extended test fixture that exposes which renderer project is running.
 * Use `test.skip()` in renderer-specific spec files to bail out early.
 */
export const test = base.extend({
  renderer: [
    async ({}, use, testInfo) => {
      await use(testInfo.project.metadata?.renderer ?? "mindelixir");
    },
    { scope: "test" },
  ],
});

/** Cmd+A on macOS, Ctrl+A on Linux/Windows — use instead of Meta+a in CI. */
export async function selectAllInFocusedEditor(page) {
  await page.keyboard.press("ControlOrMeta+a");
}

export { expect } from "@playwright/test";
