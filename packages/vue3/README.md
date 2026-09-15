# @zaptime/vue3

Complete Vue booking calendar. Supports Vue `>=3.4.0 <4`, including Nuxt server rendering.

```vue
<script setup lang="ts">
import { ZaptimeCalendar } from "@zaptime/vue3";
import "@zaptime/vue3/style.css";
</script>
<template>
  <ZaptimeCalendar :config="{ token: 'YOUR_CALENDAR_TOKEN', locale: { preset: 'en' } }" />
</template>
```

Each component owns an independent booking session. `config` retains its theme, locale, compact mode, external booking, endpoint and rescheduling options. Optional `calendarId` registers the instance for explicitly targeted legacy controls.

Events: `calendar-loaded`, `time-slot-changed`, `booking-confirmed`, and additive `error` and `recovery-required`. Booking success is emitted only after the reservation is confirmed. The deprecated `ZapTimeCalendar` spelling and `@zaptime/vue3/dist/style.css` alias remain available.

`book`, `reserve`, `confirm`, `cancel` and `useCalendarViewState` remain exported. Outside component setup, legacy actions require one unambiguous mounted calendar or an explicit target. Use `@zaptime/vue-headless` for custom UI, writable input bindings and explicit owner/provider composition.

Set `config.stripePublishableKey` to override the maintained build's `VITE_STRIPE_CLIENT_KEY`. Unknown payments or unresolved confirmation retain the reservation reference and block another charge. Verified backend recovery is a release requirement; see the [recovery contract](../../docs/contracts/booking-recovery.md).

See the [migration guide](../../docs/guides/migration.md) and [lifecycle guide](../../docs/guides/calendar-lifecycle.md). Iframe integrations remain a separate supported embedding mode.
