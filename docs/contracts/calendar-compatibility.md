# Calendar compatibility baseline

Captured 2026-09-15 from the current source entrypoints, composables, Vue UI, iframe and Nuxt example. This inventory describes the existing public surface and intended migration invariants; it does not certify the new engine or backend recovery.

## Verification before edits

All commands used `PATH=/Users/tomas/.nvm/versions/node/v22.18.0/bin:$PATH npx --yes pnpm@10.6.5` followed by the arguments below.

| Command                       | Existing result                           |
| ----------------------------- | ----------------------------------------- |
| `--filter @zaptime/core test` | Pass: 7 files, 38 tests                   |
| `--filter iframe test`        | Pass: 8 files, 117 tests                  |
| `lint`                        | Exit 0: 238 warnings, zero errors         |
| `format:check`                | Exit 1: 90 existing files need formatting |

An earlier run under Node 22.22.2 produced the same results, after retrying an npm bootstrap `ENOTEMPTY` error. The complete four-command baseline was repeated under the required Node 22.18.0 before any Task 1 edits. Root lint/format currently scan `packages`, so shared tests and this document require explicit checks.

## Public exports

Sources: `packages/core/src/entry.ts`, `packages/vue3/src/entry.ts`. The following lists the pre-migration exports; later engine exports are additive during the temporary facade stage. `Ref<T>` below also includes computed refs. Setters return `void` unless specified.

### Core composables

All take `calendarId?: string` unless their signature below says `()`. Most IDs index module-global records; this is implementation behavior to replace, not an isolation guarantee.

