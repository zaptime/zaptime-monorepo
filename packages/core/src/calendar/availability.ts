import { addDays, addMonths, differenceInCalendarMonths, endOfMonth, format, getDay, getDaysInMonth, startOfMonth } from "date-fns";
import { tz } from "@date-fns/tz";
import { createZaptimeClient } from "../api/client";
import { CalendarError } from "../api/errors";
import { getStartOfTheWeekIndex } from "../utils/localeLogic";
import type { CalendarContext } from "./lifecycle";
import type { CalendarStatePatch } from "./initialization";
import type { DeepReadonly } from "./types";
import type CalendarState from "../types/CalendarState";
import type Day from "../types/Day";
import type TimeSlot from "../types/TimeSlot";

export const dateKey = (date: Date | string | { getTime(): number }, timezone: string) => format(typeof date === "string" ? new Date(date) : new Date(date.getTime()), "yyyy-MM-dd", { in: tz(timezone) });
export const sameSlot = (a: DeepReadonly<TimeSlot> | undefined, b: DeepReadonly<TimeSlot> | undefined) =>
  !!a && !!b && new Date(a.start).getTime() === new Date(b.start).getTime() && new Date(a.end).getTime() === new Date(b.end).getTime() && a.calendarId === b.calendarId;
export function createAvailability(context: CalendarContext) {
  const client = createZaptimeClient({ fetch: context.runtime.fetch });
  let generation = 0;
  let controller: AbortController | undefined;
  const commitCalendar = (patch: CalendarStatePatch) => context.store.commit({ calendar: { ...context.store.getSnapshot().calendar, ...patch } as CalendarState });
  const invalidate = () => {
    generation++;
    controller?.abort();
  };
  const isBusy = () => ["submitting", "recovery-required"].includes(context.store.getSnapshot().phase);
  const assertEditable = () => {
    context.assertActive();
    if (isBusy()) throw new CalendarError("busy", "Calendar is busy");
  };
  const unsubscribe = context.store.subscribe(() => {
    if (isBusy()) {
      invalidate();
      if (context.store.getSnapshot().calendar.loading) commitCalendar({ loading: false });
    }
  });
  context.onDispose(() => {
    invalidate();
    unsubscribe();
  });
  function bound(direction: number) {
    const s = context.store.getSnapshot();
    const options = { in: tz(s.timezone) };
    const distance = differenceInCalendarMonths(addMonths(new Date(s.calendar.date.getTime()), direction, options), context.runtime.now(), options);
    return direction > 0 ? s.config.max !== undefined && distance > s.config.max : s.config.min !== undefined && -distance > s.config.min;
  }
  async function getDays() {
    assertEditable();
    if (context.store.getSnapshot().phase === "disabled") return;
    invalidate();
    const current = generation;
    controller = new AbortController();
    const s = context.store.getSnapshot();
    const options = { in: tz(s.timezone) };
    const start = startOfMonth(new Date(s.calendar.date.getTime()), options);
    const now = context.runtime.now();
    let from = dateKey(start, s.timezone);
    if (differenceInCalendarMonths(start, now, options) === 0 && s.config.closestBookableDay !== undefined) from = dateKey(addDays(now, s.config.closestBookableDay, options), s.timezone);
    commitCalendar({ loading: true });
    try {
      const slots = await client.getAvailableTimeSlots(s.config.token, from, dateKey(endOfMonth(start, options), s.timezone), s.config.apiBaseUrl, controller.signal);
      if (context.isDisposed() || current !== generation || isBusy()) return;
      const days: Day[] = [];
      const offset = (getDay(start, options) - getStartOfTheWeekIndex(s.config.locale ?? {}) + 7) % 7;
      for (let i = offset; i > 0; i--) days.push({ label: format(addDays(start, -i, options), "d", options), isPast: true });
      const today = dateKey(now, s.timezone);
      for (let i = 0; i < getDaysInMonth(start, options); i++) {
        const date = addDays(start, i, options);
        const key = dateKey(date, s.timezone);
        const times = slots.filter((slot) => dateKey(slot.start, s.timezone) === key && key >= from);
        days.push({ label: String(i + 1), date, isPast: key < today, isToday: key === today, isCurrentMonth: true, timeSlots: times.length ? times : undefined });
      }
      const gridSize = days.length <= 35 ? 35 : 42;
      for (let i = 1; days.length < gridSize; i++) days.push({ label: String(i), isPast: true });
      const available = days.filter((d) => !d.isPast && d.timeSlots?.length);
      const selectedSlot = context.store.getSnapshot().selectedTimeSlot;
      const retained = selectedSlot && available.find((d) => d.timeSlots?.some((slot) => sameSlot(slot, selectedSlot)));
      const reservation = s.reservation && available.find((d) => dateKey(d.date!, s.timezone) === dateKey(s.reservation!.start, s.timezone));
      const selectedDay = retained || reservation || available[0] || null;
      const invalidated = !!selectedSlot && !retained;
      context.store.commit({
        calendar: { ...context.store.getSnapshot().calendar, days, monthHasTimeSlots: days.some((d) => !!d.timeSlots?.length), selectedDay, timeSlots: selectedDay?.timeSlots ?? [], loading: false } as CalendarState,
        ...(invalidated ? { selectedTimeSlot: undefined } : {}),
      });
      if (invalidated) context.emit({ type: "time-slot-changed", payload: undefined });
    } catch (cause) {
      if (context.isDisposed() || current !== generation || isBusy()) return;
      const error = cause instanceof CalendarError ? cause : new CalendarError("network", "Loading availability failed", { cause });
      commitCalendar({ loading: false });
      context.store.commit({ error });
      if (context.store.getSnapshot().phase !== "initializing") context.emit({ type: "error", payload: error });
      throw error;
    }
  }
  function dayClicked(day: DeepReadonly<Day>) {
    context.assertActive();
    const s = context.store.getSnapshot();
    if (s.phase === "submitting" || s.phase === "recovery-required") throw new CalendarError("busy", "Calendar is busy");
    if (!day.date) return;
    const selected = s.calendar.days.find((d) => d.date && dateKey(d.date, s.timezone) === dateKey(day.date!, s.timezone));
    if (!selected) return;
    const invalidated = !!s.selectedTimeSlot && (!s.calendar.selectedDay?.date || dateKey(s.calendar.selectedDay.date, s.timezone) !== dateKey(day.date, s.timezone));
    context.store.commit({ calendar: { ...s.calendar, selectedDay: selected, timeSlots: selected.timeSlots ?? [] } as CalendarState, ...(invalidated ? { selectedTimeSlot: undefined } : {}) });
    if (invalidated) context.emit({ type: "time-slot-changed", payload: undefined });
  }
  const move = async (direction: number) => {
    assertEditable();
    if (bound(direction)) return;
    const s = context.store.getSnapshot();
    commitCalendar({ date: addMonths(new Date(s.calendar.date.getTime()), direction, { in: tz(s.timezone) }) });
    await getDays();
  };
  return {
    invalidate,
    getDays,
    actions: { getDays, next: () => move(1), prev: () => move(-1), dayClicked },
    selectors: {
      nextDisabled: () => bound(1),
      prevDisabled: () => bound(-1),
      monthName: () => {
        const s = context.store.getSnapshot();
        return format(new Date(s.calendar.date.getTime()), "LLLL", { ...s.calendar.dfnsConfig, in: tz(s.timezone) });
      },
      currentYear: () => {
        const s = context.store.getSnapshot();
        return format(new Date(s.calendar.date.getTime()), "y", { in: tz(s.timezone) });
      },
      isSelected: (slot: TimeSlot) => sameSlot(context.store.getSnapshot().selectedTimeSlot, slot),
      isSelectedDay: (day: DeepReadonly<Day>) => {
        const s = context.store.getSnapshot();
        return !!day.date && !!s.calendar.selectedDay?.date && dateKey(day.date, s.timezone) === dateKey(s.calendar.selectedDay.date, s.timezone);
      },
      dayHasTimeSlot: (day: DeepReadonly<Day>) => !!day.timeSlots?.length,
    },
  };
}
