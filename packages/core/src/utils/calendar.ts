import Day from '../types/Day';
import TimeSlot from '../types/TimeSlot';
import ZaptimeConfig from '../types/ZaptimeConfig';
import type DfnsConfig from '../types/DfnsConfig';

import { getDaysInMonth, startOfMonth, subMonths, lastDayOfMonth, subDays, endOfMonth, addDays, isPast, isToday, isThisMonth } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

import { getAvailableTimeSlots } from '../api/api';
import { getStartOfTheWeekIndex } from '../utils/localeLogic';

export const getTimeSlotsForDivenDate = (date: Date, timeSlots: TimeSlot[], timeZone: string): TimeSlot[] | undefined => {
  const collectedTimeSlots: TimeSlot[] = [];
  for (const timeSlot of timeSlots) {
    if (format(utcToZonedTime(date, timeZone), 'd', { timeZone: timeZone }) === format(utcToZonedTime(new Date(timeSlot.start), timeZone), 'd', { timeZone: timeZone })) {
      collectedTimeSlots.push(timeSlot);
    }
  }

  if (collectedTimeSlots.length > 0) {
    return collectedTimeSlots;
  }

  return undefined;
};

export const getDays = async (date: Date, dfnsConfig: DfnsConfig, zapTimeConfig: ZaptimeConfig, timezone: string): Promise<{ days: Day[]; hasAnyTimeSlot: boolean }> => {
  const dayCountInMonth = getDaysInMonth(date);
  const startDateOfTheMonth = startOfMonth(date);
  let hasAnyTimeSlot = false;

  const timeSlots = await getAvailableTimeSlots(zapTimeConfig.token, getStartDate(date, zapTimeConfig, timezone), format(endOfMonth(date), 'yyyy-MM-dd', { timeZone: timezone }), zapTimeConfig.apiBaseUrl);

  if (Object.keys(timeSlots).length > 0) {
    hasAnyTimeSlot = true;
  }

  const startOfTheWeekIndex = zapTimeConfig && zapTimeConfig.locale !== undefined ? getStartOfTheWeekIndex(zapTimeConfig.locale) : 0;

  const numberOfDay = parseInt(format(startDateOfTheMonth, 'i', { ...dfnsConfig, timeZone: timezone })) - startOfTheWeekIndex + 1;

  const previousMonth = subMonths(startDateOfTheMonth, 1);

  const lastDateOfPreviousMonth = lastDayOfMonth(previousMonth);

  const days: Day[] = [];

  for (let k = 1; k < numberOfDay; k++) {
    days.unshift({
      label: format(subDays(lastDateOfPreviousMonth, k - 1), 'd', { timeZone: timezone }),
      isPast: true,
    });
  }

  for (let i = 1; i <= dayCountInMonth; i++) {
    const iteratedDate = addDays(startDateOfTheMonth, i - 1);
    days.push({
      label: i.toString(),
      date: iteratedDate,
      isPast: isPast(iteratedDate) && !isToday(iteratedDate),
      // TODO: isCurrentMonth possibly unnecessary seems like it's always true
      isCurrentMonth: true,
      isToday: isToday(iteratedDate),
      timeSlots: getTimeSlotsForDivenDate(iteratedDate, timeSlots, timezone),
    });
  }

  let nextMonthRemainingDays = 0;

  if (days.length <= 35) {
    nextMonthRemainingDays = 35 - dayCountInMonth - numberOfDay + 1 + startOfTheWeekIndex;
  } else {
    nextMonthRemainingDays = 42 - dayCountInMonth - numberOfDay + 1 + startOfTheWeekIndex;
  }

  for (let j = 1; j <= nextMonthRemainingDays - startOfTheWeekIndex; j++) {
    days.push({
      label: j.toString(),
      timeSlots: undefined,
      isPast: true,
    });
  }

  return { days, hasAnyTimeSlot };
};

const getStartDate = (date: Date, zapTimeConfig: ZaptimeConfig, timezone: string): string => {
  if (isThisMonth(date) && zapTimeConfig.closestBookableDay !== undefined) {
    return format(addDays(date, zapTimeConfig.closestBookableDay), 'yyyy-MM-dd', { timeZone: timezone });
  }

  return format(startOfMonth(date), 'yyyy-MM-dd', { timeZone: timezone });
};
