import { ref, computed } from 'vue';

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

const state = ref<Record<string, BillingAddress>>({
  __DEFAULT__: {
    name: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    crn: '',
    vatId: '',
  },
});

export default function useBillingAddress(calendarId?: string) {
  const setBillingAddress = (billingAddress: BillingAddress) => {
    if (calendarId === undefined) {
      state.value.__DEFAULT__ = billingAddress;
    } else {
      state.value[calendarId] = billingAddress;
    }
  };

  const billingAddress = computed(() => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
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
