import { useCalendar } from "@zaptime/react-headless";
export function CalendarHeader() {
  const c = useCalendar();
  return (
    <div className="cal-flex cal-items-center cal-justify-between cal-py-6">
      <h2 aria-live="polite" className="cal-text-xl cal-font-semibold">
        {c.monthName} {c.currentYear}
      </h2>
      <div className="cal-flex cal-gap-2">
        <button type="button" className="cal-h-10 cal-w-10 cal-rounded-md" aria-label="Previous month" disabled={c.prevDisabled || c.state.loading} onClick={() => void c.prev().catch(() => {})}>
          ‹
        </button>
        <button type="button" className="cal-h-10 cal-w-10 cal-rounded-md" aria-label="Next month" disabled={c.nextDisabled || c.state.loading} onClick={() => void c.next().catch(() => {})}>
          ›
        </button>
      </div>
    </div>
  );
}
