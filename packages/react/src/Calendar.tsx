"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCalendarInstance, ZaptimeProvider } from "@zaptime/react-headless";
import { attachBrowserEffects } from "@zaptime/browser";
import { CalendarError } from "@zaptime/core";
import type { CalendarInstance, RecoveryContext, ReservationResponse, TimeSlot, ZaptimeConfig } from "@zaptime/core";
import { useResponsiveCalendar } from "./useResponsiveCalendar.js";
import { calendarMessages } from "./generated/messages.js";
import { useSnapshot } from "./state.js";
import { LoadingState } from "./components/LoadingState.js";
import { DisabledState } from "./components/DisabledState.js";
import { CalendarHeader } from "./components/CalendarHeader.js";
import { EmptyState } from "./components/EmptyState.js";
import { DaysGrid } from "./components/DaysGrid.js";
import { TimeSelection } from "./components/TimeSelection.js";
import { BookingForm } from "./components/BookingForm.js";
import { SuccessMessage } from "./components/SuccessMessage.js";
import type { PaymentBinding } from "./components/Payment.js";
import { MeetingInformation } from "./components/MeetingInformation.js";
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
function Contents({ calendar, props, binding }: { calendar: CalendarInstance; props: ZaptimeCalendarProps; binding: PaymentBinding }) {
  const s = useSnapshot(calendar);
  useResponsiveCalendar(calendar, props.config.compact);
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
      aria-label={calendarMessages(s.config.locale?.preset).calendar}
      data-calendar-id={props.calendarId}
      data-compact={!!s.config.compact}
      className={`zaptime-calendar ${s.config.theme?.mode === "dark" ? "dark cal-dark" : ""} ${props.className ?? ""}`}
      style={style}
    >
      <div className="cal-ui-shell">
        {loading ? (
          <LoadingState />
        ) : s.phase === "disabled" ? (
          <DisabledState />
        ) : (
          <>
            {s.error && s.view !== "form" && (
              <p role="alert" className="cal-p-6 cal-text-red-600">
                {s.error.message}
              </p>
            )}
            {s.view === "calendar" && s.calendar.initLoaded && (
              <div className={`cal-grid ${s.config.compact ? "" : "sm:cal-grid-cols-2"}`}>
                <section hidden={s.config.compact && s.calendarView === "pickingTime"} className="cal-px-3 cal-pb-6 sm:cal-px-12 cal-bg-theme-50 dark:cal-bg-theme-900">
                  <MeetingInformation />
                  <CalendarHeader />
                  {s.calendar.loading ? (
                    <LoadingState />
                  ) : (
                    <div className="cal-relative">
                      <DaysGrid />
                      {s.config.compact && !s.calendar.monthHasTimeSlots && <EmptyState />}
                    </div>
                  )}
                </section>
                {(!s.config.compact || s.calendarView === "pickingTime") && <TimeSelection />}
              </div>
            )}
            {s.view === "form" && <BookingForm calendar={calendar} binding={binding} />}
            {s.view === "success" && <SuccessMessage />}
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
  const [binding] = useState<PaymentBinding>(() => {
    const owner: PaymentBinding = { proxy: { confirm: (input) => owner.driver?.confirm(input) ?? Promise.resolve({ status: "failed", error: new CalendarError("payment-failed", "Payment fields are unavailable") }) } };
    return owner;
  });
  const calendar = useCalendarInstance({ config: props.config, payment: binding.proxy });
  return (
    <ZaptimeProvider calendar={calendar}>
      <Contents calendar={calendar} props={props} binding={binding} />
    </ZaptimeProvider>
  );
}
