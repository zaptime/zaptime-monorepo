"use client";
import { ZaptimeCalendar } from "@zaptime/react";
import { createStripePaymentDriver, attachBrowserEffects } from "@zaptime/browser";
import { ZaptimeProvider, useCalendarInstance, useCalendar, useBillingAddress } from "@zaptime/react-headless";
import "@zaptime/react/style.css";
export const browserIntegrations = { createStripePaymentDriver, attachBrowserEffects };
export function Custom() {
  const instance = useCalendarInstance({ config: { token: "fixture-token" } });
  const { state, next } = useCalendar(instance);
  const { billingAddress, updateBillingAddressField } = useBillingAddress(instance);
  return (
    <ZaptimeProvider calendar={instance}>
      <button disabled={state.loading} onClick={() => void next()}>
        Next month
      </button>
      <input value={billingAddress.email} onChange={(event) => updateBillingAddressField("email", event.target.value)} />
    </ZaptimeProvider>
  );
}
export function Complete() {
  return <ZaptimeCalendar config={{ token: "fixture-token" }} onCalendarLoaded={() => {}} />;
}
