import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/entry.ts"],
  format: "esm",
  // `eager` resolves bundled cross-package types fully, which is required to
  // reliably inline types re-exported from @zaptime/core-shared (e.g.
  // CalendarState). Without it the dts emit is non-deterministic.
  dts: { eager: true },
  external: ["vue"],
  // @zaptime/core-shared is an internal, unpublished package. Bundle it into
  // the published artifact so @zaptime/core stays self-contained (no runtime
  // or type-level dependency on the shared package leaks to consumers).
  noExternal: ["@zaptime/core-shared"],
});
