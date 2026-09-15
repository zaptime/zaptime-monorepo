# Published-package browser checks

Build the workspace packages before running `pnpm exec playwright test`. The Nuxt, Vite React, and Next examples resolve package exports, so stale `dist` output can otherwise hide a source change. Playwright starts the three example servers and uses two workers; first-time development compilation can exceed five seconds.

## Coverage

- Independent and shared owners, input isolation, child hiding, owner reopening, identity changes, and stale availability.
- Headless and complete free-booking wire payloads, exactly one reservation, and complete booking by keyboard (Tab/Enter after initial date focus).
- Axe serious/critical checks in light and dark themes; 200% zoom email navigation; reduced-motion/mobile controls.
- Next server loading markup and hydration without mismatch errors.
- Desktop and mobile captures of light, dark, compact, long text, disabled, initialization error, empty month, loading, success, and recovery. Mobile captures assert no horizontal page overflow; long-text captures open the time panel.

The API routes use fictional data at `booking.example.test`. Recovery screenshots abort a synthetic free-booking mutation and verify a visible alert with submission disabled. They do not simulate card confirmation or establish backend reconciliation guarantees.

## Visual review

`pnpm exec playwright test --grep appearance --update-snapshots=all` refreshes every capture, including changes inside the comparison tolerance. Inspect the resulting PNGs before accepting them, then run the suite with `--update-snapshots=none`. Separate framework baselines detect regressions within each implementation; they do not assert pixel-identical Vue/React designs. Current baselines were captured with Chromium on macOS and include the platform in their filenames.

Live Stripe authentication, 3DS unmount/reopen behavior, paid staging bookings, and production analytics are outside this synthetic suite. They require a configured staging environment and manual verification before release; no real payment or external analytics delivery occurs here.
