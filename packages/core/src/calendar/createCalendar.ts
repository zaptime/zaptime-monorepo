import { CalendarError } from "../api/errors";
import { createCalendarContext } from "./lifecycle";
import type { CalendarActions, CalendarFormatters, CalendarInstance, CalendarSelectors, CreateCalendarOptions } from "./types";

/** Creates an inert, independently owned booking session. Call init after client mount. */
export function createCalendar(options: CreateCalendarOptions): CalendarInstance {
  const context = createCalendarContext(options);
  const { store } = context;
  const pending = (operation: string): never => {
    context.assertActive();
    throw new CalendarError("api", `${operation} is not implemented`);
  };
  const pendingAsync = (operation: string) => async (): Promise<never> => pending(operation);
  const actions: CalendarActions = {
    getDays: pendingAsync("getDays"),
    next: pendingAsync("next"),
    prev: pendingAsync("prev"),
    dayClicked: () => pending("dayClicked"),
    setSelectedTimeSlot(slot) {
      context.assertActive();
      const previous = store.getSnapshot().selectedTimeSlot;
      if (previous === slot || (previous && slot && Object.keys(previous).every((key) => previous[key as keyof typeof previous] === slot[key as keyof typeof slot]))) return;
      store.commit({ selectedTimeSlot: slot });
      context.emit({ type: "time-slot-changed", payload: slot });
    },
    setConfig: pendingAsync("setConfig"),
    setTimezone: pendingAsync("setTimezone"),
    setHourCycle: () => pending("setHourCycle"),
    setLocations: () => pending("setLocations"),
    setStripeConfig: () => pending("setStripeConfig"),
    setBookingForm: () => pending("setBookingForm"),
    setCustomFieldValue: () => pending("setCustomFieldValue"),
    collectFormValues: () => pending("collectFormValues"),
    setMaxGuests: () => pending("setMaxGuests"),
    addGuest: () => pending("addGuest"),
    removeGuest: () => pending("removeGuest"),
    updateGuest: () => pending("updateGuest"),
    setBillingAddress: () => pending("setBillingAddress"),
    updateBillingAddressField: () => pending("updateBillingAddressField"),
    setSelectedReservation: () => pending("setSelectedReservation"),
    setSeats: () => pending("setSeats"),
    setView: () => pending("setView"),
    setCalendarView: () => pending("setCalendarView"),
    book: pendingAsync("book"),
    reserve: pendingAsync("reserve"),
    confirm: pendingAsync("confirm"),
    cancel: pendingAsync("cancel"),
    reschedule: pendingAsync("reschedule"),
    submit: pendingAsync("submit"),
    recover: pendingAsync("recover"),
    stopReservationRefresh: () => pending("stopReservationRefresh"),
  };
  const selectors: CalendarSelectors = {
    nextDisabled: () => pending("nextDisabled"),
    prevDisabled: () => pending("prevDisabled"),
    monthName: () => pending("monthName"),
    currentYear: () => pending("currentYear"),
    isSelected: () => pending("isSelected"),
    isSelectedDay: () => pending("isSelectedDay"),
    dayHasTimeSlot: () => pending("dayHasTimeSlot"),
    guestsEnabled: () => pending("guestsEnabled"),
    canAddGuest: () => pending("canAddGuest"),
    isPhoneCall: () => pending("isPhoneCall"),
  };
  const formatters: CalendarFormatters = {
    loadDateFnsConfig: pendingAsync("loadDateFnsConfig"),
    getFormattedTime: () => pending("getFormattedTime"),
    getFormattedDay: () => pending("getFormattedDay"),
    getFormattedDayInMonth: () => pending("getFormattedDayInMonth"),
  };
  return {
    getSnapshot: store.getSnapshot,
    subscribe: (listener) => (context.isDisposed() ? () => {} : store.subscribe(listener)),
    onEvent: context.onEvent,
    init: pendingAsync("init"),
    actions: Object.freeze(actions),
    selectors: Object.freeze(selectors),
    formatters: Object.freeze(formatters),
    dispose: context.dispose,
  };
}
