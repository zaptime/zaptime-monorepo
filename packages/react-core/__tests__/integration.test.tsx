import { describe, it, expect, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useEffect, useRef } from "react";

// Empty availability keeps the test deterministic regardless of the run date;
// we still get a fully built month grid out of init().
vi.mock("../../core-shared/src/api/api", () => ({
  getAvailableTimeSlots: vi.fn().mockResolvedValue([]),
}));

import useConfig from "../src/hooks/useConfig";
import useCalendar from "../src/hooks/useCalendar";
import useSelectedTimeSlot from "../src/hooks/useSelectedTimeSlot";

const slot = {
  calendarId: 1,
  start: "2026-04-14T10:00:00Z",
  end: "2026-04-14T10:30:00Z",
  readableType: "online",
  seats: 1,
  title: "Slot",
};

/**
 * A small but representative consumer: it wires config + calendar together,
 * initializes on mount, renders the month grid, and lets the user pick a day
 * and a time slot — exactly the flow a real React app would build on top of
 * the headless hooks.
 */
function CalendarView({ id }: { id: string }) {
  const { setConfig } = useConfig(id);
  const { state, init, dayClicked, selectTimeSlot } = useCalendar(id);
  const { selectedTimeSlot } = useSelectedTimeSlot(id);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setConfig({ token: "test-token" });
    void init();
  }, [setConfig, init]);

  const firstSelectableDay = state.days.find((d) => d.date && !d.isPast);

  return (
    <div>
      <div data-testid="status">{state.loading ? "loading" : "ready"}</div>
      <div data-testid="dayCount">{state.days.length}</div>
      <div data-testid="selectedDay">{state.selectedDay?.label ?? "none"}</div>
      <div data-testid="selectedSlot">
        {selectedTimeSlot?.start ?? "none"}
      </div>
      {firstSelectableDay && (
        <button
          data-testid="pickDay"
          onClick={() => dayClicked(firstSelectableDay)}
        >
          pick day
        </button>
      )}
      <button data-testid="pickSlot" onClick={() => selectTimeSlot(slot)}>
        pick slot
      </button>
    </div>
  );
}

describe("end-to-end calendar flow (react render tree)", () => {
  it("mounts, initializes, renders the month grid and reacts to interaction", async () => {
    render(<CalendarView id="rc-integration-1" />);

    // init() runs in an effect and resolves asynchronously.
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("ready"),
    );

    // A complete calendar grid (5 or 6 weeks) was produced.
    expect([35, 42]).toContain(
      Number(screen.getByTestId("dayCount").textContent),
    );

    // Picking a day updates the shared calendar state and re-renders.
    act(() => {
      screen.getByTestId("pickDay").click();
    });
    expect(screen.getByTestId("selectedDay").textContent).not.toBe("none");

    // Selecting a time slot flows through useSelectedTimeSlot and re-renders.
    expect(screen.getByTestId("selectedSlot").textContent).toBe("none");
    act(() => {
      screen.getByTestId("pickSlot").click();
    });
    expect(screen.getByTestId("selectedSlot").textContent).toBe(slot.start);
  });
});
