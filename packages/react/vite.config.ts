import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
export default defineConfig(({ mode }) => ({
  define: { "import.meta.env.VITE_STRIPE_CLIENT_KEY": JSON.stringify(loadEnv(mode, process.cwd(), "VITE_").VITE_STRIPE_CLIENT_KEY || "") },
  css: { postcss: { plugins: [tailwindcss({ config: resolve(import.meta.dirname, "../../shared/calendar-ui/tailwind.config.cjs") }), autoprefixer()] } },
  build: {
    lib: { entry: resolve(import.meta.dirname, "src/bundle.ts"), formats: ["es"], fileName: () => "entry.js", cssFileName: "style" },
    rolldownOptions: { external: [/^react(?:\/|$)/, /^@zaptime\//], output: { banner: '"use client";' } },
  },
}));
