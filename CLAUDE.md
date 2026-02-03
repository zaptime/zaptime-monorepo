# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zaptime is a calendar booking system published as npm packages. The monorepo contains:
- **@zaptime/core** - Headless Vue 3 composables for calendar logic (published to npm)
- **@zaptime/vue3** - Vue 3 UI components built on core (published to npm)
- **iframe** - Zoid.js wrapper for embedding calendar via script tag (private, deployed to Cloudflare Pages)
- **examples/nuxt-example** - Nuxt 3 integration example

## Commands

```bash
# Install dependencies
pnpm install

# Development - runs all packages in parallel
pnpm dev
# Ports: vue3 (8888), iframe (8887)

# Build individual packages
pnpm --filter @zaptime/core build
pnpm --filter @zaptime/vue3 build
pnpm --filter iframe build

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
iframe ─────────────────┐
                        ├──▶ @zaptime/vue3 ──▶ @zaptime/core
nuxt-example ───────────┘
```

### Core Package (`@zaptime/core`)
Headless composables providing business logic without UI:
- `useCalendar` - Main calendar state and day/time slot management
- `useConfig` - Calendar configuration
- `useSelectedTimeSlot` - Current selection state
- `useBookingForm` - Form field management
- API functions: `book`, `reserve`, `confirm`, `cancel`, `reschedule`, `fetchRemoteConfiguration`

Built with tsup, exports ESM only.

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
1. CI builds core then vue3 (order matters due to dependency)
2. Changesets creates release PR or publishes to npm with provenance
3. GitHub releases created automatically

To add a changeset locally: `pnpm changeset`

## Key Environment Variables

- `VITE_STRIPE_CLIENT_KEY` - Required for vue3 production build (injected at build time)
