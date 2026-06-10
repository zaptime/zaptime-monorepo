import TimeSlot from "./TimeSlot";

export interface AvailableTimeSlotResponse {
  success: boolean;
  data: TimeSlot[];
}

export interface ReservationResponse {
  success: boolean;
  data: {
    uuid: string;
    userId: number;
    userName: string;
    userEmail: string;
  };
}
