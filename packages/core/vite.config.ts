import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      name: 'zaptime-core',
      fileName: (format) => `zaptime-core.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        inlineDynamicImports: true, // <== here the entry

        globals: {
          vue: 'Vue',
        },
      },
    },
  },

  server: {
    port: 5000,
  },
});
