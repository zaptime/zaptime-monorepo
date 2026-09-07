---
name: zaptime-headless-calendar
description: Compose a custom booking calendar from the headless `@zaptime/core` composables and tailor it to the integrator's Vue 3 / Nuxt app (its design system, form components, styling). Use when asked to build a Zaptime calendar UI without `@zaptime/vue3`, restyle a Zaptime booking flow beyond theme tokens, add rescheduling or guests to a custom Zaptime UI, or wire `@zaptime/core` into an existing app.
---

# Compose a headless Zaptime calendar

`@zaptime/core` holds all booking logic (availability, selection, form schema, booking / reserve / confirm / reschedule API calls) in shared Vue composables. You write the views; the integrator's design system supplies every visual. `@zaptime/vue3` is the reference implementation of these same composables, read it when a step below is unclear ([`reference.md`](reference.md) lists which file answers what).

## Steps

### 1. Profile the integrator app

Record, before writing any code:

- Framework and rendering: Vue 3 SPA, Nuxt (SSR on?), Vite. Core state is module-level and browser-only, so with SSR every composable call runs inside `onMounted` or a `<ClientOnly>` subtree.
- Styling system: Tailwind, UnoCSS, CSS modules, tokens. Reuse it verbatim. Do not add `@zaptime/vue3` CSS or `cal-` classes.
- Existing UI primitives: button, input, select, checkbox, radio, textarea, combobox, skeleton, toast. The booking form renders remote-defined fields by `type`, so map each of the ten field types (`text email phone number textarea switch checkbox select multiselect radio`) to a primitive now. The integrator's primitives win over new ones.
- Where the calendar lives: standalone page, modal, step in a wizard. This decides the view state machine (step 4).

### 2. Pin the scope

Confirm with the user, or read from the request:

- Event type token (`config.token`). Without it nothing loads; ask.
- Flows needed: plain booking, rescheduling (`reservationUuid` present), guests, paid event types. Paid event types require Zaptime's Stripe publishable key and a Stripe Elements mount; if the integrator lacks the key, ship the free flow and say so ([`reference.md` → Payments](reference.md#payments)).
- Locale and timezone behaviour: fixed vs. user-switchable.
- One calendar per page or several. Several means a distinct `calendarId` string passed to every composable and API call.

### 3. Install and bootstrap

```bash
pnpm add @zaptime/core   # peer: vue ^3.4
```

Copy [`templates/useZaptimeInit.ts`](templates/useZaptimeInit.ts) into the app. It replays the exact init sequence `@zaptime/vue3` runs: fetch remote config → push locations, Stripe config, custom fields, max guests, reservation into core → merge remote configuration under local config → load date-fns locale → `setConfig` → `useCalendar().init()`. Keep the order; `init()` needs config and locale set first. The exposed `status` (`loading | ready | disabled | error`) drives the outer shell.

### 4. Build the views

Copy [`templates/HeadlessCalendar.vue`](templates/HeadlessCalendar.vue) as the wiring skeleton, then replace every element with the integrator's primitives and classes. It is deliberately unstyled; its value is the bindings. Views:

1. **Month grid**: `state.headers` (weekday labels), `state.days` (`Day.date === undefined` marks a padding day from the previous month; `Day.timeSlots === undefined` marks no availability), `dayClicked(day)`, `isSelectedDay(day)`, `prev/next` with `prevDisabled/nextDisabled`, `monthName`, `currentYear`, `state.loading` for skeletons, `state.monthHasTimeSlots === false` for the empty-month prompt that calls `next()`.
2. **Time slots**: `state.timeSlots` for the selected day, `selectTimeSlot(slot)`, `isSelected(slot)`, `useDateFormatters().getFormattedTime` / `getFormattedDayInMonth`. Optional timezone picker (`useCurrentTimezone().setTimezone`, then `getDays()` to refetch) and 12/24h switch (`useHourCycle().setHourCycle`).
3. **Booking form**: iterate `useBookingForm().bookingForm`, render by `type`, write with `setCustomFieldValue(uuid, value)`. `required` and `placeholder` come from the field. Guests via `useGuests` when `guestsEnabled`. Show the selected slot summary above the form.
4. **Success** and, when `useReservationReschedule().reservation` is set, a **reschedule confirmation** showing old → new slot instead of the form.

View transitions belong to the integrator app (own `ref`, router step, modal state). Core has no view state.

### 5. Wire submission

- Booking: `book({ calendarId, ...collectFormValues(), location: locations.value[0] })`. `collectFormValues()` maps merge-tagged fields (`FIRST_NAME LAST_NAME EMAIL PHONE`) to top-level args and the rest to `customFields`; email is mandatory server-side, so make the EMAIL field required in the UI.
- Reschedule: `reschedule(calendarId)` after a slot is selected; catches `RescheduleNotAllowedError`.
- Paid: `reserve(...)` → take payment against `reservations/{uuid}/payments` → `confirm({ calendarId })`; on payment failure `cancel(calendarId)`.
- Errors: `SlotNoLongerAvailableError` (409) → show `slotNoLongerAvailableText(config.locale)` and call `getDays()` to refresh; `res.success === false` → validation failure; anything else → generic failure. Disable the submit control while awaiting.
- After success: `book()` navigates to `redirectAfterBookingUrl` itself when the event type sets one, so render the success view only when that is unset.

### 6. Verify in the browser

Done means all of the following observed against the real token, not inferred from code:

- Init completes: `event-types/init` and `time-slots` requests succeed, the grid shows the first month with availability, the first available day is preselected.
- Clicking a day swaps time slots; clicking a slot opens the form with the correct formatted date and time in the app's locale and timezone.
- Every remote field renders with the integrator's primitive, `required` enforced, and a submitted booking returns `success: true` (use a test event type; cancel afterwards in the Zaptime dashboard).
- Each enabled extra flow (reschedule, guests, timezone switch, payment) exercised once.
- Nuxt only: page loads with SSR on without `window`/`navigator` errors in the server log.

## Gotchas core does not tell you

- `useCalendar().state` is a reactive object, not a ref. Read `state.days` in templates; destructuring `const { days } = state` freezes it.
- All core state is a per-module singleton keyed by `calendarId`. Two calendars without distinct ids share selection and config. `useReservationStatus(calendarId)` overwrites the whole map on set, so only one *paid* reservation can be in flight per page.
- `useDateFormatters` formats in English until `loadDateFnsConfig(preset)` resolves; the bootstrap template awaits it before `ready`.
- `init()` auto-advances to the next month when the current one has no slots. Expect `state.date` to differ from today.
- Changing timezone or locale in config triggers a refetch through core's watcher; changing timezone via `setTimezone` does not, call `getDays()`.
- `fetchRemoteConfiguration` returns a `ts-results-es` `Result`: branch on `isOk()`, read `.value` / `.error`. The only error is `"invalidToken"`; it also fires on network failure.
- Remote configuration (locale texts, theme, `closestBookableDay`, `min`/`max`) merges *under* local config: local keys override. Keep local config minimal so dashboard edits reach the UI.
