import { StripeConfig } from '../types/InitData';
import { ref, Ref, computed } from 'vue';

type StripeConfigState = Ref<StripeConfig> | Record<string, Ref<StripeConfig>>;
let stripeConfigState: StripeConfigState = {};

export default function useStripeConfig(calendarId?: string) {
  const setStripeConfig = (stripeConfig: StripeConfig) => {
    if (calendarId === undefined) {
      stripeConfigState.value = stripeConfig;
    } else {
      stripeConfigState = {
        calendarId: ref(stripeConfig),
      };
    }
  };

  const stripeConfig = computed(() => {
    if (calendarId === undefined) {
      return stripeConfigState.value as StripeConfig;
    }

    return stripeConfigState[calendarId as keyof StripeConfigState] as StripeConfig;
  });

  return {
    setStripeConfig,
    stripeConfig,
  };
}
