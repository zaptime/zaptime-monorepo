---
"@zaptime/core": major
"@zaptime/vue3": major
"@zaptime/vue-headless": major
"@zaptime/react-headless": major
"@zaptime/browser": major
"@zaptime/react": major
---

Move calendar state, initialization, booking validation and payment recovery coordination into framework-free calendar instances. Add granular Vue and React adapters, shared browser integrations, and a complete React calendar.

Headless Vue imports move to `@zaptime/vue-headless` and require an explicit owner or provider. Calendars are independent by default, ambiguous legacy lookup throws, derived state is read-only, booking identity changes reset inputs, and uncertain payment outcomes require reconciliation. Complete Vue component props/events and the deprecated `ZapTimeCalendar` alias remain supported. Both UIs export their CSS explicitly and render deterministic loading markup during SSR.

Production publication requires the complete release matrix and verified backend recovery evidence. See the migration and payments/recovery guides.
