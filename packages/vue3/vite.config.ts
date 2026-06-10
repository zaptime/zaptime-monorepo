import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import { peerDependencies, dependencies } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode !== "production") {
    return {
      plugins: [vue()],
      server: {
        port: 8888,
      },
      root: resolve(__dirname, "./example"),
      resolve: {
        alias: {
          "@zaptime/core": resolve(__dirname, "../core/src/entry.ts"),
        },
      },
    };
  } else {
    // Production: inline env var at build time, from the system env (CI) or
    // packages/vue3/.env (local). loadEnv is needed because Vite does not put
    // .env values into process.env during config evaluation.
    const env = loadEnv(mode, __dirname, "VITE_");
    if (!env.VITE_STRIPE_CLIENT_KEY) {
      throw new Error(
        "VITE_STRIPE_CLIENT_KEY is not set. The Stripe publishable key is inlined into the bundle at build time — building without it ships a broken payment flow. Set it in the environment or in packages/vue3/.env and rebuild.",
      );
    }
    return {
      plugins: [vue()],
      define: {
        "import.meta.env.VITE_STRIPE_CLIENT_KEY": JSON.stringify(
          env.VITE_STRIPE_CLIENT_KEY,
        ),
      },
      build: {
        cssCodeSplit: false,
        sourcemap: false,
        lib: {
          entry: resolve(__dirname, "src/entry.ts"),
          name: "zaptime-vue3",
          formats: ["es"],
          fileName: (format) => `zaptime-vue3.${format}.js`,
        },
        rollupOptions: {
          // make sure to externalize deps that shouldn't be bundled
          // into your library
          external: [
            ...Object.keys(peerDependencies),
            ...Object.keys(dependencies),
          ],
          output: {
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === "vue3.css") return "style.css";
              return assetInfo.name || "asset";
            },
          },
        },
      },
      resolve: {
        alias: {
          "@zaptime/core": resolve(__dirname, "../core/src/entry.ts"),
        },
      },
    };
  }
});
