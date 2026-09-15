import { useRef, type KeyboardEvent } from "react";
import { useCalendar, useCalendarViewState } from "@zaptime/react-headless";
export function DaysGrid() {
  const c = useCalendar(),
    view = useCalendarViewState();
  const grid = useRef<HTMLDivElement>(null);
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const buttons = grid.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!buttons) return;
    for (let n = index + delta; n >= 0 && n < buttons.length; n += delta) {
      if (!buttons[n].disabled) {
        buttons[n].focus();
        break;
      }
    }
  }
  return (
    <div ref={grid} className="cal-grid cal-grid-cols-7 cal-gap-y-2" aria-label="Available dates">
      {c.state.headers.map((h, i) => (
        <span key={i} className="cal-text-center cal-text-xs cal-font-medium cal-py-2">
          {h}
        </span>
      ))}
      {c.state.days.map((day, i) => (
        <button
          key={i}
          type="button"
          aria-label={day.date ? new Intl.DateTimeFormat(c.config.locale?.preset ?? "en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(day.date.getTime())) : undefined}
          aria-pressed={c.isSelectedDay(day)}
          disabled={!c.dayHasTimeSlot(day) || !!day.isPast || c.state.loading}
          onKeyDown={(e) => move(e, i)}
          onClick={() => {
            c.dayClicked(day);
            view.setCalendarView("pickingTime");
          }}
          className={`cal-mx-auto cal-h-10 cal-w-10 cal-rounded-md cal-text-sm ${c.isSelectedDay(day) ? "cal-bg-accent-base cal-text-white" : "cal-bg-theme-100 cal-text-theme-700 dark:cal-bg-theme-800 dark:cal-text-theme-100"}`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
