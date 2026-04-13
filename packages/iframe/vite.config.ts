import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  ...(mode !== "production"
    ? {
        server: {
          port: 8887,
        },
        root: resolve(__dirname, "./example"),
      }
    : {}),
  test: {
    root: resolve(__dirname),
    environment: "happy-dom",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/zaptime-init/**/*.ts"],
      exclude: ["src/zaptime-init/types/**"],
    },
  },
  pack: {
    entry: { "zaptime-init": "src/zaptime-init/index.ts" },
    format: "iife",
    platform: "browser",
    outDir: "zoid",
    clean: false,
    deps: { skipNodeModulesBundle: true },
  },
}));
