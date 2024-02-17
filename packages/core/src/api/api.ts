import type TimeSlot from '../types/TimeSlot';
import type Status from '../types/Status';
import type { TimeSlotResponse, AvailableTimeSlotResponse, PrepareReservationResponse } from '../types/ApiResponses';

const defaultBaseUrl = 'https://api.zaptime.app/';

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

  /**
   * Base URL override
   */
  baseUrl?: string;
}

export const book = async (options: IOptions): Promise<TimeSlotResponse> => {
  const { email, token, timeSlot, firstName, lastName, seats = 1, baseUrl = defaultBaseUrl } = options;

  try {
    const data = await fetch(getBookUrl(baseUrl), {
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
  const { email, token, timeSlot, firstName, lastName, seats = 1, baseUrl = defaultBaseUrl } = options;

  try {
    const data = await fetch(getReserveUrl(baseUrl), {
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

export const confirm = async (token: string, status: Status, baseUrl = defaultBaseUrl): Promise<boolean> => {
  try {
    const data = await fetch(getConfirmUrl(baseUrl, status.uuid), {
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

export const cancel = async (token: string, status: Status, baseUrl = defaultBaseUrl): Promise<boolean> => {
  try {
    const data = await fetch(getCancelUrl(baseUrl, status.uuid), {
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
export const getAvailableTimeSlots = async (token: string, from: string, until: string, baseUrl = defaultBaseUrl): Promise<TimeSlot[]> => {
  try {
    const data: AvailableTimeSlotResponse = await fetch(
      getAvailableTimeSlotsUrl(baseUrl) +
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

function getBookUrl(baseUrl: string) {
  return baseUrl + 'reservations';
}

function getReserveUrl(baseUrl: string) {
  return baseUrl + 'reservations/prepare';
}

function getConfirmUrl(baseUrl: string, uuid: string) {
  return baseUrl + 'reservations/' + uuid + '/confirm';
}

function getCancelUrl(baseUrl: string, uuid: string) {
  return baseUrl + 'reservations/' + uuid;
}

function getAvailableTimeSlotsUrl(baseUrl: string) {
  return baseUrl + 'time-slots';
}
