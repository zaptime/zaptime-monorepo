import axios from 'axios';
import IEvent from '../types/IEvent';
import IStatus from '../types/IStatus';
import { IBookingResponse, IAvailableEventsResponse } from '../types/ApiResponses';
import { format } from 'date-fns';

const axiosInstance = axios.create({
  baseURL: 'https://api.zaptime.app/api/',
});

export const book = async (email: string, token: string, event: IEvent, firstName?: string, lastName?: string, seats = 1): Promise<IBookingResponse> => {
  try {
    const { data } = await axiosInstance.post<IBookingResponse>('/book-event', {
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
    });
    return data;
  } catch (err) {
    throw new Error('Booking event failed!');
  }
};

export const reserve = async (email: string, token: string, event: IEvent, firstName?: string, lastName?: string, seats = 1): Promise<IBookingResponse> => {
  try {
    const { data } = await axiosInstance.post<IBookingResponse>('/reserve-event', {
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
    });

    return data;
  } catch (err) {
    throw new Error('Reserving event failed!');
  }
};

export const confirm = async (status: IStatus): Promise<boolean> => {
  try {
    const { data } = await axiosInstance.post<IBookingResponse>('/confirm-event/', { event_attendee_id: status.id });

    return data.success;
  } catch (err) {
    throw new Error('Event confirmation failed!');
  }
};

export const cancel = async (status: IStatus): Promise<boolean> => {
  try {
    const { data } = await axiosInstance.post<IBookingResponse>('/cancel-event', {
      event_attendee_id: status.id,
    });

    return data.success;
  } catch (err) {
    throw new Error('Reserving event failed!');
  }
};

//token=token&from=from&until=until&group_by_day=group_by_day
export const getEvents = async (token: string, from: string, until: string): Promise<IEvent[]> => {
  try {
    const { data } = await axiosInstance.get<IAvailableEventsResponse>('/available-events', {
      params: {
        token: token,
        from: from,
        until: until,
        group_by_day: 1,
      },
    });

    return data.data;
  } catch (err) {
    console.log(err);

    throw new Error('Getting available events failed!');
  }
};
