export * from "@zaptime/core";
export { useCalendarInstance } from "./instance";
export { provideCalendar, ZaptimeProvider, calendarScopeKey } from "./context";
export { createCalendarScope } from "./scope";
export type { CalendarScope, CalendarTarget } from "./scope";
export { book, reserve, confirm, cancel, reschedule, stopReservationRefresh } from "./compat";
export type { IBookingOptions, IConfirmationOptions } from "./compat";
export {
  useCalendar,
  useConfig,
  useBillingAddress,
  useBookingForm,
  useGuests,
  useSelectedTimeSlot,
  useCurrentTimezone,
  useHourCycle,
  useLocations,
  useStripeConfig,
  useReservationReschedule,
  useDateFormatters,
  useCalendarViewState,
} from "./composables";
