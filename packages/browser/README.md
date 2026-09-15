# @zaptime/browser

Shared browser effects for Zaptime framework adapters. Importing this ESM package and constructing a payment driver do not load Stripe or access the DOM. Core controls reservation/payment creation and recovery; this package handles card fields, SDK confirmation, analytics, and navigation.

## Card fields

Create one driver per form with connected element references. Call the additive `mount()` method after the framework commits all three host elements, **before the user enters card details**. `mount()` is asynchronous and rejects a typed `CalendarError` if fields or the gateway are unavailable. Repeated calls reuse mounted fields. The SDK initialization timeout is 30 seconds.

```ts
import { createStripePaymentDriver } from "@zaptime/browser";

const payment = createStripePaymentDriver({
  publishableKey: "pk_…",
  accountId: "acct_…",
  elements: { cardNumber, cardExpiry, cardCvc },
  style: { base: { color: "#111827", fontSize: "14px" } },
});
await payment.mount();
// Supply payment to the core CalendarInstance; core invokes confirm().
// On actual owner unmount:
await payment.dispose();
```

The optional additive `style` field accepts Stripe's `StripeElementStyle`. Default fields use a system font at 14px and support `focused`, `empty`, and `invalid` classes. Each driver retains separate Stripe account/form resources. Never use global DOM IDs to mount fields.

`dispose()` is terminal and idempotent. It rejects new work immediately and waits for a pending confirmation before destroying fields. Confirmation has a five-minute bound; uncertain, processing, or interrupted authentication results require core reconciliation. The same driver refuses another confirmation after an uncertain result. Hiding a form should preserve its driver; actual unmount disposes it. Do not clear host elements during an active authentication flow unless abandoning the UI intentionally; a disconnected form yields an unknown outcome.

## Browser effects

```ts
import { attachBrowserEffects } from "@zaptime/browser";
const unsubscribe = attachBrowserEffects(calendar, {
  // Optional; otherwise follows calendar.getSnapshot().analytics.
  analytics: remoteAnalytics,
  // Optional; defaults to window.location.assign.
  navigate: (url) => router.push(url),
});
unsubscribe();
```

Attach once per browser owner. This subscribes to core events and initializes each distinct remote configuration once per attachment. It supports Google Analytics, Google Tag Manager, Facebook Pixel, and Umami through lazy imports. Each attachment has independent delivery state. Cleanup drops queued analytics delivery and detaches both subscriptions. Analytics receives only the existing public `eventTypeName` and `timeSlot` properties; tokens, client secrets, billing details, and attendee fields are never forwarded. An analytics loading or delivery failure does not affect booking success.
