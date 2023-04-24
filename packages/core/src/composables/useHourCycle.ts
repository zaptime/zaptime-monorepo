import { ref } from 'vue';

const clientOriginalHourCycle = Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle;

type HourCycles = typeof clientOriginalHourCycle;

const hourCycle = ref<HourCycles>(clientOriginalHourCycle);

export default function useHourCycle() {
  const setHourCycle = (hc: 'h11' | 'h23') => {
    hourCycle.value = hc;
  };

  return {
    clientOriginalHourCycle,
    setHourCycle,
    hourCycle,
  };
}
