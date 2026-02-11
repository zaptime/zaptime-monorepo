import { createApp, h } from "vue";
import { describe, expect, it } from "vitest";

import {
  createCalendarScope,
  provideCalendarScope,
  type CalendarScope,
} from "../src/scope/calendarScope";
import useSelectedTimeSlot from "../src/composables/useSelectedTimeSlot";
import useBillingAddress from "../src/composables/useBillingAddress";
import useCurrentTimezone from "../src/composables/useCurrentTimezone";
import useHourCycle from "../src/composables/useHourCycle";
import useConfig from "../src/composables/useConfig";

function runInScope<T>(scope: CalendarScope, factory: () => T): T {
  let result!: T;

  const app = createApp({
    setup() {
      provideCalendarScope(scope);
      result = factory();
      return () => h("div");
    },
  });

  const target = document.createElement("div");
  app.mount(target);
  app.unmount();

  return result;
}

describe("calendar scope isolation", () => {
  it("keeps mutable composable state isolated between scopes", () => {
    const scopeA = createCalendarScope();
    const scopeB = createCalendarScope();

    const a = runInScope(scopeA, () => {
      return {
        ...useSelectedTimeSlot(),
        ...useBillingAddress(),
        ...useCurrentTimezone(),
        ...useHourCycle(),
      };
    });

    const b = runInScope(scopeB, () => {
      return {
        ...useSelectedTimeSlot(),
        ...useBillingAddress(),
        ...useCurrentTimezone(),
        ...useHourCycle(),
      };
    });

    const bInitialTimezone = b.timezone.value;
    const bInitialHourCycle = b.hourCycle.value;

    a.setSelectedTimeSlot({
      calendarId: 1,
      start: "2026-01-10T10:00:00.000Z",
      end: "2026-01-10T10:30:00.000Z",
      readableType: "30 min",
      seats: 1,
      title: "Slot A",
    });

    a.updateBillingAddressField("email", "scope-a@example.com");
    a.setTimezone("Europe/Prague");
    a.setHourCycle("h11");

    expect(a.selectedTimeSlot.value?.title).toBe("Slot A");
    expect(a.billingAddress.value.email).toBe("scope-a@example.com");
    expect(a.timezone.value).toBe("Europe/Prague");
    expect(a.hourCycle.value).toBe("h11");

    expect(b.selectedTimeSlot.value).toBeUndefined();
    expect(b.billingAddress.value.email).toBe("");
    expect(b.timezone.value).toBe(bInitialTimezone);
    expect(b.hourCycle.value).toBe(bInitialHourCycle);
  });

  it("keeps config isolated between scopes", () => {
    const scopeA = createCalendarScope();
    const scopeB = createCalendarScope();

    const a = runInScope(scopeA, () => useConfig());
    const b = runInScope(scopeB, () => useConfig());

    a.setConfig({ token: "token-a", apiBaseUrl: "https://a.test" });
    b.setConfig({ token: "token-b", apiBaseUrl: "https://b.test" });

    expect(a.config.value.token).toBe("token-a");
    expect(b.config.value.token).toBe("token-b");
    expect(a.config.value.apiBaseUrl).toBe("https://a.test");
    expect(b.config.value.apiBaseUrl).toBe("https://b.test");
  });
});
