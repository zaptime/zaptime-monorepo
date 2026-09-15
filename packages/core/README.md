# @zaptime/core

Framework-free TypeScript booking engine. No Vue, React, UI CSS or browser SDK is required by the final core artifact.

```ts
import { createCalendar } from "@zaptime/core";
const calendar = createCalendar({ config: { token: "event-token" } });
await calendar.init();
const unsubscribe = calendar.subscribe(() => {
  const snapshot = calendar.getSnapshot();
  // Render the current immutable snapshot in your integration.
});
unsubscribe();
await calendar.dispose();
```

Construction is inert; initialize after client mount. Instances own their state, preferences, requests and booking operations. Use actions to edit inputs and `submit` for validated orchestration. Retain typed errors and recovery state instead of repeating uncertain mutations.

Vue composables moved to `@zaptime/vue-headless`; React hooks live in `@zaptime/react-headless`. Complete UIs are `@zaptime/vue3` and `@zaptime/react`.

Read [migration](../../docs/guides/migration.md), [lifecycle](../../docs/guides/calendar-lifecycle.md), [SSR](../../docs/guides/ssr.md), and [payments/recovery](../../docs/guides/payments-and-recovery.md). Production recovery remains gated on the [backend evidence](../../docs/contracts/booking-recovery.md).
