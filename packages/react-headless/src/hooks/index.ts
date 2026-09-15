import type { CalendarInstance } from "@zaptime/core";
import { useResolvedCalendar } from "../context";
import { useSlice } from "../store";
export function useCalendar(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  const s = useSlice(c, "calendar", "config", "selectedTimeSlot", "timezone", "hourCycle");
  return {
    state: s.calendar,
    config: s.config,
    init: c.init,
    getDays: c.actions.getDays,
    next: c.actions.next,
    prev: c.actions.prev,
    selectTimeSlot: c.actions.setSelectedTimeSlot,
    dayClicked: c.actions.dayClicked,
    dayHasTimeSlot: c.selectors.dayHasTimeSlot,
    isSelectedDay: c.selectors.isSelectedDay,
    isSelected: c.selectors.isSelected,
    nextDisabled: c.selectors.nextDisabled(),
    prevDisabled: c.selectors.prevDisabled(),
    currentYear: c.selectors.currentYear(),
    monthName: c.selectors.monthName(),
  };
}
export function useConfig(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "config"), setConfig: c.actions.setConfig };
}
export function useSelectedTimeSlot(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "selectedTimeSlot"), setSelectedTimeSlot: c.actions.setSelectedTimeSlot };
}
export function useCurrentTimezone(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "timezone", "clientOriginalTimezone"), setTimezone: c.actions.setTimezone };
}
export function useHourCycle(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "hourCycle", "clientOriginalHourCycle"), setHourCycle: c.actions.setHourCycle };
}
export function useLocations(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "locations"), setLocations: c.actions.setLocations, isPhoneCall: c.selectors.isPhoneCall() };
}
export function useStripeConfig(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "stripeConfig"), setStripeConfig: c.actions.setStripeConfig };
}
export function useBookingForm(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "bookingForm"), setBookingForm: c.actions.setBookingForm, setCustomFieldValue: c.actions.setCustomFieldValue, collectFormValues: c.actions.collectFormValues };
}
export function useGuests(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return {
    ...useSlice(c, "guests", "maxGuests"),
    guestsEnabled: c.selectors.guestsEnabled(),
    canAddGuest: c.selectors.canAddGuest(),
    setMaxGuests: c.actions.setMaxGuests,
    addGuest: c.actions.addGuest,
    removeGuest: c.actions.removeGuest,
    updateGuest: c.actions.updateGuest,
  };
}
export function useBillingAddress(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "billingAddress"), setBillingAddress: c.actions.setBillingAddress, updateBillingAddressField: c.actions.updateBillingAddressField };
}
export function useReservationReschedule(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "reservation"), setSelectedReservation: c.actions.setSelectedReservation };
}
export function useCalendarViewState(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  return { ...useSlice(c, "view", "calendarView"), setView: c.actions.setView, setCalendarView: c.actions.setCalendarView };
}
export function useDateFormatters(instance?: CalendarInstance) {
  const c = useResolvedCalendar(instance);
  useSlice(c, "timezone", "hourCycle", "config");
  return c.formatters;
}
