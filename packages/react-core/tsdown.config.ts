import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/entry.ts"],
  format: "esm",
  // `eager` resolves bundled cross-package types fully, which is required to
  // inline types re-exported from @zaptime/core-shared (e.g. CalendarState).
  dts: { eager: true },
  // react / react-dom stay external (provided by the host app via peerDeps).
  external: ["react", "react-dom"],
  // @zaptime/core-shared is an internal, unpublished package. Bundle it into
  // the published artifact so @zaptime/react-core is self-contained.
  noExternal: ["@zaptime/core-shared"],
});
