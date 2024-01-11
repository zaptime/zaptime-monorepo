import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode !== 'production') {
    return {
      plugins: [vue()],
      root: resolve(__dirname, './example'),
    };
  } else {
    return {
      plugins: [vue()],
    };
  }
});
