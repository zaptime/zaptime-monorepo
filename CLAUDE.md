# Repository guide

Zaptime ships one TypeScript calendar engine, granular Vue/React adapters, optional browser effects, and complete Vue/React calendars. See [CONTEXT.md](CONTEXT.md), [ADRs](docs/adr/README.md) and [release validation](docs/validation/calendar-release.md).

## Packages

```text
iframe / Nuxt -> @zaptime/vue3 -> @zaptime/vue-headless -> @zaptime/core
React / Next -> @zaptime/react -> @zaptime/react-headless -> @zaptime/core
Both complete calendars -> @zaptime/browser -> @zaptime/core
```

Core owns immutable snapshots, initialization, preferences, forms, booking and recovery. It has no framework, CSS, DOM-global or browser-SDK runtime dependency. Headless adapters translate ownership/subscriptions into Vue refs or React render values. Browser effects mount Stripe using element references and deliver analytics/navigation. Shared UI assets are build inputs under `shared/calendar-ui`, emitted independently by each UI package.

Each calendar is independent by default. Providers borrow an explicitly supplied instance. Hiding preserves state; owner disposal rejects new actions, detaches UI and waits for active bounded operations. SSR renders deterministic loading markup and fetches only after client mount.

## Commands

Use Node22.18.x and pnpm10.6.5:

```sh
pnpm install --frozen-lockfile
pnpm -r --if-present run build
pnpm dev
pnpm lint
pnpm format:check
pnpm -r --if-present run typecheck
pnpm -r --if-present run test
pnpm test:packages
pnpm exec playwright test
pnpm exec changeset status
```

Build workspace dependencies before consumers; do not use production source aliases to hide missing artifacts. Packed-consumer checks validate real tarballs, declarations, CSS exports and framework isolation. Headless imports must not load UI CSS. Preserve `cal-` classes and `--c-zaptime-*` theme variables.

## Payment and release gates

The frontend build default is `VITE_STRIPE_CLIENT_KEY`; runtime configuration may supply `stripePublishableKey`. These are publishable keys only. Never expose tokens, attendee details or payment secrets in logs, analytics or persisted recovery state.

Default tests use fictional fixtures. `pnpm test:staging` is opt-in and requires reviewed test-mode setup. [The backend recovery contract](docs/contracts/booking-recovery.md) explicitly distinguishes source facts from deployed guarantees. Do not infer safe payment retry, intent reuse, refunds or webhook completion from mocks.

The release workflow requires the full CI matrix and `CALENDAR_RECOVERY_VERIFIED=true` only after the contract and release matrix contain reviewed staging evidence. Updating workflows is not authorization to publish or deploy.

The iframe keeps its Zoid IIFE integration. `pnpm --filter iframe merge-files` concatenates `zoid/zoid.js` and `zoid/zaptime-init.js`; deployment remains a separate command/workflow. Preserve existing script-tag embedding modes.
