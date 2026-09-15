# Calendar ownership and lifecycle

`createCalendar` creates an inert session. It does not fetch, start timers, detect local preferences, or register a global calendar. `init()` loads remote configuration and availability; concurrent initialization calls share the work.

Each instance owns its inputs, preferences, locale, reservation identity, pending operations and refresh scheduling. Sharing requires passing the same instance to multiple consumers.

| Integration                                | Initializes                       | Disposes                         |
| ------------------------------------------ | --------------------------------- | -------------------------------- |
| Complete Vue/React calendar                | Component owner after mount       | Component owner on final unmount |
| `useCalendarInstance(options)`             | Hook/composable owner after mount | Owner on final unmount           |
| `ZaptimeProvider` with a supplied instance | Host                              | Host                             |
| `provideCalendar(instance)`                | Host                              | Host                             |
| Direct `createCalendar(options)`           | Host calls `init()`               | Host calls `dispose()`           |

Child hooks and providers borrow state. Hiding a view or switching between calendar and form preserves the session. To retain progress across component unmounts, keep the instance in a longer-lived host owner and provide it again.

## Subscriptions

`getSnapshot()` has stable identity until a committed change. Unchanged slices retain identity, allowing a day grid to avoid rerendering for billing edits. Snapshots are deeply read-only. Treat Dates as values; create a copy when an API needs a mutable Date.

```ts
const unsubscribe = calendar.subscribe(() => {
  const snapshot = calendar.getSnapshot();
  renderStatus(snapshot.phase);
});
const offEvent = calendar.onEvent((event) => {
  if (event.type === "booking-confirmed") showConfirmation(event.payload);
});
unsubscribe();
offEvent();
```

`renderStatus` and `showConfirmation` are host functions. Removing a subscription is idempotent. Observer exceptions cannot turn successful bookings into failures.

## Disposal and changes

Disposal immediately detaches consumers and rejects new actions. Obsolete reads are aborted. An active booking operation keeps the resources it needs until it reaches a bounded terminal or recovery state; canceling a fetch does not undo a server mutation. Disposal does not automatically cancel a reservation.

Theme/text/locale updates preserve the session. The normalized endpoint, event token and rescheduled reservation UUID identify the session; changing them resets inputs and invalidates stale reads. Identity and reschedule-authorization changes reject during active submission, and identity changes also reject during unresolved recovery.

React owner cleanup uses a deferred lease so StrictMode effect replay does not dispose a live instance or repeat initialization. Explicit `dispose()` remains terminal. Page closure needs backend completion/recovery; an in-memory owner cannot guarantee it.
