# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zaptime is a calendar booking system published as npm packages. The monorepo contains:
- **@zaptime/core-shared** - Framework-agnostic foundation: HTTP API client, calendar/locale logic, default config and shared types. Internal/private; bundled into the framework packages (not published on its own).
- **@zaptime/core** - Headless Vue 3 composables for calendar logic (published to npm)
- **@zaptime/react-core** - Headless React hooks; the React mirror of `@zaptime/core`, same composable API (published to npm)
- **@zaptime/vue3** - Vue 3 UI components built on core (published to npm)
- **iframe** - Zoid.js wrapper for embedding calendar via script tag (private, deployed to Cloudflare Pages)
- **examples/nuxt-example** - Nuxt 3 integration example
- **examples/react-example** - React (Vite) integration example built on `@zaptime/react-core`

## Commands

```bash
# Install dependencies
pnpm install

# Development - runs all packages in parallel
pnpm dev
# Ports: vue3 (8888), iframe (8887)

# Build individual packages
pnpm --filter @zaptime/core build
pnpm --filter @zaptime/react-core build
pnpm --filter @zaptime/vue3 build
pnpm --filter iframe build
# @zaptime/core-shared has no build step — it is consumed/bundled from source.

# Tests
pnpm --filter @zaptime/core-shared test
pnpm --filter @zaptime/core test
pnpm --filter @zaptime/react-core test

# Lint and format
pnpm lint
pnpm format
pnpm format:check

# iframe specific
pnpm --filter iframe merge-files  # Merge zoid.js + zaptime-init.js
pnpm --filter iframe deploy       # Deploy to Cloudflare Pages
```

## Architecture

### Package Dependencies
```
                          ┌──▶ @zaptime/core  ──▶ @zaptime/vue3 ──▶ iframe / nuxt-example
@zaptime/core-shared ─────┤        (Vue)
   (framework-agnostic)   └──▶ @zaptime/react-core ──▶ examples/react-example
                                   (React)
```
`@zaptime/core-shared` is bundled into both `@zaptime/core` and `@zaptime/react-core`
at build time (tsdown `noExternal` + `dts.eager`), so the published packages are
self-contained and have no runtime/type dependency on the internal shared package.
It is a workspace **devDependency** of both (build-time only) and its `exports`
point at TypeScript source (consumed just-in-time, no separate build).

### Core-Shared Package (`@zaptime/core-shared`)
Pure, framework-free building blocks shared by the Vue and React packages:
- `api/api.ts` — HTTP client (`book`, `reserve`, `confirm`, `cancel`, `reschedule`, `getAvailableTimeSlots`, `fetchRemoteConfig`)
- `utils/` — `calendar.ts` (`getDays`), `dfnsConfig.ts`, `localeLogic.ts`, `mergeObjects.ts`
- `defaultConfig.ts` and all shared `types/`

### Core Package (`@zaptime/core`)
Headless **Vue** composables providing business logic without UI, built on `@zaptime/core-shared`:
- `useCalendar` - Main calendar state and day/time slot management
- `useConfig` - Calendar configuration
- `useSelectedTimeSlot` - Current selection state
- `useBookingForm` - Form field management
- API functions: `book`, `reserve`, `confirm`, `cancel`, `reschedule`, `fetchRemoteConfiguration`

Built with tsdown, exports ESM only.

### React Core Package (`@zaptime/react-core`)
Headless **React** hooks — the one-to-one mirror of `@zaptime/core`'s composable API,
sharing the same `@zaptime/core-shared` foundation. Same hook/function names and
shapes (`useCalendar`, `useConfig`, `book`, `reserve`, …); the only idiomatic
difference is that hooks return already-unwrapped reactive values (no Vue `.value`).
State lives in module-level external stores keyed by `calendarId` and is exposed to
components via `useSyncExternalStore` (the React analogue of core's module-level Vue
refs). peerDependency: `react` (^18 || ^19). Built with tsdown, exports ESM only.

### Vue3 Package (`@zaptime/vue3`)
UI components consuming core composables:
- `ZaptimeCalendar` - Main calendar component (also exported as deprecated `ZapTimeCalendar`)
- `useCalendarViewState` - View state management
- Re-exports core API functions

Built with Vite, outputs ESM and UMD bundles.

### Tailwind CSS Convention
The vue3 package uses Tailwind with `cal-` prefix to avoid conflicts with host applications. All Tailwind classes must use this prefix (e.g., `cal-flex`, `cal-p-4`). Theme colors use CSS variables (`--c-zaptime-*`).

### iframe Package
Wraps vue3 in a Zoid.js iframe for script-tag embedding. Build process:
1. `vite build` compiles Vue app
2. `merge-files` concatenates `zoid/zoid.js` + `zoid/zaptime-init.js` into `dist/zaptime.js`

For local development without Zoid, run `pnpm dev` which uses `example/` folder with mocked `window.xprops`.

## Release Process

Uses Changesets for version management. On push to main:
1. CI runs tests (core-shared, core, react-core) then builds core, vue3 and react-core
2. Changesets creates release PR or publishes to npm with provenance
3. GitHub releases created automatically

`@zaptime/core-shared` is private and never published; it is bundled into the
framework packages, so consumers only ever install `@zaptime/core` /
`@zaptime/react-core` / `@zaptime/vue3`.

To add a changeset locally: `pnpm changeset`

## Key Environment Variables

- `VITE_STRIPE_CLIENT_KEY` - Required for vue3 production build (injected at build time)
