# React calendar examples

Build the workspace packages, then run `pnpm --filter react-example dev`.

- `/calendar`: complete calendar; add `?compact`, `?dark` or `?multiple` to exercise appearance and independent roots.
- `/headless`: custom date/time selection, editable fields and external submission.
- `/multiple-calendars`: independent inputs and sessions.
- `/shared-calendar`: two input consumers borrowing one owner.

The default token and endpoint are fictional. Playwright intercepts requests with synthetic fixtures. To connect a real event, pass your event token and API URL as `?token=...&api=...`; use the runtime publishable-key configuration described in the payment guide. Never pass a Stripe secret key. All imports use built package exports.
