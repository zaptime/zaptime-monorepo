# Zaptime Monorepo

## Contains

- Vue 3 Core
- Vue 3 component

## How to start the project

```
pnpm install
```

```
pnpm dev
```

## How to publish

For the publishing we use changesets.

### Releasing changes

0. Run `pnpm --filter @zaptime/vue3 build` or `pnpm --filter @zaptime/core build`
1. Run `pnpm changeset`
2. Run `pnpm changeset version`. This will bump the versions of the packages
   previously specified (and any dependents of those) and
   update the changelog files.
3. Run `pnpm install`. This will update the lockfile and rebuild packages.
4. Commit changes
5. Run `pnpm publish -r`. This command will publish all packages that have
   bumped versions not yet present in the registry.

### Deploy iframe to Cloud Flare

`pnpm --filter iframe run build`
`pnpm --filter iframe run deploy`
