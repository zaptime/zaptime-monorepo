# Payments and uncertain outcomes

The core coordinates reservation creation, payment creation, browser confirmation and reservation confirmation. `@zaptime/browser` supplies the optional Stripe driver; headless packages do not load it.

Complete calendars accept the runtime `config.stripePublishableKey` override and retain the build-time `VITE_STRIPE_CLIENT_KEY` default. Use publishable keys only. Headless integrations supply a `PaymentDriver` when creating their instance. Browser fields use element references so multiple calendars can mount independent payment forms.

## Submission

`calendar.actions.submit(overrides?)` collects and validates fields, guests, seats and location. Free events book directly. Rescheduling changes the existing reservation without charging solely because the event has a price. Paid events reserve once, create a payment once, confirm it through the driver, then confirm the reservation.

Duplicate identical pending actions reuse their promise. Conflicting actions reject `busy`; inputs cannot change during submission. A successful payment does not by itself mean the booking is confirmed.

## Recovery

| Phase/outcome                                    | UI behavior                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Definite validation or payment failure           | Show the relevant error and retain editable inputs when the operation is resolved         |
| Mutation response lost or payment status unknown | Preserve operation/reservation identity and show recovery state                           |
| Payment succeeded, booking confirmation failed   | Explain that booking confirmation is unresolved; never offer automatic payment repetition |
| Reconciliation pending or unsupported            | Keep recovery visible; do not treat missing information as permission to retry            |
| Authoritative confirmed result                   | Show success and emit the confirmed reservation once                                      |

Provide `reconcile(context)` only when it is backed by an authoritative, verified backend contract. `safe-to-retry` permits only the named original mutation with its retained operation identity. No reconciliation result authorizes repeating payment. Without an adapter, recovery returns `unsupported`.

The driver must return `succeeded` with its payment intent ID, a definite `failed` error, or `unknown`. Missing card fields are a failure. Payment confirmation has a five-minute deadline; timeout is an uncertain outcome. Reads have a 30-second deadline. Frontend timeouts never prove a server mutation was undone.

## Release gate

[The recovery contract](../contracts/booking-recovery.md) records source evidence, backend changes and the opt-in staging harness. **Staging is unavailable and backend recovery remains unverified.** Mock tests cannot establish intent reuse, safe retries, hold expiry, refunds or webhook finalization after page closure. Paid-booking production readiness remains blocked until those checks have evidence.

Keep secrets, tokens, attendee fields and opaque recovery state out of browser storage, logs and analytics. This release retains recovery state in memory; page-reload and page-close completion require the verified server flow.
