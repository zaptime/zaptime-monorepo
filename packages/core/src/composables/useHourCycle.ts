import { ref } from "vue";

type HourCycles = "h23" | "h11" | "h12" | "h24" | undefined;
let clientOriginalHourCycle: HourCycles = "h23";

if (typeof window !== "undefined") {
  clientOriginalHourCycle = Intl.DateTimeFormat(navigator.language, { hour: "numeric" }).resolvedOptions().hourCycle;
}

const hourCycle = ref<HourCycles>(clientOriginalHourCycle);

export default function useHourCycle() {
  const setHourCycle = (hc: "h11" | "h23") => {
    hourCycle.value = hc;
  };

  return {
    clientOriginalHourCycle,
    setHourCycle,
    hourCycle,
  };
}
