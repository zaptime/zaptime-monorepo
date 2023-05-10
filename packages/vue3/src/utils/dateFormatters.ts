import { parseISO } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';
import { useCalendar, useCurrentTimezone, useHourCycle } from '@zaptime/core';
import { format, utcToZonedTime } from 'date-fns-tz';

export const useFormatters = (calendarId?: string) => {
  const { config } = useCalendar(calendarId);
  const { timezone } = useCurrentTimezone();
  const { hourCycle } = useHourCycle();

  const getFormattedTime = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === 'cs') {
      locale = cs;
    }

    if (hourCycle.value === 'h11') {
      return format(utcToZonedTime(parseISO(date), timezone.value), 'K:mmaaa', { locale: locale });
    } else {
      return format(utcToZonedTime(parseISO(date), timezone.value), 'H:mm', { locale: locale });
    }
  };

  //e.g. Thursday
  const getFormattedDay = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === 'cs') {
      locale = cs;
    }
    return format(utcToZonedTime(parseISO(date), timezone.value), 'EEEE', { locale: locale, timeZone: timezone.value });
  };

  //e. g. November 21
  const getFormattedDayInMonth = (date: string) => {
    let locale = enUS;

    if (config.value.locale?.preset === 'cs') {
      locale = cs;
    }
    return format(utcToZonedTime(parseISO(date), timezone.value), 'MMM d', { locale: locale, timeZone: timezone.value });
  };

  return {
    getFormattedTime,
    getFormattedDay,
    getFormattedDayInMonth,
  };
};
