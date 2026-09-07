<p align="center">
  <a href="https://zaptime.app">
    <img src=".github/assets/zaptime-logo.svg" alt="Zaptime" width="240">
  </a>
</p>

<p align="center">
  Embeddable booking calendar for Vue 3, Nuxt, and any website.
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

| Package | Description |
| --- | --- |
| [`@zaptime/vue3`](packages/vue3) | Ready-to-use `ZaptimeCalendar` component for Vue 3 and Nuxt. |
| [`@zaptime/core`](packages/core) | Headless composables and API helpers for building a custom calendar UI. |
| [`iframe`](packages/iframe) | Script-tag embed for plain HTML sites. Deployed to [iframe.zaptime.app](https://iframe.zaptime.app). |

## Quick start

### Vue 3 / Nuxt

```bash
pnpm add @zaptime/vue3
```

```vue
<script setup lang="ts">
import { ZaptimeCalendar } from "@zaptime/vue3";
import "@zaptime/vue3/dist/style.css";
</script>

<template>
  <ZaptimeCalendar :config="{ token: 'YOUR_TOKEN' }" />
</template>
```

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

| Skill | Use it when |
| --- | --- |
| [`zaptime-vue-integration`](.claude/skills/zaptime-vue-integration/SKILL.md) | Embedding and configuring `ZaptimeCalendar` from `@zaptime/vue3` in a Vue 3 or Nuxt app. |
| [`zaptime-headless-calendar`](.claude/skills/zaptime-headless-calendar/SKILL.md) | Building a fully custom calendar UI on top of the `@zaptime/core` composables. |

## Development

```bash
pnpm install
pnpm dev        # vue3 on :8888, iframe on :8887
pnpm lint
pnpm format
```

## License

[MIT](LICENSE) © Zaptime s.r.o.
