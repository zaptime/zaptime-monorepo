import { format, parseISO } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import { useCalendar } from "@zaptime/core";

export const useFormatters = (calendarId?: string) => {
  const { config } = useCalendar(calendarId);

  const getFormattedTime = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === "cs") {
      locale = cs;
    }
    return format(parseISO(date), "kk:mm", { locale: locale });
  };

  //e.g. Thursday
  const getFormattedDay = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === "cs") {
      locale = cs;
    }
    return format(parseISO(date), "EEEE", { locale: locale });
  };

  //e. g. November 21
  const getFormattedDayInMonth = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === "cs") {
      locale = cs;
    }
    return format(parseISO(date), "d. MMMM", { locale: locale });
  };

  return {
    getFormattedTime,
    getFormattedDay,
    getFormattedDayInMonth,
  };
};
