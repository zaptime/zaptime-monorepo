import {
  book as bookApi,
  reserve as reserveApi,
  confirm as confirmApi,
  cancel as cancelApi,
  fetchRemoteConfig,
  reschedule as rescheduleApi,
  refreshReserve as refreshReserveApi,
} from "@zaptime/core-shared";
import type {
  Success,
  Errors,
  Location,
  ReservationResponse,
  CustomFieldCollected,
} from "@zaptime/core-shared";
import { Result } from "ts-results-es";
import { getSelectedTimeSlotValue } from "../hooks/useSelectedTimeSlot";
import { getConfigValue } from "../hooks/useConfig";
import { getTimezoneValue } from "../hooks/useCurrentTimezone";
import { getLocationsValue } from "../hooks/useLocations";
import {
  getReservationStatusValue,
  setReservationStatusValue,
} from "../hooks/useReservationStatus";
import { getReservationValue } from "../hooks/useReservationReschedule";

let reservationIntervalId: ReturnType<typeof setInterval> | null = null;

export interface IBookingOptions {
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

export type IConfirmationOptions = Omit<
  IBookingOptions,
  "email" | "location" | "seats"
>;

/**
 * Book attendee to a specific time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#book
 */
export const book = async (
  options: IBookingOptions,
): Promise<ReservationResponse> => {
  const {
    email,
    firstName,
    lastName,
    seats = 1,
    calendarId,
    phone,
    location,
    customFields,
    guests,
  } = options;

  const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
  const config = getConfigValue(calendarId);
  const timezone = getTimezoneValue();
  const internalLocations = getLocationsValue(calendarId);

  if (selectedTimeSlot !== undefined && config !== undefined) {
    try {
      const res = await bookApi({
        email,
        token: config.token,
        timeSlot: selectedTimeSlot,
        firstName,
        lastName,
        seats,
        baseUrl: config.apiBaseUrl,
        phone,
        location: location ?? internalLocations[0],
        timezone,
        customFields,
        guests,
      });

      if (
        config.redirectAfterBookingUrl !== undefined &&
        typeof window !== "undefined"
      ) {
        window.location.href = config.redirectAfterBookingUrl;
      }

      return res;
    } catch (e) {
      throw new Error(
        "Booking a time slot failed because time slot was not selected!",
      );
    }
  }

  throw new Error(
    "Booking a time slot failed because time slot was not selected!",
  );
};

/**
 * Reserve a timeslot for the attendee, automatically refreshing the
 * reservation every 15 minutes until the active session ends.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#reserve
 */
export const reserve = async (
  options: IBookingOptions,
): Promise<ReservationResponse> => {
  return await startReservationInterval(options);
};

/**
 * Confirm a previously reserved time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#confirm
 */
export const confirm = async (
  options?: IConfirmationOptions,
): Promise<ReservationResponse> => {
  const reservationStatus = getReservationStatusValue(options?.calendarId);
  const config = getConfigValue(options?.calendarId);

  if (reservationStatus !== undefined) {
    const res = await confirmApi({
      token: config.token,
      status: reservationStatus,
      baseUrl: config.apiBaseUrl,
      firstName: options?.firstName,
      lastName: options?.lastName,
      phone: options?.phone,
      customFields: options?.customFields,
      guests: options?.guests,
    });
    stopReservationRefresh();
    return res;
  }

  throw new Error(
    "Confirming a time slot failed because time slot was not reserved!",
  );
};

/**
 * Cancel a previously reserved time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#cancel
 */
export const cancel = async (calendarId?: string): Promise<boolean> => {
  const reservationStatus = getReservationStatusValue(calendarId);
  const config = getConfigValue(calendarId);

  if (reservationStatus !== undefined) {
    const res = await cancelApi(
      config.token,
      reservationStatus,
      config.apiBaseUrl,
    );
    stopReservationRefresh();
    return res;
  }

  return false;
};

/**
 * Reschedule a previously loaded reservation to the selected time slot.
 */
export const reschedule = async (
  calendarId?: string,
): Promise<ReservationResponse> => {
  const reservation = getReservationValue(calendarId);
  const config = getConfigValue(calendarId);
  const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
  const timezone = getTimezoneValue();

  if (reservation !== undefined && selectedTimeSlot !== undefined) {
    return await rescheduleApi({
      start: selectedTimeSlot.start,
      end: selectedTimeSlot.end,
      token: config.token,
      uuid: reservation.uuid,
      baseUrl: config.apiBaseUrl,
      timezone,
    });
  }

  throw new Error(
    "Rescheduling a time slot failed because time slot was not selected!",
  );
};

/**
 * Fetches remote Zaptime configuration. Contains additional data about the
 * Event Type configuration.
 *
 * @see https://zaptime.docs.apiary.io/#reference/0/event-types-collection/initialize-event-type
 */
export const fetchRemoteConfiguration = async (
  token: string,
  apiBaseUrl?: string,
  reservationUuid?: string,
): Promise<Result<Success, Errors>> => {
  return await fetchRemoteConfig(token, apiBaseUrl, reservationUuid);
};

async function initReservation(
  options: IBookingOptions,
): Promise<ReservationResponse> {
  const {
    email,
    firstName,
    lastName,
    seats = 1,
    calendarId,
    location,
    phone,
    customFields,
    guests,
  } = options;

  const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
  const config = getConfigValue(calendarId);
  const timezone = getTimezoneValue();
  const internalLocations = getLocationsValue(calendarId);

  if (selectedTimeSlot !== undefined && config !== undefined) {
    const data = await reserveApi({
      email,
      token: config.token,
      timeSlot: selectedTimeSlot,
      firstName,
      lastName,
      seats,
      baseUrl: config.apiBaseUrl,
      phone,
      location: location ?? internalLocations[0],
      timezone,
      customFields,
      guests,
    });

    setReservationStatusValue(calendarId, data.data);

    return data;
  }

  throw new Error(
    "Booking a time slot failed because time slot was not selected!",
  );
}

async function refreshReservation(options: IBookingOptions): Promise<void> {
  const reservationStatus = getReservationStatusValue(options.calendarId);
  const config = getConfigValue(options.calendarId);

  if (reservationStatus !== undefined) {
    await refreshReserveApi(
      config.token,
      reservationStatus,
      config.apiBaseUrl,
    );
  }
}

// Reserve once immediately, then keep refreshing every 15 minutes.
const startReservationInterval = (
  options: IBookingOptions,
): Promise<ReservationResponse> => {
  // Clear any existing interval to avoid multiple intervals
  if (reservationIntervalId) {
    clearInterval(reservationIntervalId);
  }

  const res = initReservation(options);

  reservationIntervalId = setInterval(
    () => {
      refreshReservation(options).catch(() => {
        stopReservationRefresh();
      });
    },
    15 * 60 * 1000,
  );

  return res;
};

/** Stop the reservation auto-refresh interval. */
export const stopReservationRefresh = (): void => {
  if (reservationIntervalId) {
    clearInterval(reservationIntervalId);
    reservationIntervalId = null;
  }
};
