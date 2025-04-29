import Status from "./Status";
import DfnsConfig from "./DfnsConfig";
import Day from "./Day";
import TimeSlot from "./TimeSlot";

export default interface CalendarState {
  date: Date;
  days: Day[];
  timeSlots: TimeSlot[];
  monthHasTimeSlots: boolean;
  selectedDay: Day | null;
  loading: boolean;
  headers: string[];
  dfnsConfig?: DfnsConfig;
  attendeeState?: Status;
  initLoaded: boolean;
}
