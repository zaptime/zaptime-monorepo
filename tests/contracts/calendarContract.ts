/**
 * Shared parity inventory, deliberately data-only until CalendarInstance exists.
 * Each row becomes a separate runCalendarContract(createHarness) assertion in the
 * adapter tasks; UI/browser rows also require the integration evidence indicated.
 */
export const calendarContractScenarios = [
  { id: "initialization", layer: "adapter", fixture: "initData", invariant: "Explicit init loads configuration and availability once; emits calendar-loaded after success." },
  { id: "disabled", layer: "adapter", fixture: "disabledInitData", invariant: "Disabled initialization stops booking and exposes the disabled state." },
  { id: "initialization-error", layer: "adapter", fixture: "reject init request", invariant: "A failed initialization exposes an error and never emits calendar-loaded." },
  { id: "availability", layer: "adapter", fixture: "slot", invariant: "Availability selects the first bookable day and exposes the day's slots; empty months remain navigable." },
  { id: "navigation", layer: "adapter", fixture: "pinned clock and deferred availability", invariant: "min/max month limits, leap days, stale responses and loading follow the current month." },
  { id: "selection", layer: "adapter", fixture: "slot", invariant: "Selecting a day/slot updates every shared consumer and time-slot-changed with the exact slot." },
  { id: "preferences", layer: "adapter", fixture: "UTC slot and DST boundary overrides", invariant: "Timezone/hour-cycle changes update local formatting independently per instance." },
  { id: "locale", layer: "adapter", fixture: "local sk/backend cs configuration", invariant: "Local presets and nested text/header overrides win; missing values retain defaults." },
  { id: "locations", layer: "adapter", fixture: "initData.locations and phone override", invariant: "Location selection, phone detection and hideLocation preserve booking payloads and display behavior." },
  { id: "seats", layer: "adapter", fixture: "slot with seats 2", invariant: "Seat counts are validated and forwarded to reserve/book without changing slot identity." },
  { id: "fields", layer: "adapter", fixture: "formInitData", invariant: "All ten field types preserve required/optional values, merge tags, false, zero and arrays." },
  { id: "guests", layer: "adapter", fixture: "guests and formInitData", invariant: "Guests respect maxGuests, edit/remove correctly and omit empty entries from submission." },
  { id: "billing", layer: "adapter", fixture: "billingAddress", invariant: "Writable billing fields reach submission; empty email/name/country receive the existing defaults." },
  { id: "free-booking", layer: "adapter", fixture: "reservationResponse", invariant: "Free submit sends the selected slot, first/last names, location, seats, guests and custom fields, then exposes success." },
  { id: "reservation", layer: "adapter", fixture: "createFixtureFetch", invariant: "Reserve returns its identity and starts an instance-owned refresh timer." },
  { id: "refresh", layer: "adapter", fixture: "fake timers and refresh response", invariant: "Refresh is isolated and stops on explicit stop/terminal transition/disposal; backend cadence remains unverified." },
  { id: "confirmation", layer: "adapter", fixture: "reservationResponse", invariant: "Confirmation preserves firstname/lastname wire casing and emits one success payload." },
  { id: "cancellation", layer: "adapter", fixture: "createFixtureFetch", invariant: "Explicit cancellation uses the current reservation and stops its refresh." },
  { id: "paid-booking", layer: "browser", fixture: "paidInitData and payment driver", invariant: "Paid submit reserves, creates payment, confirms payment then reservation exactly once." },
  { id: "payment-failure", layer: "browser", fixture: "failed payment driver", invariant: "Known payment failure cancels the unpaid hold and exposes an error without success." },
  {
    id: "recovery",
    layer: "browser",
    fixture: "failConfirmation and reconciliation override",
    invariant: "Paid-but-unconfirmed retains reservation identity and never automatically pays again; backend evidence is a release gate.",
  },
  {
    id: "rescheduling",
    layer: "adapter",
    fixture: "rescheduleInitData and rescheduleConfig",
    invariant: "Existing reservation is displayed, selected replacement uses PUT and forwards overrideToken; 403 remains typed.",
  },
  { id: "external-controls", layer: "adapter", fixture: "config with externalBooking true", invariant: "Standalone book/reserve/confirm/cancel resolve explicit or unique calendar; external UI can control views." },
  { id: "redirect", layer: "browser", fixture: "config with fictional redirect URL", invariant: "Successful booking requests the configured redirect exactly once; failures do not redirect." },
  { id: "analytics", layer: "browser", fixture: "initData with fictional analytics config", invariant: "Initialization/booking analytics fire once and throwing integration listeners do not corrupt success." },
  { id: "branding", layer: "ui", fixture: "initData with isSubscribed false", invariant: "Subscription configuration controls branding consistently in both UIs." },
  { id: "success-view", layer: "ui", fixture: "reservationResponse", invariant: "Confirmation shows matching success details and preserves response payload/event ordering." },
  { id: "themes", layer: "ui", fixture: "light/dark and theme color/radius overrides", invariant: "Reachable complete-calendar appearance, cal- classes and CSS variables remain compatible." },
  { id: "compact", layer: "ui", fixture: "compact config and mobile viewport", invariant: "Explicit compact mode and automatic mobile switch preserve date/time/form navigation." },
  {
    id: "accessibility",
    layer: "ui",
    fixture: "formInitData and keyboard/mobile scenarios",
    invariant: "Labels, focus, keyboard controls, error/loading announcements, contrast and reduced motion receive automated and manual checks.",
  },
  { id: "reactive-reset", layer: "adapter", fixture: "config identity replacement", invariant: "Previously captured Vue state stays reactive across reset; derived engine state is readonly." },
  { id: "isolation", layer: "adapter", fixture: "two identical config instances", invariant: "Independent owners do not share mutable inputs, preferences or timers; explicit shared instances synchronize." },
  { id: "lookup", layer: "adapter", fixture: "zero/one/two registered calendars", invariant: "No-ID legacy calls succeed only for one unambiguous calendar; duplicate IDs do not join owners." },
  { id: "lifecycle", layer: "adapter", fixture: "pending submit and hidden/reopened UI", invariant: "Hiding preserves state; disposal detaches listeners and waits for pending work without auto-cancel." },
  { id: "ssr", layer: "ui", fixture: "deterministic loading snapshot", invariant: "Server rendering performs no IO/timers and hydrates the same loading markup." },
  { id: "configuration", layer: "adapter", fixture: "appearance and identity config patches", invariant: "Appearance patches preserve sessions; identity changes reset and are rejected during submission." },
] as const;

export type CalendarContractScenario = (typeof calendarContractScenarios)[number];
