import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/entry.ts"],
  format: "esm",
  dts: true,
  external: ["vue"],
});