| Export                          | Argument/return contract                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCalendar(id?)`              | `state: CalendarState` (stable reactive object), `config: Ref<ZaptimeConfig>`; `init/getDays/next/prev(): Promise<void>`; `selectTimeSlot(TimeSlot)`, `dayClicked(Day)`; `dayHasTimeSlot/isSelectedDay(Day): boolean`, `isSelected(TimeSlot): boolean`; `nextDisabled/prevDisabled: Ref<boolean>`, `currentYear/monthName: Ref<string>` |
| `useConfig(id?)`                | `config: Ref<ZaptimeConfig>`, `setConfig(ZaptimeConfig)` merges defaults                                                                                                                                                                                                                                                                |
| `useSelectedTimeSlot(id?)`      | `selectedTimeSlot: Ref<TimeSlot \| undefined>`, `setSelectedTimeSlot(TimeSlot \| undefined)`                                                                                                                                                                                                                                            |
| `useCurrentTimezone()`          | `timezone: Ref<string>`, `clientOriginalTimezone: string`, `setTimezone(string)`; currently global                                                                                                                                                                                                                                      |
| `useHourCycle()`                | `hourCycle: Ref<'h11' \| 'h12' \| 'h23' \| 'h24' \| undefined>`, same scalar `clientOriginalHourCycle`, `setHourCycle('h11' \| 'h23')`; currently global                                                                                                                                                                                |
| `useLocations(id?)`             | `locations: Ref<Location[]>`, `setLocations(Location[])`, `isPhoneCall: Ref<boolean>` (existing detection checks `location.value === 'phone'`)                                                                                                                                                                                          |
| `useStripeConfig(id?)`          | `stripeConfig: Ref<StripeConfig \| undefined>`, `setStripeConfig(StripeConfig)`                                                                                                                                                                                                                                                         |
| `useBookingForm(id?)`           | `bookingForm: Ref<CustomField[]>`, `setBookingForm(CustomField[])`, `setCustomFieldValue(uuid: string, CustomFieldValue)`, `collectFormValues()` returns `{ email, firstName?, lastName?, phone?, customFields, guests? }`                                                                                                              |
| `useGuests(id?)`                | `guests: Ref<string[]>`, `maxGuests: Ref<number \| null>`, `guestsEnabled/canAddGuest: Ref<boolean>`; `setMaxGuests(number \| null)`, `addGuest(email?: string)`, `removeGuest(index: number)`, `updateGuest(index: number, email: string)`                                                                                             |
| `useBillingAddress(id?)`        | `billingAddress: Ref<BillingAddress>`, `setBillingAddress(BillingAddress)`, `updateBillingAddressField(keyof BillingAddress, string)`                                                                                                                                                                                                   |
| `useDateFormatters()`           | `loadDateFnsConfig(locale: string): Promise<void>`; `getFormattedTime/getFormattedDay/getFormattedDayInMonth(date: string): string`; currently shared locale formatter                                                                                                                                                                  |
| `useReservationReschedule(id?)` | `reservation: Ref<Reservation \| undefined>`, `setSelectedReservation(Reservation \| undefined)`                                                                                                                                                                                                                                        |

`CalendarState` contains `date: Date`, `days: Day[]`, `timeSlots: TimeSlot[]`, `monthHasTimeSlots: boolean`, `selectedDay: Day | null`, `loading: boolean`, `headers: string[]`, `dfnsConfig?`, `attendeeState?`, `initLoaded: boolean`. It is currently a deep-import type, not an entrypoint type export.

### Core functions and helpers

| Export                       | Signature and behavior                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `book`, `reserve`            | `(options: IBookingOptions): Promise<ReservationResponse>`; options require `email`, optionally `firstName`, `lastName`, `seats` (default 1), `calendarId`, `phone`, `location`, `customFields`, `guests`. Selected slot/config come from calendar state; location defaults to the first configured location. `reserve` starts refresh. |
| `confirm`                    | `(options?: IConfirmationOptions): Promise<ReservationResponse>`; options omit `email/location/seats` from booking options; uses current reservation and stops refresh.                                                                                                                                                                 |
| `cancel`                     | `(calendarId?: string): Promise<boolean>`; false if no reservation, otherwise DELETE and stop refresh.                                                                                                                                                                                                                                  |
| `reschedule`                 | `(calendarId?: string): Promise<ReservationResponse>`; uses selected replacement slot and reservation, sends PUT with `overrideToken` from `rescheduleOverrideToken`.                                                                                                                                                                   |
| `stopReservationRefresh`     | `(): void`; currently stops a global timer.                                                                                                                                                                                                                                                                                             |
| `fetchRemoteConfiguration`   | `(token: string, apiBaseUrl?: string, reservationUuid?: string): Promise<Result<InitData, 'invalidToken'>>` using `ts-results-es`.                                                                                                                                                                                                      |
| `mergeObjects`               | `(destination: any, source: any): any`; recursive merge of source into destination.                                                                                                                                                                                                                                                     |
| `slotNoLongerAvailableText`  | `(locale?: ZaptimeLocale): string`; explicit non-nullish override, preset translation, then English.                                                                                                                                                                                                                                    |
| `rescheduleNotAllowedText`   | `(locale?: ZaptimeLocale): string`; same precedence for the reschedule error.                                                                                                                                                                                                                                                           |
| `SlotNoLongerAvailableError` | No-argument `Error` subclass; public name preserved; HTTP 409 booking/reserve signal.                                                                                                                                                                                                                                                   |
| `RescheduleNotAllowedError`  | No-argument `Error` subclass; public name preserved; HTTP 403 reschedule signal.                                                                                                                                                                                                                                                        |

`IBookingOptions` and `IConfirmationOptions` are declared in `composables/useApi.ts` but not exported by name at the old package root. The callable shapes remain public through the functions.

### Core entrypoint types

| Export                 | Shape                                                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Day`                  | `{ label: string, date?: Date, isPast?: boolean, timeSlots?: TimeSlot[], isCurrentMonth?: boolean, isToday?: boolean }`                                   |
| `TimeSlot`             | `{ calendarId: number, start: string, end: string, readableType: string, seats: number, title: string }`                                                  |
| `ZaptimeConfig`        | Required `token: string`; all optional configuration keys inventoried below.                                                                              |
| `CustomField`          | Required `label/name/uuid: string`, `type`, `required: boolean`; optional `mergeTag/placeholder: string`, `options: string[]`, `value: CustomFieldValue`. |
| `CustomFieldCollected` | `{ uuid: string, value?: string \| number \| boolean \| string[] }`                                                                                       |
| `ReservationResponse`  | `{ success: boolean, data: { uuid: string, userId: number, userName: string, userEmail: string } }`                                                       |

`InitData`, `Location`, `StripeConfig`, `Reservation`, `CustomFieldValue`, `Analytics`, `CalendarState`, `BillingAddress`, locale and theme types exist internally/deep-imported. They are not extra old root exports. New core types may expose these deliberately.

### Vue UI entrypoint

