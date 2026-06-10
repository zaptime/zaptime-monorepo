import { defineConfig } from "vite";
import { resolve } from "path";

// The example consumes @zaptime/react-core (and its internal @zaptime/core-shared
// dependency) directly from source, mirroring how the vue3 example aliases
// @zaptime/core. No React plugin is needed — Vite's esbuild handles JSX via the
// automatic runtime.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@zaptime/react-core": resolve(
        __dirname,
        "../../packages/react-core/src/entry.ts",
      ),
      "@zaptime/core-shared": resolve(
        __dirname,
        "../../packages/core-shared/src/index.ts",
      ),
    },
  },
  server: {
    port: 8889,
  },
});
