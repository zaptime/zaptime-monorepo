import { computed, reactive, ref, watch } from 'vue';

import { addMonths, format, isPast, isFuture, differenceInCalendarMonths } from 'date-fns';

import { getDays as getDaysExternal } from '../utils/calendar';
import { getHeaders } from '../utils/localeLogic';
import { getDfnsConfig } from '../utils/dfnsConfig';

import TimeSlot from '../types/TimeSlot';
import CalendarState from '../types/CalendarState';
import Day from '../types/Day';
import useSelectedTimeSlot from './useSelectedTimeSlot';

import useConfig from '../composables/useConfig';
import useCurrentTimezone from './useCurrentTimezone';

type CalendarStates = Record<string, CalendarState>;

const initCalendarState: CalendarState = {
  date: new Date(),
  days: [],
  timeSlots: [],
  monthHasTimeSlots: false,
  selectedDay: null,
  loading: true,
  headers: [],
  dfnsConfig: undefined,
  attendeeState: undefined,
  initLoaded: false,
};

const _state = reactive<CalendarStates>({
  __DEFAULT__: { ...initCalendarState },
});

export default (calendarId?: string) => {
  if (calendarId !== undefined) {
    if (_state[calendarId] === undefined) {
      _state[calendarId] = { ...initCalendarState };
    }
  }

  const { config } = useConfig(calendarId);
  const { selectedTimeSlot, setSelectedTimeSlot } = useSelectedTimeSlot(calendarId);
  const { timezone } = useCurrentTimezone();

  const selectTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const state = computed(() => {
    if (calendarId === undefined) {
      return _state['__DEFAULT__'] as CalendarState;
    } else {
      return _state[calendarId] as CalendarState;
    }
  });

  const setState = (key: string, value: unknown) => {
    if (calendarId === undefined) {
      //@ts-expect-error TODO: fix type
      _state['__DEFAULT__'][key] = value;
    } else {
      //@ts-expect-error TODO: fix type
      _state[calendarId][key] = value;
    }
  };

  const clearState = () => {
    if (calendarId === undefined) {
      _state['__DEFAULT__'] = { ...initCalendarState };
    } else {
      _state[calendarId] = { ...initCalendarState };
    }
  };

  function getFirstAvailableDayWithTimeSlot(days: Day[]): Day | undefined {
    for (const day of days) {
      if (day.timeSlots !== undefined && day.timeSlots.length > 0 && !day.isPast) {
        return day;
      }
    }
  }

  const getDays = async (): Promise<void> => {
    setState('loading', true);

    // Clear timeSlots and selected day
    setState('timeSlots', []);
    setState('selectedDay', null);

    if (state.value.dfnsConfig !== undefined && state.value.dfnsConfig !== null) {
      const { days, hasAnyTimeSlot } = await getDaysExternal(state.value.date, state.value.dfnsConfig, config.value, timezone.value);

      if (hasAnyTimeSlot) {
        const firstAvailableDayWithTimeSlot = getFirstAvailableDayWithTimeSlot(days);

        if (firstAvailableDayWithTimeSlot !== undefined) {
          setState('selectedDay', firstAvailableDayWithTimeSlot);

          if (firstAvailableDayWithTimeSlot.timeSlots !== undefined) {
            setState('timeSlots', firstAvailableDayWithTimeSlot.timeSlots);
          }
        }
      }

      setState('monthHasTimeSlots', hasAnyTimeSlot);
      setState('days', days);
      setState('loading', false);
    }
  };

  const isSelectedDay = (day: Day) => {
    return day === state.value.selectedDay;
  };

  const dayClicked = (day: Day) => {
    //clear selected time slot when clicking to another day
    setState('selectedDay', day);

    if (day.timeSlots !== undefined) {
      setState('timeSlots', day.timeSlots);
    }
  };

  const dayHasTimeSlot = (day: Day): boolean => {
    return day.timeSlots !== undefined;
  };

  const isSelected = (timeSlot: TimeSlot): boolean => {
    if (selectedTimeSlot.value === undefined) {
      return false;
    }

    return selectedTimeSlot.value.start === timeSlot.start;
  };

  const next = async (): Promise<void> => {
    if (nextDisabled.value) {
      return;
    }

    setState('timeSlots', []);
    setState('loading', true);
    setState('date', addMonths(state.value.date, 1));

    await getDays();
    setState('loading', false);
  };

  const prev = async (): Promise<void> => {
    if (prevDisabled.value) {
      return;
    }

    setState('timeSlots', []);
    setState('loading', true);
    setState('date', addMonths(state.value.date, -1));
    await getDays();
    setState('loading', false);
  };

  const prevDisabled = computed(() => {
    const now = new Date();

    const newDate = addMonths(state.value.date, -1);
    const distance = differenceInCalendarMonths(now, newDate);

    if (isPast(newDate) && config.value.min !== undefined) {
      if (distance > config.value.min) {
        return true;
      }
    }

    return false;
  });

  const nextDisabled = computed(() => {
    const now = new Date();

    const newDate = addMonths(state.value.date, 1);
    const distance = differenceInCalendarMonths(newDate, now);

    if (isFuture(newDate) && config.value.max !== undefined) {
      if (distance > config.value.max) {
        return true;
      }
    }

    return false;
  });

  const currentYear = computed(() => {
    return format(state.value.date, 'y');
  });

  const monthName = computed(() => {
    return format(state.value.date, 'LLLL', {
      locale: state.value.dfnsConfig?.locale,
    });
  });

  watch([() => config.value.locale?.preset, () => config.value.closestBookableDay, () => config.value.locale?.startDayOfWeek], async () => {
    if (state.value.initLoaded) {
      await setLocales();
      //refetch days with new given locales
      await getDays();
    }
  });

  const setLocales = async () => {
    if (config.value && config.value.locale) {
      state.value.dfnsConfig = await getDfnsConfig(config.value.locale.preset || 'en');
      setState('headers', getHeaders(config.value.locale, state.value.dfnsConfig));
    }
  };

  const init = async () => {
    clearState();
    if (state.value.days.length === 0) {
      await setLocales();
      await getDays();
      setState('initLoaded', true);
    }
  };

  return {
    getDays,
    init,
    selectTimeSlot,
    nextDisabled,
    prevDisabled,
    next,
    prev,
    dayClicked,
    dayHasTimeSlot,
    isSelected,
    isSelectedDay,
    currentYear: currentYear,
    monthName: monthName,
    config: config,
    state: state.value,
  };
};
