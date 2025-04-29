import { ref, computed } from "vue";

export type BillingAddress = {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  crn: string;
  vatId: string;
};

const defaultBillingAddress: BillingAddress = {
  name: "",
  email: "",
  company: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  crn: "",
  vatId: "",
};

const state = ref<Record<string, BillingAddress>>({
  __DEFAULT__: defaultBillingAddress,
});

export default function useBillingAddress(calendarId?: string) {
  const setBillingAddress = (billingAddress: BillingAddress) => {
    if (calendarId === undefined) {
      state.value.__DEFAULT__ = billingAddress;
    } else {
      state.value[calendarId] = billingAddress;
      console.log(state.value[calendarId]);
    }
  };

  const billingAddress = computed(() => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }

    if (state.value[calendarId] === undefined) {
      state.value[calendarId] = defaultBillingAddress;
    }
    return state.value[calendarId];
  });

  function updateBillingAddressField(field: keyof BillingAddress, value: string) {
    if (calendarId === undefined) {
      state.value.__DEFAULT__[field] = value;
    } else {
      state.value[calendarId][field] = value;
    }
  }

  return {
    setBillingAddress,
    billingAddress,
    updateBillingAddressField,
  };
}
