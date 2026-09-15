import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/entry.ts"],
  clean: false,
  platform: "neutral",
  format: "esm",
  dts: { vue: true, emitDtsOnly: true },
  outExtensions: () => ({ dts: ".d.ts" }),
});
