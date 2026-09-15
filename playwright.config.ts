import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { ...devices["Desktop Chrome"], timezoneId: "UTC", locale: "en-US", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "vue", testIgnore: /ssr\.spec/, use: { baseURL: "http://127.0.0.1:4173" } },
    { name: "react", testIgnore: /ssr\.spec/, use: { baseURL: "http://127.0.0.1:4174" } },
    { name: "ssr", testMatch: /ssr\.spec/, use: { baseURL: "http://127.0.0.1:4175" } },
  ],
  webServer: [
    { command: "pnpm --filter nuxt-app exec nuxt dev --host 127.0.0.1 --port 4173", url: "http://127.0.0.1:4173/headless", reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: "pnpm --filter react-example dev", url: "http://127.0.0.1:4174", reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: "pnpm --filter next-example dev", url: "http://127.0.0.1:4175", reuseExistingServer: !process.env.CI, timeout: 120000 },
  ],
});
