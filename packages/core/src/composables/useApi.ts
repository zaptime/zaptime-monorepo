import useReservationStatus from './useReservationStatus';
import useSelectedTimeSlot from './useSelectedTimeSlot';
import useConfig from './useConfig';

import { book as bookApi, reserve as reserveApi, confirm as confirmApi, cancel as cancelApi } from '../api/api';
import { TimeSlotResponse, PrepareReservationResponse } from '../types/ApiResponses';

export interface IBookingOptions {
  /**
   * Email of the attendee
   */
  email: string;

  /**
   * First name of the attendee
   */
  firstName?: string;

  /**
   * Last name of the attendee
   */
  lastName?: string;

  /**
   * Number of seats to book
   *
   * @default 1
   */
  seats?: number;

  /**
   * Calendar Id
   */
  calendarId?: string;
}

/**
 * Book Attandee to specific time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#book
 * @param options
 */
export const book = async (options: IBookingOptions): Promise<TimeSlotResponse> => {
  const { email, firstName, lastName, seats = 1, calendarId } = options;
  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);
  const { config } = useConfig(calendarId);

  if (selectedTimeSlot.value !== undefined && config.value !== undefined) {
    try {
      const res = await bookApi({
        email,
        token: config.value.token,
        timeSlot: selectedTimeSlot.value,
        firstName,
        lastName,
        seats,
        baseUrl: config.value.apiBaseUrl,
      });

      if (config.value.redirectAfterBookingUrl !== undefined) {
        window.location.href = config.value.redirectAfterBookingUrl;
      }

      return res;
    } catch (e) {
      throw new Error('Booking a time slot failed because time slot was not selected!');
    }
  }

  throw new Error('Booking a time slot failed because time slot was not selected!');
};

/**
 * Reserve an timeslot for the attendee
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#reserve
 * @param options
 */
export const reserve = async (options: IBookingOptions): Promise<PrepareReservationResponse> => {
  const { email, firstName, lastName, seats = 1, calendarId } = options;

  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);

  const { config } = useConfig(calendarId);
  const { setReservationStatus } = useReservationStatus(calendarId);

  if (selectedTimeSlot.value !== undefined && config.value !== undefined) {
    const data = await reserveApi({
      email: email,
      token: config.value.token,
      timeSlot: selectedTimeSlot.value,
      firstName: firstName,
      lastName: lastName,
      seats: seats,
      baseUrl: config.value.apiBaseUrl,
    });

    setReservationStatus(data.data);

    return data;
  }

  throw new Error('Booking a time slot failed because time slot was not selected!');
};

/**
 * Confirm previously reserved time slot
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#confirm
 * @param calendarId
 */
export const confirm = async (calendarId?: string): Promise<boolean> => {
  const { reservationStatus } = useReservationStatus(calendarId);
  const { config } = useConfig(calendarId);

  if (reservationStatus.value !== undefined) {
    return await confirmApi(config.value.token, reservationStatus.value, config.value.apiBaseUrl);
  }

  return false;
};

/**
 * Cancel previously reserved time slot
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#cancel
 * @param calendarId
 */
export const cancel = async (calendarId?: string): Promise<boolean> => {
  const { reservationStatus } = useReservationStatus(calendarId);
  const { config } = useConfig(calendarId);

  if (reservationStatus.value !== undefined) {
    return await cancelApi(config.value.token, reservationStatus.value, config.value.apiBaseUrl);
  }

  return false;
};
