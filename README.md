<p align="center">
  <a href="https://zaptime.app">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/zaptime-logo-dark.svg">
      <img src=".github/assets/zaptime-logo.svg" alt="Zaptime" width="240">
    </picture>
  </a>
</p>

<p align="center">
  Embeddable booking calendars for Vue, React, Nuxt, Next.js, and any website.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zaptime/vue3"><img src="https://img.shields.io/npm/v/@zaptime/vue3?label=%40zaptime%2Fvue3&color=ff4247" alt="npm @zaptime/vue3"></a>
  <a href="https://www.npmjs.com/package/@zaptime/core"><img src="https://img.shields.io/npm/v/@zaptime/core?label=%40zaptime%2Fcore&color=ff4247" alt="npm @zaptime/core"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://docs.zaptime.app"><strong>Documentation</strong></a> ·
  <a href="https://zaptime.app">Website</a> ·
  <a href="https://github.com/ZapTime/zaptime-monorepo/issues">Issues</a>
</p>

---

## Packages

| Package                                              | Description                                                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`@zaptime/vue3`](packages/vue3)                     | Ready-to-use `ZaptimeCalendar` component for Vue 3 and Nuxt.                                         |
| [`@zaptime/core`](packages/core)                     | Framework-free calendar instances, validation and booking orchestration.                             |
| [`@zaptime/vue-headless`](packages/vue-headless)     | Granular Vue composables backed by shared instances.                                                 |
| [`@zaptime/react-headless`](packages/react-headless) | Granular React hooks backed by shared instances.                                                     |
| [`@zaptime/react`](packages/react)                   | Complete React and Next.js calendar.                                                                 |
| [`@zaptime/browser`](packages/browser)               | Optional Stripe, analytics and navigation integrations.                                              |
| [`iframe`](packages/iframe)                          | Script-tag embed for plain HTML sites. Deployed to [iframe.zaptime.app](https://iframe.zaptime.app). |

## Quick start

### Vue 3 / Nuxt

```bash
pnpm add @zaptime/vue3
```

```vue
<script setup lang="ts">
import { ZaptimeCalendar } from "@zaptime/vue3";
import "@zaptime/vue3/style.css";
</script>

<template>
  <ZaptimeCalendar :config="{ token: 'YOUR_TOKEN' }" />
</template>
```

### React / Next.js

```tsx
"use client";
import { ZaptimeCalendar } from "@zaptime/react";
import "@zaptime/react/style.css";

export function Booking() {
  return <ZaptimeCalendar config={{ token: "YOUR_TOKEN" }} />;
}
```

### Custom calendars

Use [Vue headless](docs/guides/vue-headless.md) or [React headless](docs/guides/react-headless.md) to compose your own UI. Each owner has an independent session; share an instance explicitly when multiple consumers should control one booking.

See [migration](docs/guides/migration.md), [ownership](docs/guides/calendar-lifecycle.md), [SSR](docs/guides/ssr.md), and [payments/recovery](docs/guides/payments-and-recovery.md).

### Script tag

```html
<div id="zaptime-container"></div>
<script src="https://iframe.zaptime.app/zaptime.js"></script>
<script>
  Zaptime({ config: { token: "YOUR_TOKEN" } }).render("#zaptime-container");
</script>
```

Full configuration, theming, localization, and headless usage are covered in the [documentation](https://docs.zaptime.app).

## AI agent skills

The repo ships agent skills in [`.claude/skills`](.claude/skills) that guide Claude Code, Cursor, Codex, and other agents through a Zaptime integration. Install them into your project with the [skills](https://skills.sh) CLI:

```bash
npx skills add ZapTime/zaptime-monorepo
```

| Skill                                                                            | Use it when                                                                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`zaptime-vue-integration`](.claude/skills/zaptime-vue-integration/SKILL.md)     | Embedding and configuring `ZaptimeCalendar` from `@zaptime/vue3` in a Vue 3 or Nuxt app.                                                   |
| [`zaptime-headless-calendar`](.claude/skills/zaptime-headless-calendar/SKILL.md) | Building a custom Vue calendar. Existing skill examples using core composables require the [headless migration](docs/guides/migration.md). |

## Development

Use Node **22.18.x** and pnpm **10.6.5**.

```bash
pnpm install --frozen-lockfile
pnpm -r --if-present run build
pnpm dev        # vue3 on :8888, iframe on :8887
pnpm lint
pnpm format
pnpm -r --if-present run typecheck
pnpm -r --if-present run test
pnpm test:packages
pnpm exec playwright test
```

The [release matrix](docs/validation/calendar-release.md) records actual results. Backend payment recovery remains a separate staging gate; synthetic tests do not establish production readiness. Publishing and iframe deployment use separate workflows.

## License

[MIT](LICENSE) © Zaptime s.r.o.
