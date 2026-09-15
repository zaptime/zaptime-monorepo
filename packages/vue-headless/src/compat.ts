import type { BookingInput, ConfirmationInput } from "@zaptime/core";
import { resolveCalendar } from "./context";
import type { CalendarTarget } from "./scope";
export interface IBookingOptions extends BookingInput {
  calendarId?: string;
  calendar?: CalendarTarget;
}
export interface IConfirmationOptions extends ConfirmationInput {
  calendarId?: string;
  calendar?: CalendarTarget;
}
export function book(options: IBookingOptions, target?: CalendarTarget) {
  const c = resolveCalendar(target ?? options.calendar ?? options.calendarId);
  const { calendarId: _, calendar: __, ...input } = options;
  return c.actions.book(input);
}
export function reserve(options: IBookingOptions, target?: CalendarTarget) {
  const c = resolveCalendar(target ?? options.calendar ?? options.calendarId);
  const { calendarId: _, calendar: __, ...input } = options;
  return c.actions.reserve(input);
}
export function confirm(options: IConfirmationOptions = {}, target?: CalendarTarget) {
  const c = resolveCalendar(target ?? options.calendar ?? options.calendarId);
  const { calendarId: _, calendar: __, ...input } = options;
  return c.actions.confirm(input);
}
export function cancel(target?: CalendarTarget) {
  return resolveCalendar(target).actions.cancel();
}
export function reschedule(target?: CalendarTarget) {
  return resolveCalendar(target).actions.reschedule();
}
export function stopReservationRefresh(target?: CalendarTarget) {
  return resolveCalendar(target).actions.stopReservationRefresh();
}
