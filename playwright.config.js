import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "html" : "list",
  use: {
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "mindelixir",
      use: {
        baseURL: "http://localhost:5173",
      },
      metadata: { renderer: "mindelixir" },
    },
    {
      name: "markmap",
      use: {
        baseURL: "http://localhost:5174",
      },
      metadata: { renderer: "markmap" },
    },
  ],

  webServer: [
    {
      command: "npx vite --port 5173",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "VITE_RENDERER=markmap npx vite --port 5174",
      port: 5174,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
