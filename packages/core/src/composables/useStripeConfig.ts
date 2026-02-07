import { StripeConfig } from "../types/InitData";
import { computed } from "vue";
import { useCalendarScope } from "../scope/calendarScope";

export default function useStripeConfig() {
  const scope = useCalendarScope();

  const setStripeConfig = (stripeConfig: StripeConfig) => {
    scope.stripeConfig.value = stripeConfig;
  };

  const stripeConfig = computed(() => {
    return scope.stripeConfig.value;
  });

  return {
    setStripeConfig,
    stripeConfig,
  };
}
