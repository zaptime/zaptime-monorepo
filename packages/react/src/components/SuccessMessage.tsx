import { useConfig, useDateFormatters, useSelectedTimeSlot } from "@zaptime/react-headless";
import { calendarMessages } from "../generated/messages.js";
export function SuccessMessage() {
  const { config } = useConfig(),
    { selectedTimeSlot: slot } = useSelectedTimeSlot(),
    f = useDateFormatters();
  return (
    <section role="status" className="cal-flex cal-min-h-[524px] cal-flex-col cal-items-center cal-justify-center cal-p-10 cal-text-center">
      <span aria-hidden="true" className="cal-mb-6 cal-text-5xl cal-text-accent-base">
        ✓
      </span>
      <h2 className="cal-text-2xl cal-font-semibold">{calendarMessages(config.locale?.preset).confirmed}</h2>
      {slot && (
        <>
          <p className="cal-mt-6">{f.getFormattedDayInMonth(slot.start)}</p>
          <p className="cal-mt-2 cal-text-2xl">
            {f.getFormattedTime(slot.start)} – {f.getFormattedTime(slot.end)}
          </p>
        </>
      )}
    </section>
  );
}
