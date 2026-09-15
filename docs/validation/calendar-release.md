# Calendar migration validation

Implementation is complete for the frontend scope. **Production release remains blocked by missing staging/backend recovery evidence.** No package publication or deployment has been performed.

## Toolchain and baseline

Validation uses Node 22.18.0 and pnpm 10.6.5. Before implementation, core had 38 passing tests and iframe had 117. Lint exited successfully with 238 warnings; formatting failed on 90 existing files.

## Acceptance evidence

| Area                         | Evidence                                                                                                                                                                               | Status                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Framework isolation          | Packed core installs and imports in Node without Vue or React installed; emitted imports and manifests checked for framework/SDK/CSS dependencies                                      | Passed                                 |
| Instances, ownership and SSR | Core instance suite; Vue/React shared contract, ownership and SSR suites; React StrictMode lease tests; Next hydration browser scenario                                                | Passed locally                         |
| Dates and configuration      | Core availability, DST, timezone, locale, stale-read and identity-reset suites; browser stale-month and input-reset scenarios                                                          | Passed locally                         |
| Vue compatibility            | 41 headless tests and 16 UI tests at actual Vue 3.4.0; writable field/guest/billing bindings, legacy lookup, multiple owners, success/error events and paid/reschedule fixtures        | Passed                                 |
| React compatibility          | 35 headless tests in the workspace; 44 UI tests on React 19 and an isolated React 18.3.1 install with matching type packages; headless React 18 also verified                          | Passed                                 |
| Booking and browser effects  | 130 core tests and 29 browser integration tests; free/paid/reschedule flows, exact request casing, unknown outcomes, paid-but-unconfirmed recovery, single-flight and bounded disposal | Passed                                 |
| Iframe compatibility         | 117 tests; existing Zoid IIFE build/concatenation retained and built                                                                                                                   | Passed                                 |
| Standalone declarations      | Core and Vue consumers passed, including Vue 3.4; React 18 and 19 consumers passed with browser exports and strict dependency declaration checking                                     | Passed                                 |
| Example builds               | Nuxt, React/Vite and Next production builds completed in dependency order                                                                                                              | Passed                                 |
| Guide examples               | Actual TS/Vue/TSX fences extracted into matching packed consumers and typechecked; lifecycle host functions declared without replacing snippet code                                    | Included in packed checks              |
| Appearance                   | Shared build-time CSS/fonts/tokens; 40 desktop/mobile baselines for light, dark, compact, long text, loading, disabled, error, empty, success and recovery                             | Passed: 40 inspected baselines         |
| Accessibility                | Named controls, keyboard selection/booking, guest-error focus, 200% zoom, reduced motion and light/dark axe checks; see manual scope below                                             | Passed: automated browser checks       |
| Release metadata             | Changesets status resolves core 3.0.0, Vue UI 4.0.0 and all four new packages 1.0.0                                                                                                    | Passed; no version/publish command run |
| Backend payment recovery     | No approved staging environment or Stripe test-mode credentials; server lookup/idempotency/expiry/webhook/refund guarantees not established                                            | **Unverified — release blocked**       |

## Check record

- `pnpm -r --if-present run test`: **412 tests passed** across seven packages (core 130, browser 29, Vue headless 41, React headless 35, Vue UI 16, React UI 44, iframe 117).
- `pnpm lint`: exit 0; 224 warnings, no errors in the current full scope.
- `pnpm format:check`: passed after formatting the existing package files and new test/example/script/shared inputs.
- `PACKED_CONSUMERS=vue VUE_VERSION=3.4.0 pnpm test:packages`: passed, including compiled guide examples and CSS/declaration exports.
- `pnpm exec playwright test --update-snapshots=none`: **75 tests passed**, covering 37 Vue scenarios, 37 React scenarios and Next SSR hydration; all 40 inspected visual baselines matched.
- `pnpm -r --if-present run build`: passed, including Nuxt, React/Vite, Next and iframe Zoid concatenation.
- `pnpm install --frozen-lockfile`: passed after aligning workspace Vue and its server renderer to 3.5.30.
- `pnpm -r --if-present run typecheck`: passed.
- `PACKED_CONSUMERS=react REACT_VERSION=18.3.1 pnpm test:packages`: passed with matching React type packages.
- `pnpm test:packages`: all four clean consumers passed (core, Vue, React and Next).
- `pnpm exec changeset status`: passed; workflow YAML parsing and `git diff --check` passed.

## Visual and manual scope

The browser reviewer inspected actual rendered PNGs, rather than accepting generated files automatically. That review caught and corrected invisible loading, dark text contrast, an epoch-date error shell and mobile empty-state overlap. Vue and React have separately reviewed equivalent-state baselines; their DOM and native versus custom timezone controls differ. Screenshots are regression checks, not a claim of identical pixels between frameworks.

Baselines use Chromium, a fixed 2030 clock, UTC, fictional API data, bundled fonts and fixed desktop/mobile viewports. CI runs browser verification on macOS to match the reviewed baselines; the React 18/19 matrix also verifies builds, types, tests and packed consumers on Linux. Snapshot comparison does not update references in normal verification.

Keyboard and zoom/reduced-motion checks are automated real-browser interactions. Visual inspection covers the captured states and readable recovery messaging. Screen-reader testing, an actual Stripe authentication dialog, and the full manual payment lifecycle have **not** been performed. Automated axe checks do not establish complete accessibility compliance.

## Release gate

The user confirmed that staging is not available and requested implementation to continue. The [booking recovery contract](../contracts/booking-recovery.md) and opt-in staging harness record the required backend evidence. Missing staging configuration fails explicitly; it does not become a skipped pass. No real bookings, charges, cancellations or refunds were performed.

Complete UIs retain unknown outcomes and reservation references without offering another payment. A headless host may supply reconciliation only against an authoritative contract; the default remains unsupported. Page-close completion still depends on backend work.

The package release and iframe deployment workflows require the full verification workflow and the repository variable `CALENDAR_RECOVERY_VERIFIED=true`, set only after reviewed staging evidence. The four new packages use development version `0.0.0` plus major Changesets so the first release resolves to exactly `1.0.0` rather than an automatic dependency patch to `1.0.1`.

The workspace uses one Vue 3.5 version to avoid conflicting linked declarations in iframe/Nuxt. Public declarations explicitly retain Vue 3.4-compatible generic shapes; the isolated Vue 3.4 packed consumer checks the final artifacts built on Vue 3.5.

Next's clean consumer uses its recommended dependency-library checking defaults. Zaptime declarations are checked with `skipLibCheck: false` in separate core, Vue and React consumers. See [consumer verification](../../tests/consumers/README.md).