- `ZaptimeCalendar`: required `config: ZaptimeConfig`, optional `calendarId: string`; host `class` is forwarded into the calendar layout.
- `ZapTimeCalendar`: deprecated runtime alias of the same component; preserve it and make deprecation visible in declarations.
- Events: `booking-confirmed(ReservationResponse)`, `time-slot-changed(TimeSlot | undefined)`, `calendar-loaded()` with no payload. Successful initialization emits loaded after awaited mount initialization; successful form submission emits the exact booking response. Failed initialization currently may still emit loaded: this unsafe behavior is explicitly not required.
- Re-exported `book`, `reserve`, `confirm`, `cancel` retain the above signatures; Vue UI does not currently re-export `reschedule` or the core errors/helpers.
- `useCalendarViewState(calendarId?: string)` returns `view: Ref<'calendar' | 'form' | 'success'>`, `calendarView: Ref<'pickingDate' | 'pickingTime'>`, `setView(view)`, `setCalendarView(calendarView)`.
- Type export: `ZaptimeConfig`.

## Configuration and mutable inputs

| Configuration                                | Meaning to preserve                                                                                                                                                                                                                                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`, `apiBaseUrl`                        | Calendar identity and request origin; default API URL comes from the existing transport. Fixtures always override both.                                                                                                                                         |
| `min`, `max`, `closestBookableDay`           | Month navigation bounds and initialization/day selection inputs.                                                                                                                                                                                                |
| `locale.preset`, `startDayOfWeek`, `headers` | Locale, first weekday and explicit labels for `mon` through `sun`. Local configuration wins over backend configuration.                                                                                                                                         |
| `locale.hideTimePreferences`                 | Hides timezone/hour-cycle preferences.                                                                                                                                                                                                                          |
| `locale.texts`                               | `introduction`, `chooseDate`, `noTimeSlotAvailable`, `choosePreferredTime`, `pickTime`, `showNextMonth`.                                                                                                                                                        |
| `locale.confirmationForm`                    | `confirmBooking`, `reschedulingEvent`, `addGuests`, `slotNoLongerAvailable`, `rescheduleNotAllowed`; `buttons.confirmBooking/reschedule/goBack`; payment labels `showBillingDetails/price/cardNumber/name/email/company/address/city/zip/country/vatId/crn`.    |
| `theme`                                      | `preset: basic/elegant/playful`, `mode: light/dark`, `borderRadius`, `colors.white/black/25/50/100/200/300/400/500/600/700/800/900/accentLight/accentBase/accentDark`. Preserve reachable visual behavior, not an inferred alternate UI for each preset string. |
| `profileImage`, `hideLocation`               | Meeting information display.                                                                                                                                                                                                                                    |
| `externalBooking`                            | Host handles booking after selection with public standalone actions.                                                                                                                                                                                            |
| `compact`                                    | Compact date/time layout; mobile breakpoint also forces compact.                                                                                                                                                                                                |
| `redirectAfterBookingUrl`                    | Redirect after successful booking; migration centralizes effect delivery and prevents redirects on failure.                                                                                                                                                     |
| `reservationUuid`, `rescheduleOverrideToken` | Initialization of rescheduling context and forwarding server-issued host proof under wire key `overrideToken`.                                                                                                                                                  |

Editable Vue bindings to preserve through actions include nested `config.value` changes; `bookingForm.value[index].value` and `setCustomFieldValue`; guest element edits/add/remove; all nine `billingAddress.value` strings (`name/email/company/address/city/postalCode/country/crn/vatId`); timezone/hour cycle, selected slot, locations, Stripe config, reservation and view setters. Billing defaults during paid submission fill empty email/name from collected fields and country with `CZ`. Known merge tags collect camelCase `firstName/lastName/email/phone`; transport serializes `firstname/lastname` and preserves custom fields/guests. Empty guest entries are excluded.

Writable editable inputs remain supported; arbitrary writes to `state.days`, available slots or other derived state are not promised after migration. `seats` is currently local form state initialized to 1 and a public booking option; the engine will coordinate it explicitly.

## Supported UI and consumption paths

The complete calendar renders the existing `Calendar.vue` and `DefaultCalendar` pieces plus `ConfirmForm.vue`, form controls and payment UI. Internal components, `themes/Default.vue` and `ColorfulCalendar` files are not exported public component contracts. Their existence does not establish a supported alternate theme UI.

Vue root entry imports `assets/tailwind.css`. Existing users consume `@zaptime/vue3/dist/style.css`; iframe's stylesheet and Nuxt `app.vue` reference that path through node_modules. Preserve that alias while adding `@zaptime/vue3/style.css`. Tailwind utilities use `cal-`; theme variables use `--c-zaptime-*` and `--radius-zaptime`. Headless imports must load no CSS.

Iframe `src/main.ts` imports Vue UI booking functions/view state and supplies host controls; `EventType.vue` forwards the three component events. iframe uses core domain/config types in App/config building and embed option definitions. Existing modal, popup, floating/inline button modes retain their behavior. Nuxt `app.vue` and `pages/{index,page2}.vue` import the complete component plus `reserve/confirm/book` and `ZaptimeConfig` from Vue UI; existing standalone functions are called without IDs. The migration must retain that single-calendar path and explicitly error when lookup is ambiguous.

## Scenario coverage map

`tests/contracts/calendarContract.ts` contains one named data row per scenario. Task 1 intentionally does not import a future instance type or pretend these rows are executable adapter tests. `adapterHarness.ts` records lifecycle/flush requirements; adapter tasks implement `runCalendarContract(createHarness)` with separate tests per row.

| Spec section 1 capability            | Scenario IDs / fixture                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Initialization, disabled/error       | `initialization`, `disabled`, `initialization-error`; `initData`, `disabledInitData`                                                   |
| Availability/navigation/day/time     | `availability`, `navigation`, `selection`; UTC `slot`, pinned clock/deferred overrides                                                 |
| Timezones/hour cycles/locales/text   | `preferences`, `locale`; UTC/DST overrides, real locale regression suite                                                               |
| Locations/seats                      | `locations`, `seats`; location/slot overrides                                                                                          |
| Every form type                      | `fields`; `customFields` and `formInitData` contain text, email, phone, number, textarea, switch, checkbox, select, multiselect, radio |
| Guests/billing                       | `guests`, `billing`; `guests`, `billingAddress`                                                                                        |
| Free/reserve/refresh/confirm/cancel  | `free-booking`, `reservation`, `refresh`, `confirmation`, `cancellation`; `reservationResponse`, `createFixtureFetch`                  |
| Paid booking and recovery            | `paid-booking`, `payment-failure`, `recovery`; `paidInitData`, `failConfirmation`, explicit driver/reconciliation overrides            |
| Rescheduling/host tokens             | `rescheduling`; `rescheduleInitData`, `rescheduleConfig`, explicit PUT fixture                                                         |
| External controls                    | `external-controls`, `lookup`; no-ID and explicit instance cases                                                                       |
| Redirect/analytics                   | `redirect`, `analytics`; browser effect scenarios                                                                                      |
| Branding/success/themes/compact      | `branding`, `success-view`, `themes`, `compact`; UI scenario overrides                                                                 |
| Accessibility                        | `accessibility`; keyboard/focus plus manual payment/contrast/zoom checks                                                               |
| Accepted lifecycle/isolation changes | `reactive-reset`, `isolation`, `lifecycle`, `ssr`, `configuration`                                                                     |

## Existing defects versus intended invariants

- All four original commands ran before edits; formatting failures and lint warnings are pre-existing.
- The original reset suite assigned fields manually. The replacement actually calls `init()` twice and observes a retained state reference through `watchEffect`.
- A new real merge/default test exposed shared mutation: after one ID receives `cs`, a token-only new ID also receives `cs` instead of the original English default. Record this as an existing isolation defect. Default-locale characterization uses fresh module state; independence tests belong to the new engine.
- Default configuration, preferences, formatter, reservation timer and some UI flags currently share mutable module state. Independent defaults, explicit headless owner/provider setup and scoped lookup are accepted changes, not regressions.
- Duplicate DOM IDs, missing lifecycle cleanup, success-like handling of failed HTTP/application responses and uncertain payment outcomes must not be preserved.
- Identity changes reset the session; appearance changes preserve it; identity mutation during submission is rejected. Core derived state becomes readonly. Hiding and disposal have distinct behavior.
- The fixture refresh success includes legacy `status: 200` because existing `refreshReserve` requires it. `verifiedRefreshResponse` records the backend-source `{ success: true, data: [] }` variant for transport migration; neither mock establishes safe hold expiry or cadence. See `booking-recovery.md` for backend evidence and outstanding gates.
- Paid confirmation failure must retain recovery identity and suppress success/repeated payment. Synthetic tests alone cannot establish backend retry guarantees or page-close finalization.
