import { createFieldActions } from "../forms/fields";
import { createGuestActions } from "../forms/guests";
import { createBillingActions } from "../forms/billing";
import { assertFormEditable, invalid, validateSeats } from "../booking/validation";
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
  const guests = createGuestActions(context);
  const actions: CalendarActions = {
    ...createFieldActions(context),
    ...guests.actions,
    ...createBillingActions(context),
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
    setLocations(locations) { assertFormEditable(context); store.commit({ locations }); },
    setStripeConfig(stripeConfig) { assertFormEditable(context); store.commit({ stripeConfig }); },
    setSelectedReservation(reservation) { assertFormEditable(context); store.commit({ reservation }); },
    setSeats(seats) { assertFormEditable(context); validateSeats(seats, store.getSnapshot().selectedTimeSlot?.seats); store.commit({ seats }); },
    setView(view) { context.assertActive(); if (!["calendar", "form", "success"].includes(view)) invalid("view", "option"); if (store.commit({ view })) context.emit({ type: "view-changed", payload: view }); },
    setCalendarView(calendarView) { context.assertActive(); if (!["pickingDate", "pickingTime"].includes(calendarView)) invalid("calendarView", "option"); store.commit({ calendarView }); },
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
    ...guests.selectors,
    isPhoneCall: () => store.getSnapshot().locations.some(location => location.value === "phone"),
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
