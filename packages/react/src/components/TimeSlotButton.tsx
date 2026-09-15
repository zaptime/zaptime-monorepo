import { useState } from "react";
import type { TimeSlot } from "@zaptime/core";
import { useCalendar, useCalendarViewState, useConfig, useDateFormatters } from "@zaptime/react-headless";
export function TimeSlotButton({ slot }: { slot: TimeSlot }) {
  const [armed, setArmed] = useState(false),
    c = useCalendar(),
    { config } = useConfig(),
    v = useCalendarViewState(),
    f = useDateFormatters();
  function select() {
    c.selectTimeSlot(slot);
    if (!config.externalBooking) v.setView("form");
  }
  return (
    <div
      className="cal-flex cal-items-center cal-gap-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setArmed(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setArmed(false);
      }}
    >
      <button
        type="button"
        aria-pressed={c.isSelected(slot)}
        className={`cal-my-2 cal-rounded-md cal-px-4 cal-py-4 cal-font-medium ${armed ? "cal-w-1/2" : "cal-w-full"} ${c.isSelected(slot) ? "cal-bg-accent-base cal-text-white" : "cal-bg-theme-100 cal-text-theme-800 hover:cal-bg-theme-200 dark:cal-bg-theme-800 dark:cal-text-theme-100"}`}
        onClick={() => (config.externalBooking ? select() : setArmed(true))}
      >
        {f.getFormattedTime(slot.start)} – {f.getFormattedTime(slot.end)}
      </button>
      {armed && !config.externalBooking && (
        <button type="button" className="cal-w-1/2 cal-rounded-md cal-bg-accent-base cal-px-3 cal-py-4 cal-font-medium cal-text-white hover:cal-bg-accent-dark" onClick={select}>
          {config.locale?.texts?.pickTime ?? "Pick a time"}
        </button>
      )}
    </div>
  );
}
