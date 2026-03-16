---
"iframe": minor
"@zaptime/core": minor
"@zaptime/vue3": minor
---

### Build tooling

- Vite 8
- @zaptime/core: tsup → tsdown (new `tsdown.config.ts`, removed `vite.config.ts`)
- @zaptime/vue3: ESM-only output (dropped UMD build, removed `require` export)

### Linting & formatting

- Replaced ESLint + Prettier with oxlint + oxfmt
