import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalendar } from "@zaptime/core";
import {
  useCalendar,
  useSelectedTimeSlot,
  useBillingAddress,
  useGuests,
  useCalendarViewState,
  useCurrentTimezone,
  useHourCycle,
  useLocations,
  useStripeConfig,
  useBookingForm,
  useConfig,
  useReservationReschedule,
  useDateFormatters,
} from "../src/entry";
afterEach(cleanup);
const slot = { start: "2026-09-16T10:00:00Z", end: "2026-09-16T11:00:00Z", calendarId: 1, readableType: "", seats: 1, title: "" };
it("updates selected slots independently and preserves action identity", () => {
  const a = createCalendar({ config: { token: "a" } }),
    b = createCalendar({ config: { token: "b" } });
  const { result } = renderHook(() => [useSelectedTimeSlot(a), useSelectedTimeSlot(b)]);
  const action = result.current[0].setSelectedTimeSlot;
  act(() => a.actions.setSelectedTimeSlot(slot));
  expect(result.current[0].selectedTimeSlot).toEqual(slot);
  expect(result.current[1].selectedTimeSlot).toBeUndefined();
  expect(result.current[0].setSelectedTimeSlot).toBe(action);
});
it("caches calendar projections and skips unrelated billing renders", () => {
  const c = createCalendar({ config: { token: "a" } });
  let renders = 0;
  const { result, rerender } = renderHook(() => {
    renders++;
    return useCalendar(c);
  });
  const state = result.current.state;
  act(() => c.actions.updateBillingAddressField("email", "a@example.com"));
  expect(renders).toBe(1);
  expect(result.current.state).toBe(state);
  rerender();
  expect(result.current.state).toBe(state);
});
it("exposes granular fields, derived values and stable action names", () => {
  const c = createCalendar({ config: { token: "a" } });
  const { result } = renderHook(() => ({
    billing: useBillingAddress(c),
    guests: useGuests(c),
    view: useCalendarViewState(c),
    tz: useCurrentTimezone(c),
    hour: useHourCycle(c),
    locations: useLocations(c),
    stripe: useStripeConfig(c),
    form: useBookingForm(c),
    config: useConfig(c),
    reservation: useReservationReschedule(c),
    format: useDateFormatters(c),
  }));
  act(() => {
    result.current.billing.updateBillingAddressField("email", "a@example.com");
    result.current.guests.setMaxGuests(2);
    result.current.guests.addGuest("b@example.com");
    result.current.view.setView("form");
    result.current.hour.setHourCycle("h23");
    result.current.locations.setLocations([{ value: "phone", label: "Phone" }]);
    result.current.form.setBookingForm([]);
  });
  expect(result.current.billing.billingAddress.email).toBe("a@example.com");
  expect(result.current.guests.guests).toEqual(["b@example.com"]);
  expect(result.current.guests.canAddGuest).toBe(true);
  expect(result.current.view.view).toBe("form");
  expect(result.current.hour.hourCycle).toBe("h23");
  expect(result.current.locations.isPhoneCall).toBe(true);
  expect(result.current.config.config.token).toBe("a");
  expect(result.current.form.collectFormValues).toBe(c.actions.collectFormValues);
  expect(result.current.stripe.setStripeConfig).toBe(c.actions.setStripeConfig);
  expect(result.current.reservation.setSelectedReservation).toBe(c.actions.setSelectedReservation);
  expect(result.current.format.getFormattedTime).toBe(c.formatters.getFormattedTime);
});
it("rerenders calendar predicates when the selected slot changes", () => {
  const c = createCalendar({ config: { token: "a" } });
  let renders = 0;
  const { result } = renderHook(() => {
    renders++;
    return useCalendar(c);
  });
  act(() => c.actions.setSelectedTimeSlot(slot));
  expect(renders).toBe(2);
  expect(result.current.isSelected(slot)).toBe(true);
});
