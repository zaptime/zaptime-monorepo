import {
  clientOriginalTimezone,
  useCalendarScope,
} from "../scope/calendarScope";

export default function useCurrentTimezone() {
  const { timezone } = useCalendarScope();

  const setTimezone = (tz: string) => {
    timezone.value = tz;
  };

  return {
    clientOriginalTimezone,
    timezone,
    setTimezone,
  };
}
