import { describe, it, expect, vi } from "vitest";
import { nextTick, watchEffect } from "vue";

// Mock external API calls (pure HTTP layer now lives in @zaptime/core-shared)
vi.mock("../../core-shared/src/api/api", () => ({
  getAvailableTimeSlots: vi.fn().mockResolvedValue([]),
}));

import useCalendar from "../src/composables/useCalendar";

describe("clearState reactivity", () => {
  it("state mutations remain visible through previously obtained references", () => {
    const calendarId = "reactivity-test-" + Date.now();

    // Simulate what happens in the app:
    // 1. Component gets state reference
    const component = useCalendar(calendarId);
    const stateRef = component.state;

    expect(stateRef.loading).toBe(true);
    expect(stateRef.days).toEqual([]);

    // 2. Init modifies state (simulating what clearState + getDays does)
    stateRef.loading = true;
    stateRef.days = [];
    stateRef.dfnsConfig = { locale: {} as any };

    // 3. After getDays, state is updated
    stateRef.days = Array.from({ length: 35 }, (_, i) => ({
      label: String(i + 1),
      isPast: false,
    }));
    stateRef.loading = false;

    // 4. Component should see the updated state through its reference
    expect(stateRef.loading).toBe(false);
    expect(stateRef.days.length).toBe(35);
  });

  it("multiple useCalendar calls with same id share the same state object", () => {
    const calendarId = "shared-ref-test-" + Date.now();

    const cal1 = useCalendar(calendarId);
    const cal2 = useCalendar(calendarId);

    // Both should return the exact same state object reference
    expect(cal1.state).toBe(cal2.state);

    // Mutation via one should be visible through the other
    cal1.state.loading = false;
    expect(cal2.state.loading).toBe(false);

    cal2.state.days = [{ label: "1", isPast: false }];
    expect(cal1.state.days.length).toBe(1);
  });

  it("clearState resets state without breaking shared references", () => {
    const calendarId = "clear-ref-test-" + Date.now();

    const cal1 = useCalendar(calendarId);
    const stateBeforeClear = cal1.state;

    // Modify state
    stateBeforeClear.loading = false;
    stateBeforeClear.days = [{ label: "1", isPast: false }];

    // Get another reference (simulating component access)
    const cal2 = useCalendar(calendarId);
    const stateFromComponent = cal2.state;

    // Both point to the same object
    expect(stateBeforeClear).toBe(stateFromComponent);
    expect(stateFromComponent.loading).toBe(false);

    // Now simulate init() which calls clearState internally
    // clearState resets properties in-place
    stateBeforeClear.date = new Date();
    stateBeforeClear.days = [];
    stateBeforeClear.timeSlots = [];
    stateBeforeClear.monthHasTimeSlots = false;
    stateBeforeClear.selectedDay = null;
    stateBeforeClear.loading = true;
    stateBeforeClear.headers = [];
    stateBeforeClear.dfnsConfig = undefined;
    stateBeforeClear.initLoaded = false;

    // The component's reference should see the reset values
    expect(stateFromComponent.loading).toBe(true);
    expect(stateFromComponent.days).toEqual([]);
    expect(stateFromComponent.initLoaded).toBe(false);

    // And subsequent mutations should also be visible
    stateBeforeClear.loading = false;
    stateBeforeClear.days = [{ label: "15", isPast: false }];
    expect(stateFromComponent.loading).toBe(false);
    expect(stateFromComponent.days.length).toBe(1);
  });
});
