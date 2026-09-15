import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Engine suites declare @vitest-environment node; legacy Vue tests retain happy-dom.
    environment: "happy-dom",
  },
});
