---
name: zaptime-vue-integration
description: Embed the ready-made `ZaptimeCalendar` component from `@zaptime/vue3` into a Vue 3 or Nuxt app, configure it (token, theme, locale, compact, reschedule), react to its events, and optionally drive booking from the host app's own form via `externalBooking`. Use when asked to add a Zaptime booking calendar to a Vue/Nuxt project, theme or localize it, handle `booking-confirmed`, run several calendars on one page, or fix SSR/CSS problems with `@zaptime/vue3`. For a fully custom UI use `zaptime-headless-calendar` instead.
---

# Integrate `@zaptime/vue3` into a Vue 3 / Nuxt app

`@zaptime/vue3` ships one component, `ZaptimeCalendar`, that owns the whole flow: month grid → time slots → booking form → success. The host app supplies a `config` (token plus overrides) and listens to events. Styling is Tailwind with a `cal-` prefix scoped under `#zaptime-calendar`, themed through `config.theme`. If the request needs a look the theme tokens cannot express, switch to `zaptime-headless-calendar`.

[`reference.md`](reference.md) lists every prop, event, config key, theme token and exported function.

## Steps

### 1. Profile the host app

Record before writing code:

- Vue 3 SPA (Vite) or Nuxt. Nuxt with SSR needs the component inside `<ClientOnly>`; core state is browser-only.
- Existing CSS reset / Tailwind. The package ships its own preflight scoped to `#zaptime-calendar`, so host Tailwind is not required and its prefix never collides with `cal-`.
- Where the calendar renders: inline section, modal, wizard step. Default layout is 841px wide (or 330–400px in `compact` mode; compact switches on automatically under 860px viewport).
- Whether the host wants Zaptime's built-in booking form or its own form (`externalBooking`, step 5).

### 2. Pin the scope

Read from the request or ask:

- Event type token (`config.token`). Nothing loads without it.
- Flows: plain booking, rescheduling (`config.reservationUuid`), paid event types (work out of the box; the Stripe key is baked into the published bundle).
- Locale: `locale.preset` is a date-fns locale code (`en`, `cs`, `sk`, `pl`, `de`, ...); dashboard texts arrive from the remote configuration and local `locale.texts` override them.
- Theme: `mode` light/dark, accent colors, gray scale, `borderRadius`. Prefer configuring these in the Zaptime dashboard so non-developers can edit them; pass locally only what must be app-controlled.
- Multiple calendars per page → unique `calendarId` per instance, passed both as the prop and to any `book/reserve/confirm/cancel` call.

### 3. Install

```bash
pnpm add @zaptime/vue3   # peer: vue ^3.0; pulls @zaptime/core
```

Import the stylesheet once, globally (the JS bundle does not import it):

- Vite SPA: `import "@zaptime/vue3/dist/style.css"` in `main.ts`.
- Nuxt: `css: ["@zaptime/vue3/dist/style.css"]` in `nuxt.config.ts`.

Do not use `@import url("/node_modules/...")` in a component `<style>`; it works in dev only.

### 4. Mount the component

Copy [`templates/BookingCalendar.vue`](templates/BookingCalendar.vue) into the host app. It wraps `ZaptimeCalendar`, builds `config` from props, and re-emits `booking-confirmed`, `time-slot-changed` and `calendar-loaded`. Adjust:

- Keep `config` a plain object or a `ref`; the component watches the prop and merges changes into core, so updating `config.value.locale` at runtime works without remount.
- Nuxt: wrap in `<ClientOnly>` with a placeholder of the same footprint (`min-height: 360px`) to avoid layout shift.
- Modal usage: mount the calendar only when the modal opens (`v-if`), not `v-show`; init runs in `onMounted` and needs real viewport widths for the compact switch.
- `booking-confirmed` receives `ReservationResponse` (`{ success, data: { uuid, userId, userName, userEmail } }`). The component already shows its own success view; use the event for analytics, closing the modal, or navigation. If `redirectAfterBookingUrl` is set the browser navigates away before the event is useful.

### 5. Host-owned booking form (optional)

With `externalBooking: true` picking a slot no longer opens Zaptime's form; the calendar stays on the slot view and emits `time-slot-changed`. The host then submits with the exported API. Copy [`templates/ExternalBookingForm.vue`](templates/ExternalBookingForm.vue):

1. Track the current slot from `time-slot-changed` (undefined means deselected).
2. Submit with `book({ email, firstName, lastName, phone, customFields, location, calendarId })`. Email is required server-side. Custom field UUIDs come from the event type's booking form in the dashboard (or `useBookingForm().bookingForm` from `@zaptime/core` after init).
3. Two-phase alternative: `reserve(...)` holds the slot (auto-refreshed every 15 min), then `confirm({ calendarId })` or `cancel(calendarId)`.
4. Catch `SlotNoLongerAvailableError` (409) and refresh with `useCalendar(calendarId).getDays()` from `@zaptime/core`.

`externalBooking` also removes the "Confirm" button under the slot list; the host must render its own call to action.

### 6. Verify in the browser

Done means observed against the real token, not inferred:

- Network: `event-types/init` and `time-slots` succeed; grid shows first month with availability, first available day preselected.
- Stylesheet applied: calendar renders in Zaptime styling, no unstyled text, no host reset bleeding in (fonts, button borders).
- Theme and locale overrides visible (accent color, weekday labels, texts).
- A test booking completes; `booking-confirmed` fires with `success: true`. Cancel it afterwards in the Zaptime dashboard.
- Responsive: viewport under 860px collapses to compact view without horizontal overflow.
- Nuxt SSR: server log has no `window`/`navigator`/`localStorage` errors; hard reload of the page renders the calendar.
- Every extra flow enabled (reschedule, external booking, second calendar) exercised once.

## Gotchas

- Missing stylesheet is the most common failure: the calendar renders as a bare list. Import `dist/style.css` globally.
- `#zaptime-calendar` is an id, so two calendars on a page duplicate it. It works (styles use the id only as a specificity boost) but fails HTML validation; accept it or use one calendar per page.
- The component sets `cal-dark` on itself when `theme.mode` is anything but `"light"`; remote config supplies the mode from the dashboard, so an unexpected dark calendar usually means the dashboard theme is dark.
- `config` merging: remote configuration (dashboard) is the base, local `config` overrides it key by key (deep). Empty string overrides too: `locale.texts.introduction: ""` hides the introduction text.
- `hideLocation: true` hides the location line; `profileImage: ""` hides the avatar.
- Rescheduling: pass `reservationUuid` (from the reschedule link's query string). The component preselects the reservation's day and shows old → new confirmation; it emits `booking-confirmed` on success and shows a localized message when the API refuses (notice period, already started, disabled). `rescheduleOverrideToken` lets an authenticated organizer bypass attendee rules; it must be issued server-side.
- Core state is module-level: navigating between two pages that each mount a calendar with the *same* `calendarId` (or none) shares selection and config across them. Use distinct ids or accept that the second page inherits state.
- `apiBaseUrl` defaults to production; set it only for staging/self-hosted API and keep the trailing slash.
- `min`/`max` are months backwards/forwards the user can navigate; `closestBookableDay` is the offset in days for the first bookable date. Dashboard values apply unless overridden.
- `@zaptime/vue3` re-exports `book`, `reserve`, `confirm`, `cancel` and `useCalendarViewState`; everything else (`useCalendar`, `useBookingForm`, errors, `reschedule`) is imported from `@zaptime/core`, which is installed transitively; add it as a direct dependency when you import from it.
