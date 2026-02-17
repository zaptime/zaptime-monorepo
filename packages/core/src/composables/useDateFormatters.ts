import { parseISO, format } from "date-fns";
import useCurrentTimezone from "./useCurrentTimezone";
import useHourCycle from "./useHourCycle";
import { tz } from "@date-fns/tz";
import { getDfnsConfig } from "../utils/dfnsConfig";
import { useCalendarScope } from "../scope/calendarScope";

export const useDateFormatters = () => {
  const { timezone } = useCurrentTimezone();
  const { hourCycle } = useHourCycle();
  const scope = useCalendarScope();

  async function loadDateFnsConfig(locale: string) {
    scope.dateFnsConfig.value = await getDfnsConfig(locale);
  }

  const getFormattedTime = (date: string) => {
    if (hourCycle.value === "h11") {
      return format(parseISO(date), "h:mmaaa", {
        in: tz(timezone.value),
        ...scope.dateFnsConfig.value,
      });
    } else {
      return format(parseISO(date), "H:mm", {
        in: tz(timezone.value),
        ...scope.dateFnsConfig.value,
      });
    }
  };

  //e.g. Thursday
  const getFormattedDay = (date: string) => {
    return format(parseISO(date), "EEEE", {
      ...scope.dateFnsConfig.value,
      in: tz(timezone.value),
    });
  };

  //e. g. November 21
  const getFormattedDayInMonth = (date: string) => {
    return format(parseISO(date), "PPPP", {
      ...scope.dateFnsConfig.value,
      in: tz(timezone.value),
    });
  };

  return {
    getFormattedTime,
    getFormattedDay,
    getFormattedDayInMonth,
    loadDateFnsConfig,
  };
};
