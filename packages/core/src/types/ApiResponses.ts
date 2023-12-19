import TimeSlot from './TimeSlot';
import Status from './Status';

export interface TimeSlotResponse {
  success: boolean;
  data: {
    event_attendee: Status;
    created_at: string;
    email: string;
    end: string;
    firstname: string;
    id: number;
    lastname?: string;
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

export interface AvailableTimeSlotResponse {
  success: boolean;
  data: TimeSlot[];
}

export interface PrepareReservationResponse {
  success: boolean;
  data: {
    uuid: string;
  };
}
