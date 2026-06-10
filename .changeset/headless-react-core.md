---
"@zaptime/react-core": minor
"@zaptime/core": patch
---

Add `@zaptime/react-core`: headless React hooks that mirror the `@zaptime/core`
(Vue) composable API one-to-one — `useCalendar`, `useConfig`,
`useSelectedTimeSlot`, `useBookingForm`, `useGuests`, the imperative
`book`/`reserve`/`confirm`/`cancel`/`reschedule` functions, and the rest. Hooks
return already-unwrapped reactive values (no Vue `.value`); state is shared via
`useSyncExternalStore` over module-level stores keyed by `calendarId`.

Both framework packages now share their HTTP client, calendar/locale logic,
default config and types through a new internal `@zaptime/core-shared` package
(framework-agnostic, bundled into each published artifact — not published on its
own). This is an internal refactor of `@zaptime/core` with **no breaking
changes**: its public API is unchanged, with `CalendarState` additionally
exported as a type so the generated declarations stay self-contained.
