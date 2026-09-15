import type Day from "./types/Day";
import type TimeSlot from "./types/TimeSlot";
import type { CustomField, CustomFieldCollected } from "./types/InitData";
import type ZaptimeConfig from "./types/ZaptimeConfig";
import type { ReservationResponse } from "./types/ApiResponses";

export { fetchRemoteConfig as fetchRemoteConfiguration } from "./api/api";
export { SlotNoLongerAvailableError, RescheduleNotAllowedError } from "./api/errors";
export { default as mergeObjects } from "./utils/mergeObjects";
export { default as slotNoLongerAvailableText } from "./utils/slotNoLongerAvailableText";
export { default as rescheduleNotAllowedText } from "./utils/rescheduleNotAllowedText";

export type { Day, TimeSlot, ZaptimeConfig, CustomField, CustomFieldCollected, ReservationResponse };

export { createCalendar } from "./calendar/createCalendar";
export { CalendarError } from "./api/errors";
export type { CalendarErrorCode } from "./api/errors";
export type * from "./calendar/types";
export type { BillingAddress } from "./types/BillingAddress";
export type { default as CalendarState } from "./types/CalendarState";
export type { Analytics, Location, Reservation, StripeConfig, CustomFieldValue } from "./types/InitData";
export { FormValidationError } from "./booking/validation";
export type { FieldValidationError } from "./booking/validation";
