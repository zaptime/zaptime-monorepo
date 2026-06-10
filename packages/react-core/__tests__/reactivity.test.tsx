import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import useSelectedTimeSlot from "../src/hooks/useSelectedTimeSlot";

const slot = {
  calendarId: 1,
  start: "2026-04-14T10:00:00Z",
  end: "2026-04-14T10:30:00Z",
  readableType: "online",
  seats: 1,
  title: "Slot",
};

function Display({ id }: { id?: string }) {
  const { selectedTimeSlot } = useSelectedTimeSlot(id);
  return <span data-testid="value">{selectedTimeSlot?.start ?? "none"}</span>;
}

function Control({ id }: { id?: string }) {
  const { setSelectedTimeSlot } = useSelectedTimeSlot(id);
  return (
    <button onClick={() => setSelectedTimeSlot(slot)}>set</button>
  );
}

describe("external store reactivity (useSyncExternalStore)", () => {
  it("re-renders all subscribers of the same calendarId when the store changes", () => {
    const id = "rc-reactivity-" + Date.now();
    render(
      <>
        <Display id={id} />
        <Control id={id} />
      </>,
    );

    expect(screen.getByTestId("value").textContent).toBe("none");

    act(() => {
      screen.getByText("set").click();
    });

    // The Display component (a separate subscriber) re-rendered with the value
    // written by the Control component — proving cross-component reactivity.
    expect(screen.getByTestId("value").textContent).toBe(slot.start);
  });

  it("isolates state between different calendarIds", () => {
    const idA = "rc-iso-a-" + Date.now();
    const idB = "rc-iso-b-" + Date.now();
    render(
      <>
        <Display id={idA} />
        <Control id={idA} />
        <span data-testid="b">
          <Display id={idB} />
        </span>
      </>,
    );

    act(() => {
      screen.getByText("set").click();
    });

    // Calendar B was never touched and must remain empty.
    expect(screen.getByTestId("b").textContent).toBe("none");
  });
});
