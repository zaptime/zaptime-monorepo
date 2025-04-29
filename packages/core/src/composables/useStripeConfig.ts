import { StripeConfig } from "../types/InitData";
import { ref, computed } from "vue";

const state = ref<Record<string, StripeConfig | undefined>>({
  __DEFAULT__: undefined,
});

export default function useStripeConfig(calendarId?: string) {
  const setStripeConfig = (stripeConfig: StripeConfig) => {
    if (calendarId === undefined) {
      state.value.__DEFAULT__ = stripeConfig;
    } else {
      state.value[calendarId] = stripeConfig;
    }
  };

  const stripeConfig = computed(() => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }

    return state.value[calendarId];
  });

  return {
    setStripeConfig,
    stripeConfig,
  };
}
