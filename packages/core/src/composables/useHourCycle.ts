import {
  clientOriginalHourCycle,
  useCalendarScope,
} from "../scope/calendarScope";

export default function useHourCycle() {
  const { hourCycle } = useCalendarScope();

  const setHourCycle = (hc: "h11" | "h23") => {
    hourCycle.value = hc;
  };

  return {
    clientOriginalHourCycle,
    setHourCycle,
    hourCycle,
  };
}
