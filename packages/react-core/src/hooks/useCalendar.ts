import {
  addMonths,
  format,
  isPast,
  isFuture,
  differenceInCalendarMonths,
} from "date-fns";
import {
  getDays as getDaysExternal,
  getHeaders,
  getDfnsConfig,
  type CalendarState,
  type Day,
  type TimeSlot,
  type ZaptimeConfig,
} from "@zaptime/core-shared";
import { createStore, useStoreValue } from "../store/createStore";
import { keyOf } from "../store/keyedStore";
import useConfig, { getConfigValue } from "./useConfig";
import { getTimezoneValue } from "./useCurrentTimezone";
import useSelectedTimeSlot, {
  setSelectedTimeSlotValue,
} from "./useSelectedTimeSlot";

function makeInitialState(): CalendarState {
  return {
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
}

// Stable fallback returned for not-yet-initialized calendars so that the
// `useSyncExternalStore` snapshot stays referentially stable.
const SHARED_INITIAL_STATE: CalendarState = makeInitialState();

const calendarStore = createStore<Record<string, CalendarState>>({
  [keyOf()]: SHARED_INITIAL_STATE,
});

function getState(calendarId?: string): CalendarState {
  return calendarStore.get()[keyOf(calendarId)] ?? SHARED_INITIAL_STATE;
}

function patchState(
  calendarId: string | undefined,
  patch: Partial<CalendarState>,
): void {
  calendarStore.set((prev) => {
    const key = keyOf(calendarId);
    const current = prev[key] ?? makeInitialState();
    return { ...prev, [key]: { ...current, ...patch } };
  });
}

function getFirstAvailableDayWithTimeSlot(days: Day[]): Day | undefined {
  for (const day of days) {
    if (day.timeSlots !== undefined && day.timeSlots.length > 0 && !day.isPast) {
      return day;
    }
  }
  return undefined;
}

async function getDays(calendarId?: string): Promise<void> {
  const { date, dfnsConfig } = getState(calendarId);
  const config = getConfigValue(calendarId);
  const timezone = getTimezoneValue();

  // Clear timeSlots and selected day
  patchState(calendarId, { loading: true, timeSlots: [], selectedDay: null });

  if (dfnsConfig !== undefined && dfnsConfig !== null) {
    const { days, hasAnyTimeSlot } = await getDaysExternal(
      date,
      dfnsConfig,
      config,
      timezone,
    );

    const patch: Partial<CalendarState> = {
      monthHasTimeSlots: hasAnyTimeSlot,
      days,
      loading: false,
    };

    if (hasAnyTimeSlot) {
      const firstAvailableDayWithTimeSlot =
        getFirstAvailableDayWithTimeSlot(days);
      if (firstAvailableDayWithTimeSlot !== undefined) {
        patch.selectedDay = firstAvailableDayWithTimeSlot;
        if (firstAvailableDayWithTimeSlot.timeSlots !== undefined) {
          patch.timeSlots = firstAvailableDayWithTimeSlot.timeSlots;
        }
      }
    }

    patchState(calendarId, patch);
  }
}

function nextDisabled(calendarId?: string): boolean {
  const config = getConfigValue(calendarId);
  const newDate = addMonths(getState(calendarId).date, 1);
  const distance = differenceInCalendarMonths(newDate, new Date());
  if (isFuture(newDate) && config.max !== undefined) {
    return distance > config.max;
  }
  return false;
}

function prevDisabled(calendarId?: string): boolean {
  const config = getConfigValue(calendarId);
  const newDate = addMonths(getState(calendarId).date, -1);
  const distance = differenceInCalendarMonths(new Date(), newDate);
  if (isPast(newDate) && config.min !== undefined) {
    return distance > config.min;
  }
  return false;
}

async function next(calendarId?: string): Promise<void> {
  if (nextDisabled(calendarId)) return;
  patchState(calendarId, {
    timeSlots: [],
    loading: true,
    date: addMonths(getState(calendarId).date, 1),
  });
  await getDays(calendarId);
  patchState(calendarId, { loading: false });
}

async function prev(calendarId?: string): Promise<void> {
  if (prevDisabled(calendarId)) return;
  patchState(calendarId, {
    timeSlots: [],
    loading: true,
    date: addMonths(getState(calendarId).date, -1),
  });
  await getDays(calendarId);
  patchState(calendarId, { loading: false });
}

function dayClicked(calendarId: string | undefined, day: Day): void {
  // clear selected time slot when clicking to another day
  const patch: Partial<CalendarState> = { selectedDay: day };
  if (day.timeSlots !== undefined) {
    patch.timeSlots = day.timeSlots;
  }
  patchState(calendarId, patch);
}

async function setLocales(calendarId?: string): Promise<void> {
  const config = getConfigValue(calendarId);
  if (config && config.locale) {
    const dfnsConfig = await getDfnsConfig(config.locale.preset || "en");
    patchState(calendarId, {
      dfnsConfig,
      headers: getHeaders(config.locale, dfnsConfig),
    });
  }
}

function clearState(calendarId?: string): void {
  patchState(calendarId, makeInitialState());
}

async function init(calendarId?: string): Promise<void> {
  clearState(calendarId);
  if (getState(calendarId).days.length === 0) {
    await setLocales(calendarId);
    await getDays(calendarId);

    // If no time slots are available, move to the next month
    if (getState(calendarId).timeSlots.length <= 0) {
      await next(calendarId);
    }

    patchState(calendarId, { initLoaded: true });
  }
}

export default function useCalendar(calendarId?: string): {
  getDays: () => Promise<void>;
  init: () => Promise<void>;
  selectTimeSlot: (timeSlot: TimeSlot) => void;
  nextDisabled: boolean;
  prevDisabled: boolean;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  dayClicked: (day: Day) => void;
  dayHasTimeSlot: (day: Day) => boolean;
  isSelected: (timeSlot: TimeSlot) => boolean;
  isSelectedDay: (day: Day) => boolean;
  currentYear: string;
  monthName: string;
  config: ZaptimeConfig;
  state: CalendarState;
} {
  const state = useStoreValue(
    calendarStore,
    (all) => all[keyOf(calendarId)] ?? SHARED_INITIAL_STATE,
  );
  const { config } = useConfig(calendarId);
  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);

  const currentYear = format(state.date, "y");
  const monthName = format(state.date, "LLLL", {
    locale: state.dfnsConfig?.locale,
  });

  const isSelected = (timeSlot: TimeSlot): boolean =>
    selectedTimeSlot !== undefined && selectedTimeSlot.start === timeSlot.start;

  const isSelectedDay = (day: Day): boolean => day === state.selectedDay;

  return {
    getDays: () => getDays(calendarId),
    init: () => init(calendarId),
    selectTimeSlot: (timeSlot: TimeSlot) =>
      setSelectedTimeSlotValue(calendarId, timeSlot),
    nextDisabled: nextDisabled(calendarId),
    prevDisabled: prevDisabled(calendarId),
    next: () => next(calendarId),
    prev: () => prev(calendarId),
    dayClicked: (day: Day) => dayClicked(calendarId, day),
    dayHasTimeSlot: (day: Day) => day.timeSlots !== undefined,
    isSelected,
    isSelectedDay,
    currentYear,
    monthName,
    config,
    state,
  };
}
