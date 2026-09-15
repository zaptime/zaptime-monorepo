import { useCalendar } from "@zaptime/react-headless";
import { calendarMessages } from "../generated/messages.js";
export function CalendarHeader() {
  const c = useCalendar();
  return (
    <div className="cal-flex cal-items-center cal-justify-between cal-py-4">
      <h2 aria-live="polite" className="cal-ml-3 cal-text-base cal-font-medium cal-text-theme-900 dark:cal-text-theme-200">
        {c.monthName} {c.currentYear}
      </h2>
      <div className="cal-flex cal-gap-2">
        <button
          type="button"
          className="cal-h-8 cal-w-8 cal-rounded-md cal-text-2xl cal-text-accent-dark"
          aria-label={calendarMessages(c.config.locale?.preset).previousMonth}
          disabled={c.prevDisabled || c.state.loading}
          onClick={() => void c.prev().catch(() => {})}
        >
          ‹
        </button>
        <button
          type="button"
          className="cal-h-8 cal-w-8 cal-rounded-md cal-text-2xl cal-text-accent-dark"
          aria-label={calendarMessages(c.config.locale?.preset).nextMonth}
          disabled={c.nextDisabled || c.state.loading}
          onClick={() => void c.next().catch(() => {})}
        >
          ›
        </button>
      </div>
    </div>
  );
}
