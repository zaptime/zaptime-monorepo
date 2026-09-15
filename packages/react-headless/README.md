# @zaptime/react-headless

Granular React bindings for the framework-free Zaptime booking engine. Supports React `^18.3.0 || ^19.0.0`; use matching React DOM.

```tsx
import { useCalendarInstance, useCalendar } from "@zaptime/react-headless";

export function Availability() {
  const instance = useCalendarInstance({ config: { token: "event-token" } });
  const { state, next } = useCalendar(instance);
  return (
    <button disabled={state.loading} onClick={() => void next()}>
      Next month
    </button>
  );
}
```

The owner initializes after commit and disposes after final unmount. A `ZaptimeProvider` borrows a host-owned instance. Hooks accept an explicit instance or use the nearest provider; there is no global ID registry. Server rendering is inert. State values are readonly, actions update them, and subscriptions select the slices needed by each hook.

Configuration changes use the engine's **patch semantics**. Omitting presentation options retains their current values; set `compact: false`, `externalBooking: false`, an empty redirect URL, or explicit theme values to change them. Nested theme/text patches merge with existing configuration. Removing optional endpoint, reservation UUID or authorization props explicitly clears those fields. Use a fresh owner to load a completely new set of remote/default presentation settings.

See the [React integration guide](../../docs/guides/react-headless.md), [ownership guide](../../docs/guides/calendar-lifecycle.md) and [payment recovery contract](../../docs/contracts/booking-recovery.md). This package imports no UI CSS or browser payment/analytics SDKs.
