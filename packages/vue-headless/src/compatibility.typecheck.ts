/** Compile-only public compatibility fixture; never imported by the entrypoint. */
import type { Ref } from "vue";
import type { CalendarInstance, CalendarState, ZaptimeConfig, TimeSlot, Day, CustomField, BillingAddress, Location, StripeConfig, Reservation } from "@zaptime/core";
import * as api from "./entry";
export function checkLegacyShapes(calendar: CalendarInstance) {
  const c = api.useCalendar(calendar);
  const state: CalendarState = c.state;
  const config: Ref<ZaptimeConfig> = c.config;
  const nextDisabled: Ref<boolean> = c.nextDisabled,
    prevDisabled: Ref<boolean> = c.prevDisabled,
    year: Ref<string> = c.currentYear,
    month: Ref<string> = c.monthName;
  const slot: Ref<TimeSlot | undefined> = api.useSelectedTimeSlot(calendar).selectedTimeSlot;
  const fields: Ref<CustomField[]> = api.useBookingForm(calendar).bookingForm;
  fields.value[0].value = "new";
  fields.value.push({ uuid: "id", name: "name", label: "label", required: false, type: "text" });
  const billing: Ref<BillingAddress> = api.useBillingAddress(calendar).billingAddress;
  billing.value.email = "x@example.test";
  const guests: Ref<string[]> = api.useGuests(calendar).guests;
  guests.value.splice(0, 1, "x@example.test");
  config.value.token = "replacement";
  config.value.locale = { texts: { chooseDate: "Choose" } };
  const locations: Ref<Location[]> = api.useLocations(calendar).locations;
  const stripe: Ref<StripeConfig | undefined> = api.useStripeConfig(calendar).stripeConfig;
  const reservation: Ref<Reservation | undefined> = api.useReservationReschedule(calendar).reservation;
  const date: Date = state.date;
  date.setDate(1);
  const day: Day = state.days[0];
  c.dayClicked(day);
  api.book({ email: "x@example.test", calendarId: "id" });
  api.reserve({ email: "x@example.test" }, calendar);
  api.confirm({ firstName: "A" }, calendar);
  api.cancel(calendar);
  api.reschedule(calendar);
  api.stopReservationRefresh(calendar);
  api.useCurrentTimezone(calendar).setTimezone("UTC");
  api.useHourCycle(calendar).setHourCycle("h23");
  api.useDateFormatters(calendar).getFormattedTime("2030-01-01");
  api.useCalendarViewState(calendar).setView("form");
  return { nextDisabled, prevDisabled, year, month, slot, locations, stripe, reservation };
}
