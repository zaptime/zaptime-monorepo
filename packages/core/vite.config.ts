import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/entry.ts"],
    format: "esm",
    dts: true,
    deps: { neverBundle: ["vue"] },
  },
});
