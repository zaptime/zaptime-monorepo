# `@zaptime/vue3` reference

Import from `@zaptime/vue3`: `ZaptimeCalendar`, `useCalendarViewState`, `book`, `reserve`, `confirm`, `cancel`, type `ZaptimeConfig`. Everything else from `@zaptime/core`.

## `<ZaptimeCalendar>`

| Prop | Type | Notes |
|---|---|---|
| `config` | `ZaptimeConfig` | Required. Watched: replacing or mutating a `ref` merges the new value into core. |
| `calendar-id` | `string` | Optional. Isolates state when several calendars share a page. Pass the same id to API calls. |
| `class` | | Forwarded onto the calendar, form and success containers. |

| Event | Payload | When |
|---|---|---|
| `booking-confirmed` | `ReservationResponse` | Zaptime's own form booked or rescheduled successfully. Not emitted for `externalBooking`. |
| `time-slot-changed` | `TimeSlot \| undefined` | Selection changed (`start`, `end` ISO strings). `undefined` on deselect. |
| `calendar-loaded` | none | Init finished (remote config fetched, first month loaded). Fires also for disabled event types. |

Rendering states: spinner (`min-height 360px`, width 820px) until loaded → calendar, or "calendar disabled" panel when the event type is disabled in the dashboard.

## `ZaptimeConfig`

| Key | Type | Effect |
|---|---|---|
| `token` | `string` | Event type token from the dashboard. Required. |
| `apiBaseUrl` | `string` | API root with trailing slash. Default production. |
| `locale.preset` | `string` | date-fns locale code; drives date formatting and fallback texts. |
| `locale.startDayOfWeek` | `"mon"`…`"sun"` | First column of the grid. |
| `locale.headers` | `{ mon..sun }` | Weekday labels. |
| `locale.hideTimePreferences` | `boolean` | Hides the timezone / 12h-24h controls. |
| `locale.texts` | `{ introduction, chooseDate, noTimeSlotAvailable, choosePreferredTime, pickTime, showNextMonth }` | Calendar copy. |
| `locale.confirmationForm` | `{ confirmBooking, reschedulingEvent, addGuests, slotNoLongerAvailable, rescheduleNotAllowed, buttons: { confirmBooking, reschedule, goBack }, payments: {...} }` | Form copy. |
| `theme.mode` | `"light" \| "dark"` | Anything but `"light"` renders dark. |
| `theme.preset` | `"basic" \| "elegant" \| "playful"` | Dashboard preset name; visual differences are driven through colors. |
| `theme.borderRadius` | `string` | CSS length or `"full"` (→ 24px). |
| `theme.colors` | `{ "25".."900", accentLight, accentBase, accentDark, white, black }` | Gray scale and accent, mapped to `--c-zaptime-*` CSS variables on `#zaptime-calendar`. |
| `compact` | `boolean` | Single-column layout (date, then time). Forced on under 860px viewport. |
| `hideLocation` | `boolean` | Hide the location line in the header. |
| `profileImage` | `string` | Organizer avatar URL; `""` hides it. |
| `min` / `max` | `number` | Months navigable backward / forward. |
| `closestBookableDay` | `number` | Days from today before the first bookable slot. |
| `redirectAfterBookingUrl` | `string` | `window.location.href` set after a successful `book`/`confirm`. |
| `externalBooking` | `boolean` | Slot pick does not open the form; host books via the API. |
| `reservationUuid` | `string` | Puts the calendar in reschedule mode for that reservation. |
| `rescheduleOverrideToken` | `string` | Server-issued organizer proof sent with `reschedule`. |

Merge order: core defaults ← remote (dashboard) configuration ← local `config`. Deep merge; local keys win, including empty strings.

## Theme CSS variables

Set on `#zaptime-calendar` from `theme.colors`; override in host CSS when a token is missing from config:

```
--c-zaptime-25 … --c-zaptime-900   gray scale (25 lightest)
--c-zaptime-accent-light / -base / -dark
--radius-zaptime
```

Dark mode uses the same scale inverted (`900` as background). Provide the full scale when changing one end, otherwise contrast breaks.

## API functions (re-exported from core)

All read token, base URL, selected slot and timezone from core state for the given `calendarId`.

| Function | Signature | Throws |
|---|---|---|
| `book` | `({ email, firstName?, lastName?, phone?, seats?, location?, customFields?, guests?, calendarId? }) => Promise<ReservationResponse>` | `SlotNoLongerAvailableError`, `Error` |
| `reserve` | same options; holds the slot, refreshes every 15 min | same |
| `confirm` | `({ calendarId?, firstName?, lastName?, phone?, customFields?, guests? }) => Promise<ReservationResponse>` | `Error` |
| `cancel` | `(calendarId?) => Promise<boolean>` | `Error` |
| `reschedule` (core only) | `(calendarId?) => Promise<ReservationResponse>` | `RescheduleNotAllowedError`, `Error` |

Types: `Location = { type: string; value: string; default?: boolean }` (types seen: `"in-person"`, `"phone-call"`, `"online"`); `customFields: { uuid: string; value?: string \| number \| boolean \| string[] }[]`; `guests: string[]` (emails); `ReservationResponse = { success: boolean; data: { uuid, userId, userName, userEmail } }`.

## `useCalendarViewState(calendarId?)`

Returns `view` (`"calendar" | "form" | "success"`), `calendarView` (`"pickingDate" | "pickingTime"`, compact mode only), `setView`, `setCalendarView`. Use it to reset the widget to the grid after a host-side action (`setView("calendar")`) or to detect that the user is on the form.

## Nuxt specifics

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["@zaptime/vue3/dist/style.css"],
});
```

```vue
<ClientOnly>
  <ZaptimeCalendar :config="config" @booking-confirmed="onBooked" />
  <template #fallback><div style="min-height: 360px" /></template>
</ClientOnly>
```

No Nuxt module or plugin is required; import the component directly in the page. Do not add `@zaptime/vue3` to `build.transpile` unless the build reports ESM errors.

## Where the source answers a question

Paths relative to the monorepo, `packages/vue3/src/`:

- Props, events, CSS variable binding → `App.vue`
- Init sequence, disabled state, reschedule preselect → `composables/useInitialization.ts`
- Layout, compact vs. wide, view switching → `components/Calendar.vue`
- Slot click behaviour and `externalBooking` → `components/DefaultCalendar/TimeSelection.vue`
- Booking form, payment, error messages → `components/ConfirmForm.vue`
- Auto-compact breakpoint (860px) → `composables/useCompactSwitcher.ts`, `utils/mergeConfigs.ts`
- Tailwind prefix / `important` scope → `tailwind.config.js`
- Public docs → https://docs.zaptime.app/guide/vue-installation.html, https://docs.zaptime.app/guide/vue-working-with-time-slots.html
- Working examples → `examples/nuxt-example/pages/index.vue`, `packages/vue3/example/Example.vue`
