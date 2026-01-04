import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import { peerDependencies, dependencies } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
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
            // Provide global variables to use in the UMD build
            // for externalized deps
            globals: {
              vue: "Vue",
              "@zaptime/core": "ZaptimeCore",
              "date-fns": "dateFns",
              "@vueuse/core": "VueUseCore",
            },
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
