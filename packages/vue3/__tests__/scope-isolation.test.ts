import { createApp, h } from "vue";
import { describe, expect, it } from "vitest";

import {
  createVue3CalendarScope,
  provideVue3CalendarScope,
  type Vue3CalendarScope,
} from "../src/composables/useVue3CalendarScope";
import useCalendarViewState from "../src/composables/useCalendarViewState";
import { useIsSubscribed } from "../src/composables/useIsSubscribed";

function runInScope<T>(scope: Vue3CalendarScope, factory: () => T): T {
  let result!: T;

  const Child = {
    setup() {
      result = factory();
      return () => h("div");
    },
  };

  const app = createApp({
    setup() {
      provideVue3CalendarScope(scope);
      return () => h(Child);
    },
  });

  const target = document.createElement("div");
  app.mount(target);
  app.unmount();

  return result;
}

describe("vue3 composable scope isolation", () => {
  it("isolates calendar view state per instance", () => {
    const scopeA = createVue3CalendarScope();
    const scopeB = createVue3CalendarScope();

    const a = runInScope(scopeA, () => useCalendarViewState());
    const b = runInScope(scopeB, () => useCalendarViewState());

    a.setView("form");
    a.setCalendarView("pickingTime");

    expect(a.view.value).toBe("form");
    expect(a.calendarView.value).toBe("pickingTime");
    expect(b.view.value).toBe("calendar");
    expect(b.calendarView.value).toBe("pickingDate");
  });

  it("isolates isSubscribed state per instance", () => {
    const scopeA = createVue3CalendarScope();
    const scopeB = createVue3CalendarScope();

    const a = runInScope(scopeA, () => useIsSubscribed());
    const b = runInScope(scopeB, () => useIsSubscribed());

    a.setIsSubscribed(false);

    expect(a.isSubscribed.value).toBe(false);
    expect(b.isSubscribed.value).toBe(true);
  });
});
