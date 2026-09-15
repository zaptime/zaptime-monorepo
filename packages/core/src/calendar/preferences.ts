import { format, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { CalendarError } from "../api/errors";
import { getDfnsConfig } from "../utils/dfnsConfig";
import { getHeaders } from "../utils/localeLogic";
import type { CalendarContext } from "./lifecycle";
import type { CalendarFormatters, HourCycle } from "./types";
import type CalendarState from "../types/CalendarState";

export function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  } catch {
    throw new CalendarError("invalid-config", "Invalid timezone");
  }
}
export function validateHourCycle(value: HourCycle) {
  if (value !== undefined && !["h11", "h12", "h23", "h24"].includes(value)) throw new CalendarError("invalid-config", "Invalid hour cycle");
}
export function createPreferences(context: CalendarContext) {
  let generation = 0;
  const formatters: CalendarFormatters = {
    async loadDateFnsConfig(locale) {
      context.assertActive();
      const current = ++generation;
      const dfnsConfig = await getDfnsConfig(locale);
      if (context.isDisposed() || current !== generation) return;
      const s = context.store.getSnapshot();
      context.store.commit({ calendar: { ...s.calendar, dfnsConfig, headers: getHeaders(s.config.locale ?? {}, dfnsConfig) } as CalendarState });
    },
    getFormattedTime(value) {
      const s = context.store.getSnapshot();
      return format(parseISO(value), s.hourCycle === "h11" || s.hourCycle === "h12" ? "h:mmaaa" : "H:mm", { ...s.calendar.dfnsConfig, in: tz(s.timezone) });
    },
    getFormattedDay(value) {
      const s = context.store.getSnapshot();
      return format(parseISO(value), "EEEE", { ...s.calendar.dfnsConfig, in: tz(s.timezone) });
    },
    getFormattedDayInMonth(value) {
      const s = context.store.getSnapshot();
      return format(parseISO(value), "PPPP", { ...s.calendar.dfnsConfig, in: tz(s.timezone) });
    },
  };
  return {
    formatters,
    invalidate: () => {
      generation++;
    },
    setHourCycle(value: HourCycle) {
      context.assertActive();
      validateHourCycle(value);
      context.store.commit({ hourCycle: value });
    },
  };
}
