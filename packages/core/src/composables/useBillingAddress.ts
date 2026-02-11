import { computed } from "vue";
import {
  createDefaultBillingAddress,
  type BillingAddress,
  useCalendarScope,
} from "../scope/calendarScope";

export type { BillingAddress };

export default function useBillingAddress() {
  const scope = useCalendarScope();

  const setBillingAddress = (billingAddress: BillingAddress) => {
    scope.billingAddress.value = billingAddress;
  };

  const billingAddress = computed(() => {
    return scope.billingAddress.value;
  });

  function updateBillingAddressField(
    field: keyof BillingAddress,
    value: string,
  ) {
    if (scope.billingAddress.value === undefined) {
      scope.billingAddress.value = createDefaultBillingAddress();
    }

    scope.billingAddress.value[field] = value;
  }

  return {
    setBillingAddress,
    billingAddress,
    updateBillingAddressField,
  };
}
