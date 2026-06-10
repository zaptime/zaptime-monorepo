import type {
  Day,
  TimeSlot,
  CustomField,
  CustomFieldCollected,
  ZaptimeConfig,
  ReservationResponse,
  CalendarState,
} from "@zaptime/core-shared";

export {
  book,
  reserve,
  confirm,
  cancel,
  fetchRemoteConfiguration,
  reschedule,
  stopReservationRefresh,
} from "./composables/useApi";
export { default as useCalendar } from "./composables/useCalendar";
export { default as useConfig } from "./composables/useConfig";
export { default as useSelectedTimeSlot } from "./composables/useSelectedTimeSlot";
export { default as useCurrentTimezone } from "./composables/useCurrentTimezone";
export { default as useHourCycle } from "./composables/useHourCycle";
export { default as useLocations } from "./composables/useLocations";
export { default as useStripeConfig } from "./composables/useStripeConfig";
export { default as useBookingForm } from "./composables/useBookingForm";
export { default as useGuests } from "./composables/useGuests";
export { default as useBillingAddress } from "./composables/useBillingAddress";
export { useDateFormatters } from "./composables/useDateFormatters";
export { default as useReservationReschedule } from "./composables/useReservationReschedule";

export { mergeObjects } from "@zaptime/core-shared";

export type {
  Day,
  TimeSlot,
  ZaptimeConfig,
  CustomField,
  CustomFieldCollected,
  ReservationResponse,
  // Re-exported so the generated declaration file is self-contained: it is the
  // type of `useCalendar().state`. Previously inlined; now an explicit export.
  CalendarState,
};
