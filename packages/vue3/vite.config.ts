import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { resolve } from "path";
import { peerDependencies, dependencies } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode !== 'production') {
    return {
      plugins: [vue()],
      root: resolve(__dirname, "./example"),
    }
  } else {
    return {
      plugins: [vue()],
      build: {

        cssCodeSplit: false,
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
            },
          },
        },
      },
    }
  }
});
