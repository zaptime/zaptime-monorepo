import useAttendeeState from "./useAttendeeState";
import useSelectedEvent from "./useSelectedEvent";
import useConfig from "./useConfig";

import {
  book as bookApi,
  reserve as reserveApi,
  confirm as confirmApi,
  cancel as cancelApi,
} from "../api/api";
import { IBookingResponse } from "../types/ApiResponses";

export const book = async (email: string, firstName?: string, lastName?: string, seats = 1, calendarId?: string): Promise<IBookingResponse> => {

  const { selectedEvent } = useSelectedEvent(calendarId);
  const { config } = useConfig(calendarId);
  
  if (selectedEvent.value !== undefined && config.value !== undefined) {
    return await bookApi(email, config.value.token, selectedEvent.value, firstName, lastName, seats);
  }

  throw new Error("Booking event failed because event was not selected!");
};

export const reserve = async (email: string, firstName?: string, lastName?: string, seats = 1, calendarId?: string): Promise<IBookingResponse> => {
 
  const { selectedEvent } = useSelectedEvent(calendarId);
  const { config } = useConfig(calendarId);
  const { setAttendeeState } = useAttendeeState(calendarId);
 
  if (selectedEvent.value !== undefined && config.value !== undefined) {
    const data = await reserveApi(
      email,
      config.value.token,
      selectedEvent.value,
      firstName,
      lastName,
      seats
    );

    setAttendeeState(data.data.event_attendee);

    return data;
  }

  throw new Error("Booking event failed because event was not selected!");
};

export const confirm = async (calendarId?: string): Promise<boolean> => {

  const { attendeeState } = useAttendeeState(calendarId);

  if (attendeeState.value !== undefined) {
    return await confirmApi(attendeeState.value);
  }

  return false;
};

export const cancel = async (calendarId?: string): Promise<boolean> => {
  const { attendeeState } = useAttendeeState(calendarId);

  if (attendeeState.value !== undefined) {
    return await cancelApi(attendeeState.value);
  }

  return false;
};
