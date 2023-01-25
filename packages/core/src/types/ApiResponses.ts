import IEvent from "./IEvent";
import IStatus from "./IStatus";

export interface IBookingResponse {
  success: boolean;
  data: {
    event_attendee: IStatus;
    created_at: string;
    email: string;
    end: string;
    event_id: number;
    firstname: string;
    id: number;
    lastname?: string;
    integration_event_id?: number;
    phone?: string;
    seats: number;
    start: string;
    status: string;
    updated_at: string;
    user_id: number;
    uuid: string;
    data?: unknown;
  };
}

export interface IAvailableEventsResponse {
  success: boolean;
  data: IEvent[];
}
