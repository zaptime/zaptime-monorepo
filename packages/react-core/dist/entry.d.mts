import { Result } from "ts-results-es";
import { Locale } from "date-fns";

//#region ../core-shared/src/types/TimeSlot.d.ts
interface TimeSlot {
  calendarId: number;
  end: string;
  start: string;
  readableType: string;
  seats: number;
  title: string;
}
//#endregion
//#region ../core-shared/src/types/Status.d.ts
interface Status {
  uuid: string;
}
//#endregion
//#region ../core-shared/src/types/ApiResponses.d.ts
interface ReservationResponse {
  success: boolean;
  data: {
    uuid: string;
    userId: number;
    userName: string;
    userEmail: string;
  };
}
//#endregion
//#region ../core-shared/src/types/ZaptimeTheme.d.ts
interface ZaptimeTheme {
  preset?: "basic" | "elegant" | "playful";
  mode?: "light" | "dark";
  borderRadius?: string;
  colors?: {
    white?: string;
    black?: string;
    "25"?: string;
    "50"?: string;
    "100"?: string;
    "200"?: string;
    "300"?: string;
    "400"?: string;
    "500"?: string;
    "600"?: string;
    "700"?: string;
    "800"?: string;
    "900"?: string;
    accentLight?: string;
    accentBase?: string;
    accentDark?: string;
  };
}
//#endregion
//#region ../core-shared/src/types/ZaptimeLocale.d.ts
interface ZaptimeLocale {
  preset?: string;
  startDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  headers?: {
    mon?: string;
    tue?: string;
    wed?: string;
    thu?: string;
    fri?: string;
    sat?: string;
    sun?: string;
  };
  hideTimePreferences?: boolean;
  texts?: {
    introduction?: string;
    chooseDate?: string;
    noTimeSlotAvailable?: string;
    choosePreferredTime?: string;
    pickTime?: string;
    showNextMonth?: string;
  };
  confirmationForm?: {
    confirmBooking?: string;
    reschedulingEvent?: string;
    addGuests?: string;
    buttons?: {
      confirmBooking?: string;
      reschedule?: string;
      goBack?: string;
    };
    payments?: {
      showBillingDetails: string;
      price: string;
      cardNumber: string;
      name: string;
      email: string;
      company: string;
      address: string;
      city: string;
      zip: string;
      country: string;
      vatId: string;
      crn: string;
    };
  };
}
//#endregion
//#region ../core-shared/src/types/ZaptimeConfig.d.ts
interface ZaptimeConfig {
  token: string;
  min?: number;
  max?: number;
  closestBookableDay?: number;
  locale?: ZaptimeLocale;
  theme?: ZaptimeTheme;
  profileImage?: string;
  externalBooking?: boolean;
  compact?: boolean;
  apiBaseUrl?: string;
  redirectAfterBookingUrl?: string;
  hideLocation?: boolean;
  reservationUuid?: string;
}
//#endregion
//#region ../core-shared/src/types/InitData.d.ts
type ConfigWithoutToken = Omit<ZaptimeConfig, "token">;
type Analytics = {
  name: string;
  data: Record<string, any>;
};
type Location = {
  type: string;
  value: string;
  default?: boolean;
};
type Reservation = {
  email: string;
  end: string;
  start: string;
  firstName?: string;
  lastName?: string;
  location?: Location;
  status: string;
  uuid: string;
};
type InitData = {
  configuration: ConfigWithoutToken;
  disabled: boolean;
  analytics?: Analytics[];
  locations?: Location[];
  stripeConfig?: StripeConfig;
  customFields?: CustomField[];
  reservation?: Reservation;
  isSubscribed: boolean;
  eventTypeName: string;
  maxGuests?: number | null;
};
type StripeConfig = {
  price: number;
  currency: string;
  stripeAccountId: string;
};
type CustomFieldCollected = {
  uuid: string;
  value?: CustomFieldValue;
};
type CustomFieldValue = string | number | boolean | string[];
type CustomField = {
  label: string;
  name: string;
  uuid: string;
  type: "text" | "email" | "phone" | "number" | "textarea" | "switch" | "checkbox" | "select" | "multiselect" | "radio";
  required: boolean;
  mergeTag?: "FIRST_NAME" | "LAST_NAME" | "EMAIL" | "PHONE" | string;
  placeholder?: string;
  options?: string[];
  value?: CustomFieldValue;
};
type Success = InitData;
type Errors = "invalidToken";
//#endregion
//#region ../core-shared/src/types/Day.d.ts
interface Day {
  label: string;
  date?: Date;
  isPast?: boolean;
  timeSlots?: TimeSlot[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
}
//#endregion
//#region ../core-shared/src/types/DfnsConfig.d.ts
interface DfnsConfig {
  locale: Locale;
}
//#endregion
//#region ../core-shared/src/utils/mergeObjects.d.ts
declare function mergeRecursive(obj1: any, obj2: any): any;
//#endregion
//#region ../core-shared/src/types/CalendarState.d.ts
interface CalendarState {
  date: Date;
  days: Day[];
  timeSlots: TimeSlot[];
  monthHasTimeSlots: boolean;
  selectedDay: Day | null;
  loading: boolean;
  headers: string[];
  dfnsConfig?: DfnsConfig;
  attendeeState?: Status;
  initLoaded: boolean;
}
//#endregion
//#region src/api/useApi.d.ts
interface IBookingOptions {
  /** Email of the attendee */
  email: string;
  /** First name of the attendee */
  firstName?: string;
  /** Last name of the attendee */
  lastName?: string;
  /**
   * Number of seats to book
   * @default 1
   */
  seats?: number;
  /** Calendar Id */
  calendarId?: string;
  /** Phone number of the attendee */
  phone?: string;
  /** Location of the Event Type */
  location?: Location;
  /** Custom fields */
  customFields?: CustomFieldCollected[];
  /** Guest email addresses */
  guests?: string[];
}
type IConfirmationOptions = Omit<IBookingOptions, "email" | "location" | "seats">;
/**
 * Book attendee to a specific time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#book
 */
declare const book: (options: IBookingOptions) => Promise<ReservationResponse>;
/**
 * Reserve a timeslot for the attendee, automatically refreshing the
 * reservation every 15 minutes until the active session ends.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#reserve
 */
declare const reserve: (options: IBookingOptions) => Promise<ReservationResponse>;
/**
 * Confirm a previously reserved time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#confirm
 */
declare const confirm: (options?: IConfirmationOptions) => Promise<ReservationResponse>;
/**
 * Cancel a previously reserved time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#cancel
 */
declare const cancel: (calendarId?: string) => Promise<boolean>;
/**
 * Reschedule a previously loaded reservation to the selected time slot.
 */
declare const reschedule: (calendarId?: string) => Promise<ReservationResponse>;
/**
 * Fetches remote Zaptime configuration. Contains additional data about the
 * Event Type configuration.
 *
 * @see https://zaptime.docs.apiary.io/#reference/0/event-types-collection/initialize-event-type
 */
declare const fetchRemoteConfiguration: (token: string, apiBaseUrl?: string, reservationUuid?: string) => Promise<Result<Success, Errors>>;
/** Stop the reservation auto-refresh interval. */
declare const stopReservationRefresh: () => void;
//#endregion
//#region src/hooks/useCalendar.d.ts
declare function useCalendar(calendarId?: string): {
  getDays: () => Promise<void>;
  init: () => Promise<void>;
  selectTimeSlot: (timeSlot: TimeSlot) => void;
  nextDisabled: boolean;
  prevDisabled: boolean;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  dayClicked: (day: Day) => void;
  dayHasTimeSlot: (day: Day) => boolean;
  isSelected: (timeSlot: TimeSlot) => boolean;
  isSelectedDay: (day: Day) => boolean;
  currentYear: string;
  monthName: string;
  config: ZaptimeConfig;
  state: CalendarState;
};
//#endregion
//#region src/hooks/useConfig.d.ts
declare function useConfig(calendarId?: string): {
  config: ZaptimeConfig;
  setConfig: (cfg: ZaptimeConfig) => void;
};
//#endregion
//#region src/hooks/useSelectedTimeSlot.d.ts
declare function useSelectedTimeSlot(calendarId?: string): {
  selectedTimeSlot: TimeSlot | undefined;
  setSelectedTimeSlot: (timeSlot: TimeSlot | undefined) => void;
};
//#endregion
//#region src/hooks/useCurrentTimezone.d.ts
declare function useCurrentTimezone(): {
  clientOriginalTimezone: string;
  timezone: string;
  setTimezone: (timezone: string) => void;
};
//#endregion
//#region src/hooks/useHourCycle.d.ts
type HourCycles = "h23" | "h11" | "h12" | "h24" | undefined;
/** Framework-agnostic accessor (used by date formatters). */
declare function useHourCycle(): {
  clientOriginalHourCycle: HourCycles;
  setHourCycle: (hourCycle: "h11" | "h23") => void;
  hourCycle: HourCycles;
};
//#endregion
//#region src/hooks/useLocations.d.ts
declare function useLocations(calendarId?: string): {
  locations: Location[];
  setLocations: (newLocations: Location[]) => void;
  isPhoneCall: boolean;
};
//#endregion
//#region src/hooks/useStripeConfig.d.ts
declare function useStripeConfig(calendarId?: string): {
  stripeConfig: StripeConfig | undefined;
  setStripeConfig: (stripeConfig: StripeConfig) => void;
};
//#endregion
//#region src/hooks/useBookingForm.d.ts
interface CollectedFormValues {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string;
  phone: string | undefined;
  customFields: CustomFieldCollected[];
  guests: string[] | undefined;
}
declare function useBookingForm(calendarId?: string): {
  setBookingForm: (customFields: CustomField[]) => void;
  bookingForm: CustomField[];
  setCustomFieldValue: (uuid: string, value: CustomFieldValue) => void;
  collectFormValues: () => CollectedFormValues;
};
//#endregion
//#region src/hooks/useGuests.d.ts
declare function useGuests(calendarId?: string): {
  guests: string[];
  maxGuests: number | null;
  guestsEnabled: boolean;
  canAddGuest: boolean;
  setMaxGuests: (n: number | null) => void;
  addGuest: (email?: string) => void;
  removeGuest: (index: number) => void;
  updateGuest: (index: number, email: string) => void;
};
//#endregion
//#region src/hooks/useBillingAddress.d.ts
type BillingAddress = {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  crn: string;
  vatId: string;
};
declare function useBillingAddress(calendarId?: string): {
  billingAddress: BillingAddress;
  setBillingAddress: (billingAddress: BillingAddress) => void;
  updateBillingAddressField: (field: keyof BillingAddress, value: string) => void;
};
//#endregion
//#region src/hooks/useDateFormatters.d.ts
declare function useDateFormatters(): {
  getFormattedTime: (date: string) => string;
  getFormattedDay: (date: string) => string;
  getFormattedDayInMonth: (date: string) => string;
  loadDateFnsConfig: (locale: string) => Promise<void>;
};
//#endregion
//#region src/hooks/useReservationReschedule.d.ts
declare function useReservationReschedule(calendarId?: string): {
  reservation: Reservation | undefined;
  setSelectedReservation: (reservation: Reservation | undefined) => void;
};
//#endregion
export { type CalendarState, type CustomField, type CustomFieldCollected, type Day, type IBookingOptions, type IConfirmationOptions, type ReservationResponse, type TimeSlot, type ZaptimeConfig, book, cancel, confirm, fetchRemoteConfiguration, mergeRecursive as mergeObjects, reschedule, reserve, stopReservationRefresh, useBillingAddress, useBookingForm, useCalendar, useConfig, useCurrentTimezone, useDateFormatters, useGuests, useHourCycle, useLocations, useReservationReschedule, useSelectedTimeSlot, useStripeConfig };