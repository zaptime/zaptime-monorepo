import { computed, onMounted, reactive, ref, watch } from 'vue';

import { addMonths, format, isPast, isFuture, differenceInCalendarMonths } from 'date-fns';

import { getDays as getDaysExternal } from '../utils/calendar';
import { getHeaders } from '../utils/localeLogic';
import { getDfnsConfig } from '../utils/dfnsConfig';

import IEvent from '../types/IEvent';
import ICalendarState from '../types/ICalendarState';
import IDay from '../types/IDay';
import useSelectedEvent from '../composables/useSelectedEvent';

import useConfig from '../composables/useConfig';

const date = ref(new Date());

type ICalendarStates = Record<string, ICalendarState>;

const initCalendarState: ICalendarState = {
  date: new Date(),
  days: [],
  events: [],
  monthHasEvents: false,
  eventsLoading: false,
  selectedDay: null,
  loading: true,
  headers: [],
  dfnsConfig: null,
  attendeeState: null,
};

const _state = reactive<ICalendarStates>({
  __DEFAULT__: { ...initCalendarState },
});

export default (calendarId?: string) => {
  if (calendarId !== undefined) {
    if (_state[calendarId] === undefined) {
      _state[calendarId] = { ...initCalendarState };
    }
  }

  const { config } = useConfig(calendarId);
  const { selectedEvent, setSelectedEvent } = useSelectedEvent(calendarId);

  const selectEvent = (event: IEvent) => {
    setSelectedEvent(event);
  };

  const state = computed(() => {
    if (calendarId === undefined) {
      return _state['__DEFAULT__'] as ICalendarState;
    } else {
      return _state[calendarId] as ICalendarState;
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

  const getDays = async (): Promise<void> => {
    setState('eventsLoading', true);
    if (state.value.dfnsConfig !== undefined && state.value.dfnsConfig !== null) {
      const { days, hasAnyEvent } = await getDaysExternal(date.value, state.value.dfnsConfig, config.value);
      setState('monthHasEvents', hasAnyEvent);
      setState('days', days);
      setState('eventsLoading', false);
      setState('loading', false);
    }
  };

  const isSelectedDay = (day: IDay) => {
    return day === state.value.selectedDay;
  };

  const dayClicked = (day: IDay) => {
    //clear selected event when clicking to another day
    // setSelectedEvent(undefined);

    setState('selectedDay', day);

    if (day.events !== undefined) {
      setState('events', day.events);
    }
  };

  const dayHasEvent = (day: IDay): boolean => {
    return day.events !== undefined;
  };

  const isSelected = (event: IEvent): boolean => {
    if (selectedEvent.value === undefined) {
      return false;
    }

    return selectedEvent.value.start === event.start;
  };

  const next = async (): Promise<void> => {
    if (nextDisabled.value) {
      return;
    }

    setState('events', []);
    setState('loading', true);
    date.value = addMonths(date.value, 1);

    await getDays();
    setState('loading', false);
  };

  const prev = async (): Promise<void> => {
    if (prevDisabled.value) {
      return;
    }

    setState('events', []);
    setState('loading', true);
    date.value = addMonths(date.value, -1);
    await getDays();
    setState('loading', false);
  };

  const prevDisabled = computed(() => {
    const now = new Date();

    const newDate = addMonths(date.value, -1);
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

    const newDate = addMonths(date.value, 1);
    const distance = differenceInCalendarMonths(newDate, now);

    if (isFuture(newDate) && config.value.max !== undefined) {
      if (distance > config.value.max) {
        return true;
      }
    }

    return false;
  });

  const currentYear = computed(() => {
    return format(date.value, 'y');
  });

  const monthName = computed(() => {
    return format(date.value, 'LLLL', {
      locale: state.value.dfnsConfig?.locale,
    });
  });

  watch([() => config.value.locale?.preset, () => config.value.closestAvailableEvent, () => config.value.locale?.startDayOfWeek], async () => {
    await setLocales();
    //refetch days with new given locales
    await getDays();
  });

  const setLocales = async () => {
    if (config.value && config.value.locale) {
      state.value.dfnsConfig = await getDfnsConfig(config.value.locale);
      setState('headers', getHeaders(config.value.locale, state.value.dfnsConfig));
    }
  };

  onMounted(async () => {
    if (state.value.days.length === 0) {
      await setLocales();
      await getDays();
    }
  });

  return {
    selectEvent,
    nextDisabled,
    prevDisabled,
    next,
    prev,
    dayClicked,
    dayHasEvent,
    isSelected,
    isSelectedDay,
    currentYear: currentYear,
    monthName: monthName,
    config: config,
    state: state.value,
  };
};
