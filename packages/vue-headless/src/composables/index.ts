import { computed } from "vue";
import type { CalendarSnapshot, CalendarState, ZaptimeConfig } from "@zaptime/core";
import { resolveCalendar } from "../context";
import type { CalendarTarget } from "../scope";
import { snapshotBridge, editable, facade, copy } from "../bridge";
const configPatch = (value: ZaptimeConfig, path?: PropertyKey[]): Partial<ZaptimeConfig> => (path?.length ? { [path[0]]: value[path[0] as keyof ZaptimeConfig] } : value);
const context = (target?: CalendarTarget) => {
  const calendar = resolveCalendar(target);
  return { calendar, snapshot: snapshotBridge(calendar) };
};
export function useCalendar(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  const state = facade(() => s.value.calendar as CalendarState);
  const derived = <K extends "nextDisabled" | "prevDisabled" | "currentYear" | "monthName">(key: K) =>
    computed(() => {
      void s.value;
      return c.selectors[key]() as ReturnType<(typeof c.selectors)[K]>;
    });
  return {
    state,
    config: editable(s, "config", (v, path) => {
      void c.actions.setConfig(configPatch(v, path)).catch(() => {});
    }),
    init: c.init,
    getDays: c.actions.getDays,
    next: c.actions.next,
    prev: c.actions.prev,
    selectTimeSlot: c.actions.setSelectedTimeSlot,
    dayClicked: c.actions.dayClicked,
    dayHasTimeSlot: c.selectors.dayHasTimeSlot,
    isSelectedDay: c.selectors.isSelectedDay,
    isSelected: c.selectors.isSelected,
    nextDisabled: derived("nextDisabled"),
    prevDisabled: derived("prevDisabled"),
    currentYear: derived("currentYear"),
    monthName: derived("monthName"),
  };
}
export function useConfig(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  const setConfig = (v: ZaptimeConfig, path?: PropertyKey[]) => {
    void c.actions.setConfig(configPatch(v, path)).catch(() => {});
  };
  return { config: editable(s, "config", setConfig), setConfig };
}
export function useBillingAddress(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return { billingAddress: editable(s, "billingAddress", c.actions.setBillingAddress), setBillingAddress: c.actions.setBillingAddress, updateBillingAddressField: c.actions.updateBillingAddressField };
}
export function useBookingForm(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return {
    bookingForm: editable(s, "bookingForm", c.actions.setBookingForm),
    setBookingForm: c.actions.setBookingForm,
    setCustomFieldValue: c.actions.setCustomFieldValue,
    collectFormValues: c.actions.collectFormValues,
  };
}
export function useGuests(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return {
    guests: editable(s, "guests", (values) => {
      while (c.getSnapshot().guests.length > values.length) c.actions.removeGuest(c.getSnapshot().guests.length - 1);
      values.forEach((value, i) => {
        if (i < c.getSnapshot().guests.length) c.actions.updateGuest(i, value);
        else c.actions.addGuest(value);
      });
    }),
    maxGuests: computed(() => s.value.maxGuests),
    guestsEnabled: computed(() => {
      void s.value;
      return c.selectors.guestsEnabled();
    }),
    canAddGuest: computed(() => {
      void s.value;
      return c.selectors.canAddGuest();
    }),
    setMaxGuests: c.actions.setMaxGuests,
    addGuest: c.actions.addGuest,
    removeGuest: c.actions.removeGuest,
    updateGuest: c.actions.updateGuest,
  };
}
function projection<K extends keyof CalendarSnapshot>(target: CalendarTarget | undefined, key: K) {
  const { calendar, snapshot } = context(target);
  return { calendar, value: computed(() => copy(snapshot.value[key]) as CalendarSnapshot[K]) };
}
export function useSelectedTimeSlot(target?: CalendarTarget) {
  const { calendar: c, value } = projection(target, "selectedTimeSlot");
  return { selectedTimeSlot: value, setSelectedTimeSlot: c.actions.setSelectedTimeSlot };
}
export function useCurrentTimezone(target?: CalendarTarget) {
  const { calendar: c, value } = projection(target, "timezone");
  return { timezone: value, clientOriginalTimezone: c.getSnapshot().clientOriginalTimezone, setTimezone: c.actions.setTimezone };
}
export function useHourCycle(target?: CalendarTarget) {
  const { calendar: c, value } = projection(target, "hourCycle");
  return { hourCycle: value, clientOriginalHourCycle: c.getSnapshot().clientOriginalHourCycle, setHourCycle: c.actions.setHourCycle };
}
export function useLocations(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return {
    locations: computed(() => copy(s.value.locations) as CalendarSnapshot["locations"]),
    setLocations: c.actions.setLocations,
    isPhoneCall: computed(() => {
      void s.value;
      return c.selectors.isPhoneCall();
    }),
  };
}
export function useStripeConfig(target?: CalendarTarget) {
  const { calendar: c, value } = projection(target, "stripeConfig");
  return { stripeConfig: value, setStripeConfig: c.actions.setStripeConfig };
}
export function useReservationReschedule(target?: CalendarTarget) {
  const { calendar: c, value } = projection(target, "reservation");
  return { reservation: value, setSelectedReservation: c.actions.setSelectedReservation };
}
export function useDateFormatters(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return {
    loadDateFnsConfig: c.formatters.loadDateFnsConfig,
    getFormattedTime: (date: string) => {
      void s.value;
      return c.formatters.getFormattedTime(date);
    },
    getFormattedDay: (date: string) => {
      void s.value;
      return c.formatters.getFormattedDay(date);
    },
    getFormattedDayInMonth: (date: string) => {
      void s.value;
      return c.formatters.getFormattedDayInMonth(date);
    },
  };
}
export function useCalendarViewState(target?: CalendarTarget) {
  const { calendar: c, snapshot: s } = context(target);
  return { view: computed(() => s.value.view), calendarView: computed(() => s.value.calendarView), setView: c.actions.setView, setCalendarView: c.actions.setCalendarView };
}
