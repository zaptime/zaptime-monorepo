import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

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

const billingAddressStore =
  createKeyedStore<BillingAddress>(defaultBillingAddress);

/** Framework-agnostic accessor (used by the imperative API / payment layer). */
export function getBillingAddressValue(calendarId?: string): BillingAddress {
  return billingAddressStore.getValue(calendarId);
}

export default function useBillingAddress(calendarId?: string): {
  billingAddress: BillingAddress;
  setBillingAddress: (billingAddress: BillingAddress) => void;
  updateBillingAddressField: (
    field: keyof BillingAddress,
    value: string,
  ) => void;
} {
  const billingAddress = useKeyedValue(billingAddressStore, calendarId);

  const setBillingAddress = (next: BillingAddress) =>
    billingAddressStore.setValue(calendarId, next);

  const updateBillingAddressField = (
    field: keyof BillingAddress,
    value: string,
  ) =>
    billingAddressStore.updateValue(calendarId, (prev) => ({
      ...prev,
      [field]: value,
    }));

  return { billingAddress, setBillingAddress, updateBillingAddressField };
}
