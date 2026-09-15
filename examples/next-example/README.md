# Next calendar example

Build the workspace packages, then run `pnpm --filter next-example dev` or `pnpm --filter next-example build`.

The server page renders a client wrapper with deterministic loading markup. Initialization starts after hydration. The example uses fictional API configuration; Playwright supplies intercepted responses. Replace the token and API URL in `app/booking.tsx` to connect your event, and set `config.stripePublishableKey` for a test-mode paid integration.

The example consumes built packages and their public CSS exports without source aliases.
