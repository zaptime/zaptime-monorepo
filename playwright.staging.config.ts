import { defineConfig } from "@playwright/test";

if (process.env.ZAPTIME_STAGING_TEST_MODE !== "stripe-test") {
  throw new Error("UNVERIFIED: staging recovery is opt-in. Read docs/contracts/booking-recovery.md and supply explicit Stripe test mode plus a reviewed adapter.");
}

export default defineConfig({
  testDir: "./tests/staging",
  testMatch: "booking-recovery.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  // The hold-expiry scenario must cross the real 20-minute backend boundary.
  timeout: 25 * 60 * 1000,
  outputDir: "./node_modules/.cache/zaptime-staging-results",
  reporter: "line",
  use: { trace: "off", screenshot: "off", video: "off" },
});
