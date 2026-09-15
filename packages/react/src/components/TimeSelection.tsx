import { useCalendar, useCalendarViewState, useConfig, useDateFormatters } from "@zaptime/react-headless";
import { TimezonePicker } from "./TimezonePicker";
export function TimeSelection() {
  const c = useCalendar(),
    { config } = useConfig(),
    v = useCalendarViewState(),
    f = useDateFormatters();
  return (
    <section className="cal-flex cal-flex-col cal-p-6 sm:cal-p-10" aria-label="Available times">
      {config.compact && (
        <button type="button" className="cal-mb-5 cal-text-left" onClick={() => v.setCalendarView("pickingDate")}>
          {config.locale?.confirmationForm?.buttons?.goBack ?? "Go back"}
        </button>
      )}
      {c.state.timeSlots.length > 0 ? (
        <>
          <h2 className="cal-text-2xl cal-font-semibold">{f.getFormattedDayInMonth(c.state.timeSlots[0].start)}</h2>
          <p className="cal-mt-4 cal-mb-3">{config.locale?.texts?.choosePreferredTime ?? "Choose your preferred time"}</p>
          <div className="cal-max-h-[345px] cal-overflow-y-auto">
            {c.state.timeSlots.map((slot) => (
              <button
                key={`${slot.calendarId}-${slot.start}`}
                type="button"
                aria-pressed={c.isSelected(slot)}
                className="cal-my-2 cal-w-full cal-rounded-md cal-border cal-border-theme-200 cal-bg-theme-50 cal-px-4 cal-py-4 cal-text-theme-800 hover:cal-bg-theme-100 dark:cal-bg-theme-800 dark:cal-text-theme-100"
                onClick={() => {
                  c.selectTimeSlot({ ...slot });
                  if (!config.externalBooking) v.setView("form");
                }}
              >
                {f.getFormattedTime(slot.start)} – {f.getFormattedTime(slot.end)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="cal-flex cal-min-h-[270px] cal-items-center cal-justify-center cal-text-center">
          {c.state.monthHasTimeSlots ? (config.locale?.texts?.chooseDate ?? "Choose a date") : (config.locale?.texts?.noTimeSlotAvailable ?? "No time slots available")}
        </p>
      )}
      {!config.locale?.hideTimePreferences && <TimezonePicker />}
    </section>
  );
}
