import type { StripeConfig } from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

const stripeConfigStore = createKeyedStore<StripeConfig | undefined>(undefined);

/** Framework-agnostic accessors (used during initialization). */
export function setStripeConfigValue(
  calendarId: string | undefined,
  stripeConfig: StripeConfig,
): void {
  stripeConfigStore.setValue(calendarId, stripeConfig);
}

export default function useStripeConfig(calendarId?: string): {
  stripeConfig: StripeConfig | undefined;
  setStripeConfig: (stripeConfig: StripeConfig) => void;
} {
  const stripeConfig = useKeyedValue(stripeConfigStore, calendarId);
  const setStripeConfig = (config: StripeConfig) =>
    stripeConfigStore.setValue(calendarId, config);
  return { stripeConfig, setStripeConfig };
}
