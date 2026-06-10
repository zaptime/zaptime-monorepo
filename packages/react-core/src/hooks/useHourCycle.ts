import { createStore, useStoreValue } from "../store/createStore";

type HourCycles = "h23" | "h11" | "h12" | "h24" | undefined;

let clientOriginalHourCycle: HourCycles = "h23";

if (typeof window !== "undefined") {
  clientOriginalHourCycle = Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
  }).resolvedOptions().hourCycle as HourCycles;
}

const hourCycleStore = createStore<HourCycles>(clientOriginalHourCycle);

/** Framework-agnostic accessor (used by date formatters). */
export function getHourCycleValue(): HourCycles {
  return hourCycleStore.get();
}

export default function useHourCycle(): {
  clientOriginalHourCycle: HourCycles;
  setHourCycle: (hourCycle: "h11" | "h23") => void;
  hourCycle: HourCycles;
} {
  const hourCycle = useStoreValue(hourCycleStore);
  const setHourCycle = (hc: "h11" | "h23") => hourCycleStore.set(hc);
  return { clientOriginalHourCycle, setHourCycle, hourCycle };
}
