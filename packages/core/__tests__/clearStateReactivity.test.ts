import { afterEach, describe, it, expect, vi } from "vitest";
import { effectScope, nextTick, watchEffect } from "vue";
import useCalendar from "../src/composables/useCalendar";
import useConfig from "../src/composables/useConfig";

vi.mock("../src/api/api", () => ({
  getAvailableTimeSlots: vi.fn().mockResolvedValue([]),
}));

afterEach(() => vi.useRealTimers());

describe("clearState reactivity", () => {
  it("keeps a previously captured state reactive through actual initialization and reinitialization", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-05-01T00:00:00Z"));
    const scope = effectScope();
    try {
      const { calendar, state, observed } = scope.run(() => {
        useConfig("compat-reset").setConfig({ token: "test-token", max: 0 });
        const calendar = useCalendar("compat-reset");
        const state = calendar.state;
        const observed: boolean[] = [];
        watchEffect(() => observed.push(state.initLoaded));
        return { calendar, state, observed };
      })!;
      await calendar.init();
      await nextTick();
      expect(calendar.state).toBe(state);
      expect(state.initLoaded).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.days.length).toBeGreaterThanOrEqual(28);
      expect(observed).toEqual([false, true]);

      const pending = calendar.init();
      await nextTick();
      expect(state.initLoaded).toBe(false);
      expect(state.selectedDay).toBeNull();
      await pending;
      await nextTick();
      expect(calendar.state).toBe(state);
      expect(state.initLoaded).toBe(true);
      expect(observed).toEqual([false, true, false, true]);
    } finally {
      scope.stop();
    }
  });

  it("updates all consumers of one explicit ID after actual initialization", async () => {
    const scope = effectScope();
    try {
      const [first, second] = scope.run(() => [useCalendar("compat-shared-reference"), useCalendar("compat-shared-reference")])!;
      const captured = second.state;
      await first.init();
      expect(first.state).toBe(captured);
      expect(second.state).toBe(captured);
      expect(captured.initLoaded).toBe(true);
      expect(captured.loading).toBe(false);
    } finally {
      scope.stop();
    }
  });
});
