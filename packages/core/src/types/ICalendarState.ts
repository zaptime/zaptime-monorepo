import IEvent from "./IEvent";
import IStatus from "./IStatus";
import IDfnsConf from "./IDfnsConf";
import IDay from "./IDay";

export default interface ICalendarState {
  date: Date;
  days: IDay[];
  events: IEvent[];
  eventsLoading: boolean;
  monthHasEvents: boolean;
  selectedDay: IDay | null;
  loading: boolean;
  headers: string[];
  dfnsConfig?: IDfnsConf | null;
  attendeeState: IStatus | null;
}
