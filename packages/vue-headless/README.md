# @zaptime/vue-headless

Vue bindings for an instance-owned Zaptime calendar, without CSS or browser SDKs.

```ts
import { useCalendarInstance, useCalendar, useBillingAddress } from "@zaptime/vue-headless";
const calendar = useCalendarInstance({ config: { token: "event-token" }, calendarId: "booking" });
const { state, next } = useCalendar(calendar);
const { billingAddress } = useBillingAddress(calendar);
```

`useCalendarInstance` runs in setup, provides its instance, initializes on mount,
and disposes after unmount. `provideCalendar(calendar)` and `ZaptimeProvider`
borrow an instance: the caller remains responsible for initialization and disposal.

Composables accept an explicit instance or registered ID. Without an argument they
use the nearest provider, then the unique calendar in the current app scope.
Standalone booking functions retain legacy options (including `calendarId`) and
also accept an explicit instance as the second argument. `cancel`, `reschedule`
and `stopReservationRefresh` accept an instance or ID directly. Outside setup,
browser lookup requires one mounted candidate; multiple apps with the same ID are
ambiguous. Server code must pass an instance. External code can instead retain a
`createCalendarScope()` and pass the result of `scope.resolve(id)` to actions.

Config, billing, booking-field and guest refs support nested bindings and array
edits through core actions. Config assignments validate synchronously; subsequent
initialization errors are exposed through core snapshot state and error events.
Deleting config properties throws an `invalid-config` error because core config
updates merge values. Assign an explicit replacement value to reset an override.
Calendar availability is derived and readonly; direct property writes throw.
Calendar Date values are detached mutable copies. The `state` object itself stays
stable across identity resets.

Browser integrations and complete calendar UI are separate packages. Core helper,
error and domain type exports remain available from this package.
