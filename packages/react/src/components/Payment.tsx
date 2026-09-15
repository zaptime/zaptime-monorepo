import { useEffect, useId, useRef, useState } from "react";
import { createStripePaymentDriver, type StripePaymentDriver } from "@zaptime/browser";
import { useConfig, useStripeConfig } from "@zaptime/react-headless";
import type { PaymentDriver } from "@zaptime/core";
import { BillingAddress } from "./BillingAddress.js";
import { calendarMessages } from "../generated/messages.js";
export interface PaymentBinding {
  driver?: StripePaymentDriver;
  proxy: PaymentDriver;
}
export function Payment({ binding, onReady }: { binding: PaymentBinding; onReady: (ready: boolean) => void }) {
  const { stripeConfig } = useStripeConfig(),
    { config } = useConfig(),
    number = useRef<HTMLDivElement>(null),
    expiry = useRef<HTMLDivElement>(null),
    cvc = useRef<HTMLDivElement>(null),
    owner = useRef<{ driver: StripePaymentDriver; leases: number; key: string } | undefined>(undefined),
    [error, setError] = useState(false),
    id = useId(),
    m = calendarMessages(config.locale?.preset);
  const key = config.stripePublishableKey || import.meta.env?.VITE_STRIPE_CLIENT_KEY || "";
  const account = stripeConfig?.stripeAccountId;
  useEffect(() => {
    if (!number.current || !expiry.current || !cvc.current) return;
    const identity = `${key}:${account ?? ""}`;
    let current = owner.current;
    if (!current || current.key !== identity) {
      if (current) void current.driver.dispose();
      current = {
        driver: createStripePaymentDriver({
          publishableKey: key,
          accountId: account,
          elements: { cardNumber: number.current, cardExpiry: expiry.current, cardCvc: cvc.current },
          style: {
            base: {
              color: config.theme?.mode === "dark" ? (config.theme.colors?.[100] ?? "#f1f5f9") : (config.theme?.colors?.[900] ?? "#020617"),
              fontWeight: 600,
              fontFamily: '"Basier Circle", system-ui, sans-serif',
              fontSize: "14px",
              "::placeholder": { color: config.theme?.colors?.[400] ?? "#64748b" },
            },
            invalid: { color: "#E25950" },
          },
        }),
        leases: 0,
        key: identity,
      };
      owner.current = current;
    }
    current.leases++;
    binding.driver = current.driver;
    setError(false);
    onReady(false);
    let active = true;
    void current.driver.mount().then(
      () => {
        if (active) onReady(true);
      },
      () => {
        if (active) {
          setError(true);
          onReady(false);
        }
      },
    );
    return () => {
      active = false;
      current.leases--;
      queueMicrotask(() => {
        if (current.leases === 0) {
          if (binding.driver === current.driver) binding.driver = undefined;
          void current.driver.dispose();
          if (owner.current === current) owner.current = undefined;
        }
      });
    };
  }, [binding, key, account, onReady]);
  if (!stripeConfig) return null;
  const p = config.locale?.confirmationForm?.payments;
  return (
    <section className="cal-mt-6" aria-label={p?.price ?? "Payment"}>
      <p className="cal-font-semibold">{p?.price ?? "Price"}</p>
      <p className="cal-text-xl">{new Intl.NumberFormat(config.locale?.preset, { style: "currency", currency: stripeConfig.currency }).format(stripeConfig.price / 100)}</p>
      <BillingAddress />
      <div className="cal-mt-6">
        <label id={`${id}-number`}>{p?.cardNumber ?? "Card number"}</label>
        <div ref={number} role="group" aria-labelledby={`${id}-number`} className="cal-ui-input cal-mt-2 cal-min-h-[50px]" />
      </div>
      <div className="cal-mt-3 cal-grid cal-grid-cols-2 cal-gap-3">
        <div>
          <label id={`${id}-expiry`}>{m.cardExpiry}</label>
          <div ref={expiry} role="group" aria-labelledby={`${id}-expiry`} className="cal-ui-input cal-mt-2 cal-min-h-[50px]" />
        </div>
        <div>
          <label id={`${id}-cvc`}>{m.cardCvc}</label>
          <div ref={cvc} role="group" aria-labelledby={`${id}-cvc`} className="cal-ui-input cal-mt-2 cal-min-h-[50px]" />
        </div>
      </div>
      {error && (
        <p role="alert" className="cal-mt-4 cal-text-red-600">
          {m.gatewayFailed}
        </p>
      )}
    </section>
  );
}
