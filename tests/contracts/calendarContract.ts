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

import assert from "node:assert/strict";
import type { CreateAdapterHarness, RegisterContractTest } from "./adapterHarness";
import { config, slot, createFixtureFetch, customFields, billingAddress, reservationResponse, disabledInitData, initData, reservation } from "./fixtures";
/** Executable adapter-domain cases. Browser/UI inventory rows still need their integration suites. */
export function runCalendarContract(createHarness: CreateAdapterHarness, test: RegisterContractTest) {
  const cases = calendarContractScenarios.filter((s) => s.layer === "adapter" && s.id !== "lookup");
  for (const scenario of cases)
    test(`shared contract: ${scenario.id}`, async () => {
      const calls: { url: string; method: string; body: any }[] = [];
      const timers = new Map<unknown, () => void>();
      let timerId = 0;
      const fixture = createFixtureFetch();
      const fetch: typeof globalThis.fetch = async (input, options) => {
        const url = String(input),
          method = options?.method ?? "GET";
        calls.push({ url, method, body: options?.body ? JSON.parse(String(options.body)) : undefined });
        if (url.includes("event-types/init") && scenario.id === "initialization-error") return Response.json({ success: false }, { status: 500 });
        if (url.includes("event-types/init") && scenario.id === "disabled") return Response.json({ success: true, data: disabledInitData });
        if (url.includes("event-types/init") && scenario.id === "rescheduling") return Response.json({ success: true, data: { ...initData, reservation } });
        if (method === "PUT") return Response.json(reservationResponse);
        return fixture(input, options);
      };
      const h = await createHarness({
        config: { ...config, ...(scenario.id === "rescheduling" ? { reservationUuid: reservation.uuid, rescheduleOverrideToken: "proof" } : {}) },
        runtime: {
          fetch,
          now: () => new Date("2030-05-01T00:00:00Z"),
          getTimezone: () => "UTC",
          getHourCycle: () => "h23",
          schedule: (fn) => {
            timers.set(++timerId, fn);
            return timerId;
          },
          unschedule: (id) => {
            timers.delete(id);
          },
        },
      });
      const c = h.calendar,
        events: string[] = [];
      c.onEvent((e) => events.push(e.type));
      try {
        if (scenario.id === "initialization-error") {
          await assert.rejects(c.init());
          await h.flush();
          assert.equal(h.read().phase, "error");
          assert(!events.includes("calendar-loaded"));
          return;
        }
        await c.init();
        await h.flush();
        const select = () => c.actions.setSelectedTimeSlot(slot);
        switch (scenario.id) {
          case "initialization":
            assert.equal(h.read().calendar.initLoaded, true);
            assert.equal(events.filter((e) => e === "calendar-loaded").length, 1);
            assert.equal(calls.filter((c) => c.url.includes("event-types/init")).length, 1);
            break;
          case "disabled":
            assert.equal(h.read().phase, "disabled");
            assert.equal(h.read().calendar.timeSlots.length, 0);
            break;
          case "availability":
            assert.equal(h.read().calendar.timeSlots[0].start, slot.start);
            assert(h.read().calendar.selectedDay);
            break;
          case "navigation": {
            const month = c.getSnapshot().calendar.date.getMonth();
            await c.actions.next();
            await h.flush();
            assert.equal(h.read().calendar.date.getMonth(), (month + 1) % 12);
            await c.actions.prev();
            await h.flush();
            assert.equal(h.read().calendar.date.getMonth(), month);
            assert.equal(h.read().calendar.loading, false);
            break;
          }
          case "selection":
            select();
            await h.flush();
            assert.deepEqual(h.read().selectedTimeSlot, slot);
            assert.equal(events.filter((e) => e === "time-slot-changed").length, 1);
            break;
          case "preferences":
            await c.actions.setTimezone("Europe/Prague");
            c.actions.setHourCycle("h11");
            await h.flush();
            assert.equal(h.read().timezone, "Europe/Prague");
            assert.equal(h.read().hourCycle, "h11");
            assert(c.formatters.getFormattedTime(slot.start));
            break;
          case "locale":
            await c.actions.setConfig({ locale: { preset: "sk", texts: { chooseDate: "Local" } } });
            await h.flush();
            assert.equal(h.read().config.locale?.preset, "sk");
            assert.equal(h.read().config.locale?.texts?.chooseDate, "Local");
            assert(c.formatters.getFormattedDay(slot.start));
            break;
          case "locations":
            c.actions.setLocations([{ type: "phone", value: "phone" }]);
            await h.flush();
            assert.equal(h.read().locations[0].value, "phone");
            assert(c.selectors.isPhoneCall());
            break;
          case "seats":
            c.actions.setSelectedTimeSlot({ ...slot, seats: 2 });
            c.actions.setSeats(2);
            await h.flush();
            assert.equal(h.read().seats, 2);
            await c.actions.book({ email: "test@example.test", seats: 2 });
            assert.equal(calls.find((c) => c.method === "POST" && c.url.endsWith("/reservations"))?.body.seats, 2);
            break;
          case "fields":
            c.actions.setBookingForm(customFields);
            await h.flush();
            assert.equal(h.read().bookingForm.length, customFields.length);
            assert.equal(c.actions.collectFormValues().email, "attendee@example.test");
            assert(c.actions.collectFormValues().customFields?.some((f) => f.value === false));
            assert(c.actions.collectFormValues().customFields?.some((f) => f.value === 0));
            break;
          case "guests":
            c.actions.setMaxGuests(2);
            c.actions.addGuest("a@example.test");
            c.actions.addGuest("");
            c.actions.updateGuest(0, "b@example.test");
            c.actions.removeGuest(1);
            await h.flush();
            assert.deepEqual(h.read().guests, ["b@example.test"]);
            assert(c.selectors.canAddGuest());
            break;
          case "billing":
            c.actions.setBillingAddress(billingAddress);
            c.actions.updateBillingAddressField("email", "new@example.test");
            await h.flush();
            assert.equal(h.read().billingAddress.email, "new@example.test");
            assert.equal(h.read().billingAddress.postalCode, billingAddress.postalCode);
            break;
          case "free-booking":
            select();
            await c.actions.book({ email: "test@example.test", firstName: "Test" });
            await h.flush();
            assert.equal(h.read().phase, "success");
            assert.equal(events.filter((e) => e === "booking-confirmed").length, 1);
            break;
          case "reservation":
            select();
            await c.actions.reserve({ email: "test@example.test" });
            await h.flush();
            assert.equal(h.read().reservationUuid, "r-test");
            assert(timers.size > 0);
            break;
          case "refresh":
            select();
            await c.actions.reserve({ email: "test@example.test" });
            assert(timers.size > 0);
            c.actions.stopReservationRefresh();
            assert.equal(timers.size, 0);
            break;
          case "confirmation":
            select();
            await c.actions.reserve({ email: "test@example.test" });
            await c.actions.confirm({ firstName: "Test", lastName: "Person" });
            await h.flush();
            assert.equal(h.read().phase, "success");
            assert.equal(timers.size, 0);
            assert.equal(events.filter((e) => e === "booking-confirmed").length, 1);
            break;
          case "cancellation":
            select();
            await c.actions.reserve({ email: "test@example.test" });
            assert.equal(await c.actions.cancel(), true);
            assert.equal(timers.size, 0);
            assert(calls.some((c) => c.method === "DELETE"));
            break;
          case "rescheduling":
            select();
            await c.actions.reschedule();
            await h.flush();
            assert.equal(h.read().phase, "success");
            assert.equal(calls.find((c) => c.method === "PUT")?.body.overrideToken, "proof");
            break;
          case "external-controls":
            c.actions.setView("form");
            c.actions.setCalendarView("pickingTime");
            await h.flush();
            assert.equal(h.read().view, "form");
            assert.equal(h.read().calendarView, "pickingTime");
            break;
          case "reactive-reset": {
            select();
            await c.actions.setConfig({ token: "replacement" });
            await h.flush();
            assert.equal(h.read().config.token, "replacement");
            assert.equal(h.read().selectedTimeSlot, undefined);
            assert.equal(h.read().calendar.initLoaded, true);
            break;
          }
          case "isolation": {
            const other = await createHarness({ config, runtime: { fetch: fixture } });
            try {
              c.actions.updateBillingAddressField("email", "isolated@example.test");
              await h.flush();
              assert.equal(other.calendar.getSnapshot().billingAddress.email, "");
              assert.equal(h.read().billingAddress.email, "isolated@example.test");
            } finally {
              await other.unmount();
            }
            break;
          }
          case "lifecycle":
            await h.unmount();
            assert.equal(c.getSnapshot().phase, "disposed");
            assert.equal(timers.size, 0);
            break;
          case "configuration":
            select();
            await c.actions.setConfig({ compact: true });
            await h.flush();
            assert.deepEqual(h.read().selectedTimeSlot, slot);
            assert.equal(h.read().config.compact, true);
            break;
          default:
            throw new Error(`Missing executable case: ${scenario.id}`);
        }
      } finally {
        await h.unmount();
      }
    });
}
