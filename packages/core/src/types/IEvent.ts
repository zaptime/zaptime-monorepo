export default interface IEvent {
  calendarId: number;
  recurringEventId: number;
  eventId: number | null;
  end: string;
  start: string;
  readableType: string;
  seats: number;
  title: string;
}
