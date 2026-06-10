import { parseISO, format } from "date-fns";
import { tz } from "@date-fns/tz";
import { getDfnsConfig, type DfnsConfig } from "@zaptime/core-shared";
import { createStore, useStoreValue } from "../store/createStore";
import useCurrentTimezone from "./useCurrentTimezone";
import useHourCycle from "./useHourCycle";

// Reactive so components re-render once the locale finishes loading. In
// `@zaptime/core` this is a plain module-level variable; a store is used here
// so React renders pick up the loaded locale.
const dfnsConfigStore = createStore<DfnsConfig | undefined>(undefined);

export async function loadDateFnsConfig(locale: string): Promise<void> {
  dfnsConfigStore.set(await getDfnsConfig(locale));
}

export function useDateFormatters(): {
  getFormattedTime: (date: string) => string;
  getFormattedDay: (date: string) => string;
  getFormattedDayInMonth: (date: string) => string;
  loadDateFnsConfig: (locale: string) => Promise<void>;
} {
  const { timezone } = useCurrentTimezone();
  const { hourCycle } = useHourCycle();
  const dateFnsConfig = useStoreValue(dfnsConfigStore);

  const getFormattedTime = (date: string) => {
    if (hourCycle === "h11") {
      return format(parseISO(date), "h:mmaaa", {
        in: tz(timezone),
        ...dateFnsConfig,
      });
    }
    return format(parseISO(date), "H:mm", {
      in: tz(timezone),
      ...dateFnsConfig,
    });
  };

  // e.g. Thursday
  const getFormattedDay = (date: string) =>
    format(parseISO(date), "EEEE", { ...dateFnsConfig, in: tz(timezone) });

  // e.g. November 21
  const getFormattedDayInMonth = (date: string) =>
    format(parseISO(date), "PPPP", { ...dateFnsConfig, in: tz(timezone) });

  return {
    getFormattedTime,
    getFormattedDay,
    getFormattedDayInMonth,
    loadDateFnsConfig,
  };
}
