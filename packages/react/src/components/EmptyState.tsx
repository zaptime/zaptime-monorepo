import { useCalendar, useConfig } from "@zaptime/react-headless";
import { ConfigurationHtml } from "./ConfigurationHtml.js";
export function EmptyState() {
  const calendar = useCalendar(),
    { config } = useConfig();
  return (
    <div
      role="status"
      className="cal-absolute cal-inset-0 cal-flex cal-flex-col cal-items-center cal-justify-center cal-gap-4 cal-rounded-md cal-bg-theme-50/80 cal-p-5 cal-text-center cal-backdrop-blur-[6px] dark:cal-bg-theme-900/80"
    >
      <ConfigurationHtml as="div" html={config.locale?.texts?.noTimeSlotAvailable ?? "No time slots available"} />
      <button
        type="button"
        disabled={calendar.nextDisabled || calendar.state.loading}
        className="cal-rounded-md cal-bg-accent-base cal-px-4 cal-py-3 cal-font-medium cal-text-white"
        onClick={() => void calendar.next().catch(() => {})}
      >
        {config.locale?.texts?.showNextMonth ?? "Show next month"}
      </button>
    </div>
  );
}
