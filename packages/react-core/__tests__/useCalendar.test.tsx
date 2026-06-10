import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock the pure HTTP layer (shared by @zaptime/core-shared). useCalendar ->
// getDays -> getAvailableTimeSlots resolves to this stub.
vi.mock("../../core-shared/src/api/api", () => ({
  getAvailableTimeSlots: vi.fn().mockResolvedValue([]),
}));

import useCalendar from "../src/hooks/useCalendar";

const slot = {
  calendarId: 1,
  start: "2026-04-14T10:00:00Z",
  end: "2026-04-14T10:30:00Z",
  readableType: "online",
  seats: 1,
  title: "Slot",
};

// Unique, STABLE calendar id per test. Must be computed once (not inside the
// render callback) — otherwise it would change on every re-render.
let counter = 0;
const uid = (prefix: string) => `${prefix}-${counter++}`;

describe("useCalendar (react-core)", () => {
  describe("initial state", () => {
    it("starts with the default calendar state", () => {
      const id = uid("rc-initial");
      const { result } = renderHook(() => useCalendar(id));
      expect(result.current.state.loading).toBe(true);
      expect(result.current.state.days).toEqual([]);
      expect(result.current.state.initLoaded).toBe(false);
    });
  });

  describe("state isolation", () => {
    it("uses separate state for different calendarIds", () => {
      const { result: r1 } = renderHook(() => useCalendar("rc-cal-1"));
      const { result: r2 } = renderHook(() => useCalendar("rc-cal-2"));

      act(() => {
        r1.current.dayClicked({ label: "1", isPast: false });
      });

      expect(r1.current.state.selectedDay?.label).toBe("1");
      expect(r2.current.state.selectedDay).toBeNull();
    });

    it("shares state for the same calendarId across hook instances", () => {
      const id = uid("rc-shared");
      const { result: r1 } = renderHook(() => useCalendar(id));
      const { result: r2 } = renderHook(() => useCalendar(id));

      act(() => {
        r1.current.dayClicked({ label: "7", isPast: false });
      });

      // The second hook (same calendarId) sees the update and re-renders.
      expect(r2.current.state.selectedDay?.label).toBe("7");
    });
  });

  describe("dayHasTimeSlot", () => {
    it("returns true when the day has time slots", () => {
      const { result } = renderHook(() => useCalendar("rc-slot"));
      expect(
        result.current.dayHasTimeSlot({
          label: "1",
          isPast: false,
          timeSlots: [slot],
        }),
      ).toBe(true);
    });

    it("returns false when the day has no time slots", () => {
      const { result } = renderHook(() => useCalendar("rc-no-slot"));
      expect(
        result.current.dayHasTimeSlot({ label: "1", isPast: false }),
      ).toBe(false);
    });
  });

  describe("dayClicked / isSelectedDay", () => {
    it("sets selectedDay and reflects it through isSelectedDay", () => {
      const id = uid("rc-click");
      const { result } = renderHook(() => useCalendar(id));
      const day = { label: "3", isPast: false };

      act(() => {
        result.current.dayClicked(day);
      });

      expect(result.current.state.selectedDay?.label).toBe("3");
      expect(
        result.current.isSelectedDay(result.current.state.selectedDay!),
      ).toBe(true);
      expect(
        result.current.isSelectedDay({ label: "9", isPast: false }),
      ).toBe(false);
    });
  });

  describe("selectTimeSlot / isSelected", () => {
    it("marks the selected time slot", () => {
      const id = uid("rc-select");
      const { result } = renderHook(() => useCalendar(id));

      expect(result.current.isSelected(slot)).toBe(false);

      act(() => {
        result.current.selectTimeSlot(slot);
      });

      expect(result.current.isSelected(slot)).toBe(true);
    });
  });

  describe("init", () => {
    it("runs the init flow and marks initLoaded", async () => {
      const id = uid("rc-init");
      const { result } = renderHook(() => useCalendar(id));

      await act(async () => {
        await result.current.init();
      });

      expect(result.current.state.initLoaded).toBe(true);
      expect(result.current.state.loading).toBe(false);
      // A full 5- or 6-week grid is always produced.
      expect([35, 42]).toContain(result.current.state.days.length);
    });
  });
});
