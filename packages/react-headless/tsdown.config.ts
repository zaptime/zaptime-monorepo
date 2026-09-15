import { defineConfig } from "tsdown";
export default defineConfig({ entry: ["src/entry.ts"], format: "esm", dts: true, deps: { neverBundle: ["react", "react/jsx-runtime", "@zaptime/core"] }, banner: { js: '"use client";' } });
