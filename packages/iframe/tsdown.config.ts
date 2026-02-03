import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { 'zaptime-init': 'src/zaptime-init/index.ts' },
  format: 'iife',
  platform: 'browser',
  outDir: 'zoid',
  clean: false,
  skipNodeModulesBundle: true,
})
