# @zaptime/react

Complete, styled React booking calendar. Supports React 18.3 and 19, including server rendering and StrictMode.

```tsx
import { ZaptimeCalendar } from "@zaptime/react";
import "@zaptime/react/style.css";

export function Booking() {
  return (
    <ZaptimeCalendar
      config={{ token: "YOUR_CALENDAR_TOKEN", locale: { preset: "en" } }}
      onBookingConfirmed={(reservation) => console.log(reservation.data.uuid)}
    />
  );
}
```

In a Next.js App Router application, render this from a client component. The package's JavaScript entry contains `"use client"`; server rendering shows a deterministic loading state and initializes only after mounting.

## Props

- `config`: public `ZaptimeConfig`, including token, theme, locale, compact mode, external booking, API base URL and rescheduling options.
- `calendarId`: optional metadata; every mounted component owns its own engine, even when IDs are equal.
- `className`: additional root class.
- `onCalendarLoaded()`, `onTimeSlotChanged(slot)`, `onBookingConfirmed(response)`: callbacks matching Vue events.
- `onError(error)` and `onRecoveryRequired(context)`: additive typed error and recovery callbacks.

`useCalendarViewState` is re-exported for hosts using the headless provider. Use `@zaptime/react-headless` to compose a custom interface and drive granular external booking actions.

## Payments and recovery

Set `config.stripePublishableKey` to the Stripe **publishable** key. Never pass a Stripe secret key to a browser. The calendar mounts independent Stripe fields for each payment form and uses the account returned by initialization. A build-time `VITE_STRIPE_CLIENT_KEY` is also supported for maintained distribution builds.

The core owns reservation, payment and confirmation. An unknown result keeps entered data and the reservation reference visible. A successful charge with unresolved confirmation never offers another payment. No verified reconciliation endpoint is available yet, so the complete calendar asks the attendee to contact the organizer; automatic retries remain disabled. Release verification against a staging backend is tracked in `docs/contracts/booking-recovery.md`.

The stylesheet includes the existing Basier Circle assets. Their existing license obligations still apply; see the repository's shared asset notice.

Publisher-authored introduction, field labels and choice labels may contain HTML, matching Vue's configuration contract. Treat that configuration as trusted content and sanitize it before supplying untrusted authors' markup. Attendee-entered values are rendered as text.
