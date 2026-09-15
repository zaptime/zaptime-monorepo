"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { useCalendarInstance, ZaptimeProvider } from "@zaptime/react-headless";
import { attachBrowserEffects } from "@zaptime/browser";
import type { CalendarError, CalendarInstance, RecoveryContext, ReservationResponse, TimeSlot, ZaptimeConfig } from "@zaptime/core";
import { useSnapshot } from "./state";
import { LoadingState } from "./components/LoadingState";
import { DisabledState } from "./components/DisabledState";
import { CalendarHeader } from "./components/CalendarHeader";
import { DaysGrid } from "./components/DaysGrid";
import { TimeSelection } from "./components/TimeSelection";
import { MeetingInformation } from "./components/MeetingInformation";
export interface ZaptimeCalendarProps {
  config: ZaptimeConfig;
  calendarId?: string;
  className?: string;
  onBookingConfirmed?: (reservation: ReservationResponse) => void;
  onTimeSlotChanged?: (slot: TimeSlot | undefined) => void;
  onCalendarLoaded?: () => void;
  onError?: (error: CalendarError) => void;
  onRecoveryRequired?: (context: RecoveryContext) => void;
}
function Contents({ calendar, props }: { calendar: CalendarInstance; props: ZaptimeCalendarProps }) {
  const s = useSnapshot(calendar);
  const callback = useRef(props);
  callback.current = props;
  useEffect(
    () =>
      calendar.onEvent((event) => {
        const p = callback.current;
        switch (event.type) {
          case "calendar-loaded":
            p.onCalendarLoaded?.();
            break;
          case "time-slot-changed":
            p.onTimeSlotChanged?.(event.payload);
            break;
          case "booking-confirmed":
            p.onBookingConfirmed?.(event.payload);
            break;
          case "error":
            p.onError?.(event.payload);
            break;
          case "recovery-required":
            p.onRecoveryRequired?.(event.payload);
        }
      }),
    [calendar],
  );
  useEffect(() => attachBrowserEffects(calendar), [calendar]);
  const colors = s.config.theme?.colors;
  const style: CSSProperties = {};
  for (const [key, value] of Object.entries(colors ?? {})) {
    const cssKey = key.startsWith("accent") ? `accent-${key.slice(6).toLowerCase()}` : key;
    (style as Record<string, string>)[`--c-zaptime-${cssKey}`] = value;
  }
  (style as Record<string, string>)["--radius-zaptime"] = s.config.theme?.borderRadius === "full" ? "24px" : (s.config.theme?.borderRadius ?? "8px");
  const loading = s.phase === "idle" || s.phase === "initializing";
  return (
    <section
      role="region"
      aria-label="Booking calendar"
      data-calendar-id={props.calendarId}
      data-compact={!!s.config.compact}
      className={`zaptime-calendar ${s.config.theme?.mode === "dark" ? "dark" : ""} ${props.className ?? ""}`}
      style={style}
    >
      <div className="cal-ui-shell">
        {loading ? (
          <LoadingState />
        ) : s.phase === "disabled" ? (
          <DisabledState />
        ) : (
          <>
            {s.error && (
              <p role="alert" className="cal-p-6 cal-text-red-600">
                {s.error.message}
              </p>
            )}
            {s.view === "calendar" && (
              <div className={`cal-grid ${s.config.compact ? "" : "sm:cal-grid-cols-2"}`}>
                <section hidden={s.config.compact && s.calendarView === "pickingTime"} className="cal-p-6 sm:cal-p-10">
                  <MeetingInformation />
                  <CalendarHeader />
                  {s.calendar.loading ? <LoadingState /> : <DaysGrid />}
                </section>
                {(!s.config.compact || s.calendarView === "pickingTime") && <TimeSelection />}
              </div>
            )}
            {s.view === "form" && (
              <div className="cal-p-10">
                <h2>{s.config.locale?.confirmationForm?.confirmBooking ?? "Confirm booking"}</h2>
                <button type="button" onClick={() => calendar.actions.setView("calendar")}>
                  Go back
                </button>
              </div>
            )}
          </>
        )}
        {s.calendar.initLoaded && !s.isSubscribed && (
          <footer className="cal-p-4 cal-text-center cal-text-xs">
            <a href="https://zaptime.com" target="_blank" rel="noreferrer">
              Powered by Zaptime
            </a>
          </footer>
        )}
      </div>
    </section>
  );
}
export function ZaptimeCalendar(props: ZaptimeCalendarProps) {
  const calendar = useCalendarInstance({ config: props.config });
  return (
    <ZaptimeProvider calendar={calendar}>
      <Contents calendar={calendar} props={props} />
    </ZaptimeProvider>
  );
}
