import { CalendarError } from "@zaptime/core";
import type { PaymentDriver, PaymentOutcome } from "@zaptime/core";
import type { Stripe, StripeCardNumberElement, StripeElement, StripeElementStyle } from "@stripe/stripe-js";

export interface StripePaymentDriverOptions {
  publishableKey: string;
  accountId?: string;
  elements: { cardNumber: HTMLElement; cardExpiry: HTMLElement; cardCvc: HTMLElement };
  style?: StripeElementStyle;
}
export interface StripePaymentDriver extends PaymentDriver {
  /** Call after the three host elements connect, before the user enters card details. */
  mount(): Promise<void>;
  dispose(): Promise<void>;
}

/** One driver owns one form. Construction is inert; mount explicitly after DOM commit. */
export function createStripePaymentDriver(options: StripePaymentDriverOptions): StripePaymentDriver {
  let disposed = false;
  let abandoned = false;
  let uncertain = false;
  let stripe: Stripe | undefined;
  let card: StripeCardNumberElement | undefined;
  let mounted: StripeElement[] = [];
  let mounting: Promise<void> | undefined;
  let pending: Promise<PaymentOutcome> | undefined;
  let disposal: Promise<void> | undefined;
  const failure = (code: "payment-failed" | "disposed" | "busy", message: string): PaymentOutcome => ({ status: "failed", error: new CalendarError(code, message) });
  const unknown = (): PaymentOutcome => ({ status: "unknown", error: new CalendarError("recovery-required", "Payment status must be verified before continuing.") });
  function validFields() {
    const targets = [options.elements?.cardNumber, options.elements?.cardExpiry, options.elements?.cardCvc];
    return new Set(targets).size === 3 && targets.every((target) => target?.nodeType === 1 && target.isConnected);
  }
  function destroy() {
    for (const field of mounted) {
      try {
        field.destroy();
      } catch {
        /* Release all remaining fields. */
      }
    }
    mounted = [];
    card = undefined;
    stripe = undefined;
  }
  async function initialize() {
    if (!options.publishableKey?.trim() || !validFields()) throw new CalendarError("payment-failed", "Payment fields or configuration are unavailable.");
    if (card) return;
    try {
      const { loadStripe } = await import("@stripe/stripe-js/pure");
      const loaded = await loadStripe(options.publishableKey, options.accountId ? { stripeAccount: options.accountId } : undefined);
      if (abandoned || !loaded || !validFields()) throw new Error("Gateway unavailable");
      stripe = loaded;
      const elements = stripe.elements();
      const settings = {
        style: options.style ?? { base: { fontSize: "14px", fontWeight: 600, fontFamily: "system-ui, sans-serif", color: "#111827" }, invalid: { color: "#E25950" } },
        classes: { focus: "focused", empty: "empty", invalid: "invalid" },
      };
      card = elements.create("cardNumber", settings);
      mounted.push(card);
      card.mount(options.elements.cardNumber);
      const expiry = elements.create("cardExpiry", settings);
      mounted.push(expiry);
      expiry.mount(options.elements.cardExpiry);
      const cvc = elements.create("cardCvc", settings);
      mounted.push(cvc);
      cvc.mount(options.elements.cardCvc);
    } catch {
      destroy();
      throw new CalendarError("payment-failed", "Payment gateway could not be initialized.");
    }
  }
  function mount() {
    if (disposed) return Promise.reject(new CalendarError("disposed", "Payment driver is disposed."));
    if (abandoned) return Promise.reject(new CalendarError("recovery-required", "Payment driver is unavailable."));
    if (mounting) return mounting;
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        abandoned = true;
        reject(new CalendarError("payment-failed", "Payment gateway initialization timed out."));
      }, 30000);
    });
    return (mounting = Promise.race([initialize(), timeout]).finally(() => {
      clearTimeout(timer);
      mounting = undefined;
    }));
  }
  async function run(input: Parameters<PaymentDriver["confirm"]>[0]): Promise<PaymentOutcome> {
    if (!input.clientSecret) return failure("payment-failed", "Payment configuration is unavailable.");
    let confirmationStarted = false;
    try {
      // Start the resource lease before a concurrent dispose request.
      await mount();
      if (abandoned) return unknown();
      if (!stripe || !card || !validFields()) return failure("payment-failed", "Payment fields are unavailable.");
      confirmationStarted = true;
      const address = input.billingAddress;
      const result = await stripe.confirmCardPayment(input.clientSecret, {
        payment_method: { card, billing_details: { name: address.name, email: address.email, address: { postal_code: address.postalCode, city: address.city, country: address.country, line1: address.address } } },
      });
      if (abandoned || !validFields()) return unknown();
      const intent = result.paymentIntent ?? result.error?.payment_intent;
      if (intent?.status === "succeeded") return { status: "succeeded", paymentIntentId: intent.id };
      if (intent?.status === "requires_payment_method" || result.error?.code === "card_declined" || result.error?.type === "validation_error")
        return failure("payment-failed", "Payment was declined or card details are invalid.");
      return { ...unknown(), ...(intent?.id ? { paymentIntentId: intent.id } : {}) };
    } catch {
      return confirmationStarted ? unknown() : failure("payment-failed", "Payment gateway or fields are unavailable.");
    }
  }
  return {
    mount,
    confirm(input) {
      if (disposed) return Promise.resolve(failure("disposed", "Payment driver is disposed."));
      if (uncertain) return Promise.resolve(unknown());
      if (pending) return Promise.resolve(failure("busy", "A payment is already being confirmed."));
      let timer: ReturnType<typeof setTimeout>;
      const timeout = new Promise<PaymentOutcome>((resolve) => {
        timer = setTimeout(() => {
          abandoned = true;
          resolve(unknown());
        }, 300000);
      });
      pending = Promise.race([run(input), timeout])
        .then((outcome) => {
          if (outcome.status === "unknown") uncertain = true;
          return outcome;
        })
        .finally(() => {
          clearTimeout(timer);
          pending = undefined;
        });
      return pending;
    },
    dispose() {
      disposed = true;
      // A timeout completes the lease even if the third-party promise never settles.
      return (disposal ??= (pending ?? mounting ?? Promise.resolve())
        .catch(() => {})
        .then(() => {
          abandoned = true;
          destroy();
        }));
    },
  };
}
