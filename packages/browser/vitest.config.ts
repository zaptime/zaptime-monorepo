import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "happy-dom" }, resolve: { alias: { "@zaptime/core": new URL("../core/src/entry.ts", import.meta.url).pathname } } });
