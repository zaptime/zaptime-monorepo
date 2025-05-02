import { parseISO, format } from "date-fns";
import useCurrentTimezone from "./useCurrentTimezone";
import useHourCycle from "./useHourCycle";
import { tz } from "@date-fns/tz";
import { getDfnsConfig } from "../utils/dfnsConfig";
let dateFnsConfig: any = undefined;

export const useDateFormatters = () => {
  const { timezone } = useCurrentTimezone();
  const { hourCycle } = useHourCycle();

  async function loadDateFnsConfig(locale: string) {
    dateFnsConfig = await getDfnsConfig(locale);
  }

  const getFormattedTime = (date: string) => {
    if (hourCycle.value === "h11") {
      return format(parseISO(date), "h:mmaaa", {
        in: tz(timezone.value),
        ...dateFnsConfig,
      });
    } else {
      return format(parseISO(date), "H:mm", {
        in: tz(timezone.value),
        ...dateFnsConfig,
      });
    }
  };

  //e.g. Thursday
  const getFormattedDay = (date: string) => {
    return format(parseISO(date), "EEEE", {
      ...dateFnsConfig,
      in: tz(timezone.value),
    });
  };

  //e. g. November 21
  const getFormattedDayInMonth = (date: string) => {
    return format(parseISO(date), "PPPP", {
      ...dateFnsConfig,
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
