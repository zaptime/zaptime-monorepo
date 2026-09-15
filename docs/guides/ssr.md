# Server rendering

Nuxt and Next render the same deterministic loading shell as the browser's initial render. Availability is loaded after client mount. Server-prefetched availability and transferring populated booking state are outside this release.

Core construction is inert: no network requests, timers, browser globals or local-preference detection. Initial values use an epoch date, UTC timezone and h23 hour cycle; the loading shell hides those placeholders. Runtime preferences are applied during initialization.

## Nuxt

Use the Vue calendar normally with its supported CSS import. A headless Vue owner initializes on mount; avoid calling `init()` in server setup. Keep instances and app scopes per request. Never put an instance with mutable booking state in a process-wide module singleton.

## Next

Import the complete React calendar from a client component:

```tsx
"use client";
import { ZaptimeCalendar } from "@zaptime/react";
import "@zaptime/react/style.css";
export function Booking() {
  return <ZaptimeCalendar config={{ token: "event-token" }} />;
}
```

Server pages can render that wrapper. React package entries preserve their client directives; core remains importable in server code. Calling `createCalendar` in server code is safe, but a server-created instance must not be serialized or shared across requests.

The provider borrows a supplied instance. React StrictMode effect replay must preserve the committed owner and initialize once. Final owner unmount releases its lease; explicit disposal is terminal.

SSR validation requires zero render-time requests/timers, equal server/client loading markup, request isolation and hydration without mismatch. The [release matrix](../validation/calendar-release.md) records actual verification; examples alone are not proof.
