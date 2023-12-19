import type TimeSlot from '../types/TimeSlot';
import type Status from '../types/Status';
import type { TimeSlotResponse, AvailableTimeSlotResponse, PrepareReservationResponse } from '../types/ApiResponses';

const baseUrl = 'https://api.zaptime.app/';

const bookUrl = baseUrl + 'time-slots/book';
const reserveUrl = baseUrl + 'reservations/prepare';
const confirmUrl = baseUrl + 'reservations/';
const cancelUrl = baseUrl + 'reservations/';
const availableTimeSlotsUrl = baseUrl + 'time-slots';

export interface IOptions {
  /**
   * Email of the attendee
   */
  email: string;

  /**
   * Token of the calendar
   */
  token: string;

  /**
   * Time slot
   */
  timeSlot: TimeSlot;

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
}

export const book = async (options: IOptions): Promise<TimeSlotResponse> => {
  const { email, token, timeSlot, firstName, lastName, seats = 1 } = options;

  try {
    const data = await fetch(bookUrl, {
      method: 'POST',
      body: JSON.stringify({
        start: timeSlot.start,
        end: timeSlot.end,
        email: email,
        seats: seats,
        firstname: firstName,
        lastname: lastName,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error('Booking time slot failed!');
  }
};

export const reserve = async (options: IOptions): Promise<PrepareReservationResponse> => {
  const { email, token, timeSlot, firstName, lastName, seats = 1 } = options;

  try {
    const data = await fetch(reserveUrl, {
      method: 'POST',
      body: JSON.stringify({
        start: timeSlot.start,
        end: timeSlot.end,
        email: email,
        seats: seats,
        firstname: firstName,
        lastname: lastName,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error('Reserving time slot failed!');
  }
};

export const confirm = async (token: string, status: Status): Promise<boolean> => {
  try {
    const data = await fetch(confirmUrl + status.uuid + '/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => response.json());

    return data.success;
  } catch (err) {
    throw new Error('Time slot confirmation failed!');
  }
};

export const cancel = async (token: string, status: Status): Promise<boolean> => {
  try {
    const data = await fetch(cancelUrl + status.uuid, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((resposne) => resposne.json());

    return data.success;
  } catch (err) {
    throw new Error('Reserving time slot failed!');
  }
};

//token=token&from=from&until=until&group_by_day=group_by_day
export const getAvailableTimeSlots = async (token: string, from: string, until: string): Promise<TimeSlot[]> => {
  try {
    const data: AvailableTimeSlotResponse = await fetch(
      availableTimeSlotsUrl +
        '?' +
        new URLSearchParams({
          from: from,
          until: until,
        }),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    ).then((response) => response.json());

    return data.data;
  } catch (err) {
    console.log(err);

    throw new Error('Getting available time slots failed!');
  }
};
