import IEvent from '../types/IEvent';
import IStatus from '../types/IStatus';
import { IBookingResponse, IAvailableEventsResponse } from '../types/ApiResponses';
import { format } from 'date-fns';

const baseUrl = 'https://api.zaptime.app/api/';

export const book = async (email: string, token: string, event: IEvent, timezone: string, firstName?: string, lastName?: string, seats = 1): Promise<IBookingResponse> => {
  try {
    const data = await fetch(baseUrl + '/book-event', {
      method: 'POST',
      body: JSON.stringify({
        token: token,
        event_id: event.eventId,
        date: format(new Date(event.start), 'yyyy-MM-dd'),
        email: email,
        seats: seats,
        firstname: firstName,
        lastName: lastName,
        start: event.start,
        end: event.end,
        recurring_event_id: event.recurringEventId,
        timezone: timezone,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error('Booking event failed!');
  }
};

export const reserve = async (email: string, token: string, event: IEvent, timezone: string, firstName?: string, lastName?: string, seats = 1): Promise<IBookingResponse> => {
  try {
    const data = await fetch(baseUrl + '/reserve-event', {
      method: 'POST',
      body: JSON.stringify({
        token: token,
        event_id: event.eventId,
        date: format(new Date(event.start), 'yyyy-MM-dd'),
        email: email,
        seats: seats,
        firstname: firstName,
        lastName: lastName,
        start: event.start,
        end: event.end,
        recurring_event_id: event.recurringEventId,
        timezone: timezone,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error('Reserving event failed!');
  }
};

export const confirm = async (status: IStatus): Promise<boolean> => {
  try {
    const data = await fetch(
      baseUrl +
        '/confirm-event/' +
        new URLSearchParams({
          event_attendee_id: status.id.toString(),
        }),
      {
        method: 'POST',
        body: JSON.stringify(status),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      },
    ).then((response) => response.json());

    return data.success;
  } catch (err) {
    throw new Error('Event confirmation failed!');
  }
};

export const cancel = async (status: IStatus): Promise<boolean> => {
  try {
    const data = await fetch(
      baseUrl +
        '/cancel-event' +
        new URLSearchParams({
          event_attendee_id: status.id.toString(),
        }),
      {
        method: 'POST',
        body: JSON.stringify(status),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      },
    ).then((resposne) => resposne.json());

    return data.success;
  } catch (err) {
    throw new Error('Reserving event failed!');
  }
};

//token=token&from=from&until=until&group_by_day=group_by_day
export const getEvents = async (token: string, from: string, until: string): Promise<IEvent[]> => {
  try {
    const data: IAvailableEventsResponse = await fetch(
      baseUrl +
        '/available-events' +
        new URLSearchParams({
          token: token,
          from: from,
          until: until,
          group_by_day: '1',
        }),
    ).then((response) => response.json());

    return data.data;
  } catch (err) {
    console.log(err);

    throw new Error('Getting available events failed!');
  }
};
