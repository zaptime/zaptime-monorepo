# `@zaptime/core` reference for headless composition

Every composable takes an optional `calendarId?: string` and returns state for that calendar. Omit it for a single calendar. Import everything from `@zaptime/core`.

## Composables

| Composable | Returns | Notes |
|---|---|---|
| `useConfig` | `config` (computed `ZaptimeConfig`), `setConfig(cfg)` | `setConfig` merges over core defaults. Fields: `token`, `min`/`max` (months back/forward), `closestBookableDay`, `locale`, `theme`, `apiBaseUrl`, `redirectAfterBookingUrl`, `reservationUuid`, `rescheduleOverrideToken`, `externalBooking`, `compact`, `hideLocation`, `profileImage`. |
| `useCalendar` | `init()`, `getDays()`, `next()`, `prev()`, `nextDisabled`, `prevDisabled`, `dayClicked(day)`, `dayHasTimeSlot(day)`, `isSelectedDay(day)`, `selectTimeSlot(slot)`, `isSelected(slot)`, `monthName`, `currentYear`, `state` (reactive `CalendarState`), `config` | `state`: `date`, `days: Day[]`, `timeSlots: TimeSlot[]` (selected day), `selectedDay`, `loading`, `headers: string[]`, `monthHasTimeSlots`, `initLoaded`. |
| `useSelectedTimeSlot` | `selectedTimeSlot`, `setSelectedTimeSlot(slot \| undefined)` | Clear with `undefined` when leaving the form. |
| `useBookingForm` | `bookingForm` (`CustomField[]`), `setBookingForm(fields)`, `setCustomFieldValue(uuid, value)`, `collectFormValues()` | `collectFormValues()` → `{ email, firstName, lastName, phone, customFields, guests }`, ready to spread into `book`/`reserve`. |
| `useGuests` | `guests`, `maxGuests`, `guestsEnabled`, `canAddGuest`, `addGuest(email?)`, `removeGuest(i)`, `updateGuest(i, email)`, `setMaxGuests(n)` | Enabled when remote `maxGuests > 0`. |
| `useLocations` | `locations`, `setLocations`, `isPhoneCall` | Pass `locations.value[0]` (or the user's pick) as `location` when booking. |
| `useCurrentTimezone` | `timezone`, `setTimezone(tz)`, `clientOriginalTimezone` | Global, not per calendar. Timezone list: `GET {apiBaseUrl}timezones` → `{ data: string[] }`. |
| `useHourCycle` | `hourCycle` (`"h23"` \| `"h11"`), `setHourCycle`, `clientOriginalHourCycle` | Global. |
| `useDateFormatters` | `getFormattedTime(iso)`, `getFormattedDay(iso)` (weekday), `getFormattedDayInMonth(iso)` (long date), `loadDateFnsConfig(localePreset)` | Formats in current timezone and hour cycle. |
| `useReservationReschedule` | `reservation`, `setSelectedReservation(r)` | Set from init data when `config.reservationUuid` is given. `reservation.start/end` are the current booking. |
| `useStripeConfig` | `stripeConfig`, `setStripeConfig` | `{ price, currency, stripeAccountId }`, present only for paid event types. |
| `useBillingAddress` | `billingAddress`, `updateBillingAddressField(k, v)`, `setBillingAddress` | Paid flow only. |

## API functions

All read token, base URL, selected slot and timezone from core state; pass `calendarId` when used.

| Function | Signature | Throws |
|---|---|---|
| `fetchRemoteConfiguration` | `(token, apiBaseUrl?, reservationUuid?) => Promise<Result<InitData, "invalidToken">>` | never; returns `Err` |
| `book` | `(opts: { email, firstName?, lastName?, phone?, seats?, location?, customFields?, guests?, calendarId? }) => Promise<ReservationResponse>` | `SlotNoLongerAvailableError`, `Error` |
| `reserve` | same options; holds the slot and refreshes it every 15 min | same |
| `confirm` | `({ calendarId?, firstName?, lastName?, phone?, customFields?, guests? }) => Promise<ReservationResponse>` | `Error` |
| `cancel` | `(calendarId?) => Promise<boolean>` | `Error` |
| `reschedule` | `(calendarId?) => Promise<ReservationResponse>` | `RescheduleNotAllowedError`, `Error` |
| `stopReservationRefresh` | `() => void` | call on unmount if a reservation is in flight |

`ReservationResponse`: `{ success: boolean, data: { uuid, userId, userName, userEmail } }`.

`InitData` (the `Ok` value of `fetchRemoteConfiguration`): `configuration` (remote `ZaptimeConfig` minus token), `disabled`, `locations?`, `stripeConfig?`, `customFields?`, `reservation?`, `maxGuests?`, `isSubscribed`, `eventTypeName`, `analytics?`.

`CustomField`: `{ uuid, name, label, type, required, placeholder?, options?, mergeTag?, value? }`. `options` is set for `select`, `multiselect`, `radio`. `value` types: `string | number | boolean | string[]`.

Text helpers: `slotNoLongerAvailableText(locale)`, `rescheduleNotAllowedText(locale)` pick the localized message with an English fallback.

## Payments

Paid event types (`stripeConfig` set) need Zaptime's Stripe **publishable** key (the `VITE_STRIPE_CLIENT_KEY` used by `@zaptime/vue3`) and Stripe Elements. Sequence, mirrored from `packages/vue3/src/components/ConfirmForm.vue` and `composables/useStripe.ts`:

1. `reserve({...collectFormValues(), calendarId, location})` → `res.data.uuid`.
2. `POST {apiBaseUrl}api/reservations/{uuid}/payments` with `Authorization: Bearer {token}` and billing fields (`email`, `name`, `country` required) → `data.clientSecret`.
3. `stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } })` with `Stripe(publishableKey, { stripeAccount: stripeConfig.stripeAccountId })`.
4. `confirm({ calendarId })`. On any failure after step 1: `cancel(calendarId)`.

Without the publishable key, embed `@zaptime/vue3`'s `ZaptimeCalendar` for that event type instead.

## Where the reference implementation answers a question

Paths relative to the zaptime monorepo, `packages/vue3/src/`:

- Init sequence → `composables/useInitialization.ts`
- Day cell states (past, no slots, selected, today) → `components/DefaultCalendar/DaysGrid.vue`
- Slot list, empty states, timezone + hour cycle controls → `components/DefaultCalendar/TimeSelection.vue`, `components/atomic/TimeZonePicker.vue`
- Field type → input mapping → `components/BookingForm/FormBuilder.vue` and `components/BookingForm/components/*.vue`
- Guest emails UX → `components/BookingForm/components/GuestEmails.vue`
- Submit, payment and error branches → `components/ConfirmForm.vue`
- Public docs → https://docs.zaptime.app/guide/vue-working-with-time-slots.html
