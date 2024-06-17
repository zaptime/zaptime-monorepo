import useReservationStatus from './useReservationStatus';
import useSelectedTimeSlot from './useSelectedTimeSlot';
import useLocations from './useLocations';
import useConfig from './useConfig';
import { Success, Errors, Location } from '../types/InitData';
import { book as bookApi, reserve as reserveApi, confirm as confirmApi, cancel as cancelApi, fetchRemoteConfig, reschedule as rescheduleApi } from '../api/api';
import { ReservationResponse } from '../types/ApiResponses';
import { Result } from 'ts-results';
import useCurrentTimezone from './useCurrentTimezone';
import { CustomFieldCollected } from '../types/InitData';
import useReservationReschedule from './useReservationReschedule';

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

  /**
   * Phone number of the attendee
   */

  phone?: string;

  /**
   * Location of the Event Type
   */
  location?: Location;

  /**
   * Custom fields
   */
  customFields?: CustomFieldCollected[];
}

export type IConfirmationOptions = Omit<IBookingOptions, 'email' | 'location' | 'seats'>;

/**
 * Book Attandee to specific time slot.
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#book
 * @param options
 */
export const book = async (options: IBookingOptions): Promise<ReservationResponse> => {
  const { email, firstName, lastName, seats = 1, calendarId, phone, location, customFields } = options;
  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);
  const { config } = useConfig(calendarId);
  const { timezone } = useCurrentTimezone();
  const { locations: internalLocations } = useLocations(calendarId);

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
        phone: phone,
        location: location ?? internalLocations.value[0],
        timezone: timezone.value,
        customFields: customFields,
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
export const reserve = async (options: IBookingOptions): Promise<ReservationResponse> => {
  const { email, firstName, lastName, seats = 1, calendarId, location, phone, customFields } = options;

  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);

  const { config } = useConfig(calendarId);
  const { setReservationStatus } = useReservationStatus(calendarId);
  const { timezone } = useCurrentTimezone();
  const { locations: internalLocations } = useLocations(calendarId);

  if (selectedTimeSlot.value !== undefined && config.value !== undefined) {
    const data = await reserveApi({
      email: email,
      token: config.value.token,
      timeSlot: selectedTimeSlot.value,
      firstName: firstName,
      lastName: lastName,
      seats: seats,
      baseUrl: config.value.apiBaseUrl,
      phone: phone,
      location: location ?? internalLocations.value[0],
      timezone: timezone.value,
      customFields: customFields,
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
 * @param options
 */
export const confirm = async (options?: IConfirmationOptions): Promise<ReservationResponse> => {
  const { reservationStatus } = useReservationStatus(options?.calendarId);
  const { config } = useConfig(options?.calendarId);

  if (reservationStatus.value !== undefined) {
    return await confirmApi({
      token: config.value.token,
      status: reservationStatus.value,
      baseUrl: config.value.apiBaseUrl,
      firstName: options?.firstName,
      lastName: options?.lastName,
      phone: options?.phone,
      customFields: options?.customFields,
    });
  }

  throw new Error('Confirming a time slot failed because time slot was not reserved!');
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

/**
 * Cancel previously reserved time slot
 *
 * @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#cancel
 * @param calendarId
 */
export const reschedule = async (calendarId?: string): Promise<ReservationResponse> => {
  const { reservation } = useReservationReschedule(calendarId);
  const { config } = useConfig(calendarId);
  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);
  const { timezone } = useCurrentTimezone();

  if (reservation.value !== undefined && selectedTimeSlot.value !== undefined) {
    return await rescheduleApi({
      start: selectedTimeSlot.value.start,
      end: selectedTimeSlot.value.end,
      token: config.value.token,
      uuid: reservation.value?.uuid,
      baseUrl: config.value.apiBaseUrl,
      timezone: timezone.value,
    });
  }

  throw new Error('Rescheduling a time slot failed because time slot was not selected!');
};

/**
 * Fetches remote Zaptime configuration. Contains additional data about the Event Type configuration.
 *
 * @see https://zaptime.docs.apiary.io/#reference/0/event-types-collection/initialize-event-type
 * @param calendarId
 */

export const fetchRemoteConfiguration = async (token: string, apiBaseUrl?: string, reservationUuid?: string): Promise<Result<Success, Errors>> => {
  return await fetchRemoteConfig(token, apiBaseUrl, reservationUuid);
};
