import { useEffect, useRef } from "react";
import { useCalendar, useCalendarViewState, useConfig, useDateFormatters } from "@zaptime/react-headless";
import { TimeSlotButton } from "./TimeSlotButton.js";
import { TimezonePicker } from "./TimezonePicker.js";
export function TimeSelection() {
  const c = useCalendar(),
    { config } = useConfig(),
    v = useCalendarViewState(),
    f = useDateFormatters();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (config.compact && v.calendarView === "pickingTime") heading.current?.focus();
  }, [config.compact, v.calendarView]);
  return (
    <section className="cal-flex cal-min-h-[524px] cal-h-full cal-flex-col cal-p-6 sm:cal-p-10" aria-label="Available times">
      {config.compact && (
        <button type="button" className="cal-mb-5 cal-text-left" onClick={() => v.setCalendarView("pickingDate")}>
          {config.locale?.confirmationForm?.buttons?.goBack ?? "Go back"}
        </button>
      )}
      {c.state.timeSlots.length > 0 ? (
        <>
          <h2 ref={heading} tabIndex={-1} className="cal-text-2xl cal-font-semibold">
            {f.getFormattedDayInMonth(c.state.timeSlots[0].start)}
          </h2>
          <p className="cal-mt-4 cal-mb-3">{config.locale?.texts?.choosePreferredTime ?? "Choose your preferred time"}</p>
          <div className="cal-max-h-[345px] cal-overflow-y-auto">
            {c.state.timeSlots.map((slot) => (
              <TimeSlotButton key={`${slot.calendarId}-${slot.start}`} slot={{ ...slot }} />
            ))}
          </div>
        </>
      ) : (
        <p className="cal-flex cal-min-h-[270px] cal-items-center cal-justify-center cal-text-center">
          {c.state.monthHasTimeSlots ? (config.locale?.texts?.chooseDate ?? "Choose a date") : (config.locale?.texts?.noTimeSlotAvailable ?? "No time slots available")}
        </p>
      )}
      {!config.locale?.hideTimePreferences && (
        <div className="cal-mt-auto cal-pt-6">
          <TimezonePicker />
        </div>
      )}
    </section>
  );
}
