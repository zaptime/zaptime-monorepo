# Build a custom Vue calendar

Install `@zaptime/vue-headless` with Vue `>=3.4.0 <4`. The adapter supplies state and actions without UI CSS or payment SDKs.

```vue
<script setup lang="ts">
import { useCalendarInstance, useCalendar, useSelectedTimeSlot } from "@zaptime/vue-headless";
const calendar = useCalendarInstance({ config: { token: "event-token" } });
const { state, dayClicked, next, prev } = useCalendar(calendar);
const { selectedTimeSlot } = useSelectedTimeSlot(calendar);
</script>
<template>
  <p v-if="state.loading" role="status">Loading availability</p>
  <template v-else>
    <button @click="prev">Previous month</button>
    <button @click="next">Next month</button>
    <button
      v-for="(day, index) in state.days"
      :key="index"
      :disabled="day.isPast || !day.timeSlots?.length"
      @click="dayClicked(day)"
    >
      {{ day.label }}
    </button>
    <p v-if="selectedTimeSlot">{{ selectedTimeSlot.start }}</p>
  </template>
</template>
```

The owner provides its instance to descendants. Each granular composable accepts an explicit `CalendarInstance` or registered ID; omitting the argument uses the nearest provider, then an unambiguous application registration. Explicit instances make custom integration ownership easiest to see.

## Capabilities

| Composable                           | State and actions                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `useCalendar`                        | Stable reactive calendar state, navigation, selection predicates and initialization |
| `useConfig`                          | Writable configuration and configuration updates                                    |
| `useSelectedTimeSlot`                | Selected slot and selection updates                                                 |
| `useCurrentTimezone`, `useHourCycle` | Instance preferences and original client preferences                                |
| `useDateFormatters`                  | Localized date/time formatting                                                      |
| `useLocations`, `useStripeConfig`    | Location and pricing configuration                                                  |
| `useBookingForm`                     | Editable fields and collected booking values                                        |
| `useGuests`, `useBillingAddress`     | Editable guest and billing inputs                                                   |
| `useReservationReschedule`           | Reservation being rescheduled                                                       |
| `useCalendarViewState`               | Calendar/form/success and date/time view state                                      |

Existing refs and editable nested bindings remain supported. Use actions for derived calendar data. For a host-owned instance use `provideCalendar(instance)` or `<ZaptimeProvider :calendar="instance">`; the host must initialize and dispose it.

Configuration updates merge as patches. Set explicit values to change presentation options; deleting a configuration property throws a typed `invalid-config` error. Assigning an editable ref or writing a nested field remains supported.

The scalar `clientOriginalTimezone` and `clientOriginalHourCycle` properties are live getters. Read them from the returned composable object inside a Vue `computed` or render expression to follow initialization. Destructuring a scalar before initialization captures the deterministic `UTC`/`h23` placeholder; the editable `timezone` and `hourCycle` refs remain reactive when destructured.

Use `calendar.actions.submit()` for the complete booking workflow. Granular `book`, `reserve`, `confirm`, `cancel`, and `reschedule` actions remain available for external booking integrations. See [payments and recovery](payments-and-recovery.md) before building checkout controls.
