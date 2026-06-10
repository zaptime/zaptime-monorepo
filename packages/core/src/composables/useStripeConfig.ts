import type { StripeConfig } from "@zaptime/core-shared";
import { ref, computed, type ComputedRef } from "vue";

const state = ref<Record<string, StripeConfig | undefined>>({
  __DEFAULT__: undefined,
});

export default function useStripeConfig(calendarId?: string): {
  setStripeConfig: (stripeConfig: StripeConfig) => void;
  stripeConfig: ComputedRef<StripeConfig | undefined>;
} {
  const setStripeConfig = (stripeConfig: StripeConfig) => {
    if (calendarId === undefined) {
      state.value.__DEFAULT__ = stripeConfig;
    } else {
      state.value[calendarId] = stripeConfig;
    }
  };

  const stripeConfig: ComputedRef<StripeConfig | undefined> = computed(() => {
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
