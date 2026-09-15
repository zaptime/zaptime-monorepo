# Build a custom React calendar

Install `@zaptime/react-headless` with React `^18.3.0 || ^19.0.0`. Use a matching React DOM version. Hooks expose ordinary render values and stable actions, backed by the same engine as Vue.

```tsx
"use client";
import { ZaptimeProvider, useCalendarInstance, useCalendar } from "@zaptime/react-headless";

export function Booking() {
  const calendar = useCalendarInstance({ config: { token: "event-token" } });
  return (
    <ZaptimeProvider calendar={calendar}>
      <Days />
    </ZaptimeProvider>
  );
}
function Days() {
  const { state, next } = useCalendar();
  return (
    <button disabled={state.loading} onClick={() => void next()}>
      Next month
    </button>
  );
}
```

All granular hooks accept an optional explicit instance, otherwise use the nearest provider. A missing instance/provider throws a clear lookup error. React has no implicit global calendar registry.

The granular capabilities match [Vue headless](vue-headless.md#capabilities): calendar, configuration, selected slot, timezone/hour cycle, formatters, locations/pricing, custom fields, guests, billing, rescheduling and view state. Edit values through their setter actions; React values do not use `.value` and are not mutable proxies.

Subscriptions select domain slices with stable snapshots. An unrelated billing update does not force a calendar-only consumer to rerender. Config objects may be inline: equivalent configuration does not reinitialize the session solely because an object identity changes.

Owner configuration updates use core patch semantics. Omitting a presentation option retains its current value; pass `compact: false`, `externalBooking: false`, an empty redirect URL, or explicit theme values to change it. Nested theme/text patches merge. Removing optional endpoint, reservation UUID or authorization props clears those identity-related fields. Use a fresh owner to reload all remote/default presentation settings.

`useCalendarInstance` owns initialization and cleanup after commit. A supplied `ZaptimeProvider` borrows its instance; initialize and dispose that instance in the host. Construction, hooks during server render, and loading markup make no API requests. See [SSR](ssr.md).
