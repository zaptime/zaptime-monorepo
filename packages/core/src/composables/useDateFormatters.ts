import { parseISO } from 'date-fns';
import useCurrentTimezone from './useCurrentTimezone';
import useHourCycle from './useHourCycle';
import { format, utcToZonedTime } from 'date-fns-tz';
import { getDfnsConfig } from '../utils/dfnsConfig';
let dateFnsConfig: any = undefined;

export const useDateFormatters = () => {
  const { timezone } = useCurrentTimezone();
  const { hourCycle } = useHourCycle();

  async function loadDateFnsConfig(locale: string) {
    dateFnsConfig = await getDfnsConfig(locale);
  }

  const getFormattedTime = (date: string) => {
    if (hourCycle.value === 'h11') {
      return format(utcToZonedTime(parseISO(date), timezone.value), 'h:mmaaa', dateFnsConfig);
    } else {
      return format(utcToZonedTime(parseISO(date), timezone.value), 'H:mm', dateFnsConfig);
    }
  };

  //e.g. Thursday
  const getFormattedDay = (date: string) => {
    return format(utcToZonedTime(parseISO(date), timezone.value), 'EEEE', { ...dateFnsConfig, timeZone: timezone.value });
  };

  //e. g. November 21
  const getFormattedDayInMonth = (date: string) => {
    return format(utcToZonedTime(parseISO(date), timezone.value), 'PPPP', { ...dateFnsConfig, timeZone: timezone.value });
  };

  return {
    getFormattedTime,
    getFormattedDay,
    getFormattedDayInMonth,
    loadDateFnsConfig,
  };
};
