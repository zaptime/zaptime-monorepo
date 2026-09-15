# Migrate to the shared calendar engine

Core 3 and Vue UI 4 introduce instance-owned booking sessions. The new headless, React UI and browser packages start at 1.0.0. These are release targets; use the Changesets output for published versions.

## Complete Vue calendars

Keep importing `ZaptimeCalendar` from `@zaptime/vue3` and pass the same `config` and optional `calendarId`. Existing `calendar-loaded`, `time-slot-changed` and `booking-confirmed` events retain their payloads. `error` and `recovery-required` report failures separately. The deprecated `ZapTimeCalendar` alias remains available.

Import `@zaptime/vue3/style.css`; the previous `@zaptime/vue3/dist/style.css` path remains an alias. Each component owns an independent session, even when configurations use the same event token. Give separately controlled calendars distinct IDs within an application.

## Headless imports and setup

Move Vue composables from `@zaptime/core` to `@zaptime/vue-headless`. Create an owner once in setup and pass it explicitly or provide it to children:

```vue
<script setup lang="ts">
import { useCalendarInstance, useCalendar, useBillingAddress } from "@zaptime/vue-headless";
const calendar = useCalendarInstance({ config: { token: "event-token" } });
const { state, next } = useCalendar(calendar);
const { billingAddress } = useBillingAddress(calendar);
</script>
<template>
  <button :disabled="state.loading" @click="next">Next month</button>
  <input v-model="billingAddress.email" aria-label="Billing email" />
</template>
```

Editable billing, configuration, form and guest bindings route through engine actions. `useCalendar().state` remains a stable reactive facade across session resets. Derived days, slots, loading and selected-day projections are read-only; replace direct writes with `dayClicked`, `setSelectedTimeSlot`, `getDays` and the other actions.

## External controls and sharing

Retain an explicit instance for host-controlled operations:

```ts
import { createCalendar } from "@zaptime/core";
const calendar = createCalendar({ config: { token: "event-token" } });
await calendar.init();
// Select an available slot before booking.
const slot = calendar.getSnapshot().calendar.timeSlots[0];
if (slot) {
  calendar.actions.setSelectedTimeSlot({ ...slot });
  await calendar.actions.book({ email: "attendee@example.test" });
}
await calendar.dispose();
```

Vue's legacy standalone functions still resolve a single mounted calendar without an ID. Zero matches throw `calendar-not-found`; multiple matches throw `ambiguous-calendar`. Lookup never creates a calendar. Explicit app scopes keep registrations separate. Server code must retain an instance or scope; it never uses a browser-wide fallback.

## Intentional behavior changes

- Default instances no longer share configuration, billing, selections, preferences or timers.
- Changing token, normalized API base URL or reservation UUID clears the previous session. Identity changes reject while submitting or awaiting recovery.
- Appearance and locale updates preserve inputs. Hiding preserves state; owner unmount disposes it unless the host owns the supplied instance.
- Failed booking responses throw typed errors. An uncertain mutation or paid booking awaiting confirmation enters recovery and blocks another charge.
- Construction and server rendering are inert. Initialize only after client mount.

See [ownership](calendar-lifecycle.md), [payments](payments-and-recovery.md) and [SSR](ssr.md). Existing iframe embedding modes remain supported by the iframe integration.
