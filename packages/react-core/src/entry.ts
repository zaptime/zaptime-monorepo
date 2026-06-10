/**
 * @zaptime/react-core
 *
 * Headless React hooks for the Zaptime calendar booking system. This is the
 * React mirror of `@zaptime/core` (Vue): the same composable API and the same
 * imperative booking functions, sharing the framework-agnostic API client and
 * calendar logic via `@zaptime/core-shared`.
 *
 * The only idiomatic difference from the Vue package is value access: hooks
 * return already-unwrapped reactive values (e.g. `config`, `selectedTimeSlot`,
 * `state`) instead of Vue refs, so there is no `.value`.
 */

export {
  book,
  reserve,
  confirm,
  cancel,
  fetchRemoteConfiguration,
  reschedule,
  stopReservationRefresh,
} from "./api/useApi";
export type { IBookingOptions, IConfirmationOptions } from "./api/useApi";

export { default as useCalendar } from "./hooks/useCalendar";
export { default as useConfig } from "./hooks/useConfig";
export { default as useSelectedTimeSlot } from "./hooks/useSelectedTimeSlot";
export { default as useCurrentTimezone } from "./hooks/useCurrentTimezone";
export { default as useHourCycle } from "./hooks/useHourCycle";
export { default as useLocations } from "./hooks/useLocations";
export { default as useStripeConfig } from "./hooks/useStripeConfig";
export { default as useBookingForm } from "./hooks/useBookingForm";
export { default as useGuests } from "./hooks/useGuests";
export { default as useBillingAddress } from "./hooks/useBillingAddress";
export { useDateFormatters } from "./hooks/useDateFormatters";
export { default as useReservationReschedule } from "./hooks/useReservationReschedule";

export { mergeObjects } from "@zaptime/core-shared";

export type {
  Day,
  TimeSlot,
  ZaptimeConfig,
  CustomField,
  CustomFieldCollected,
  ReservationResponse,
  CalendarState,
} from "@zaptime/core-shared";
