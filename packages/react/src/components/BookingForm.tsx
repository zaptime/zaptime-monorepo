import { useEffect, useId, useRef, useState } from "react";
import { FormValidationError, RescheduleNotAllowedError, SlotNoLongerAvailableError, rescheduleNotAllowedText, slotNoLongerAvailableText, type CalendarInstance } from "@zaptime/core";
import { useDateFormatters } from "@zaptime/react-headless";
import { useSnapshot } from "../state.js";
import { FormField } from "./FormField.js";
import { GuestEmails } from "./GuestEmails.js";
import { Payment, type PaymentBinding } from "./Payment.js";
import { RecoveryMessage } from "./RecoveryMessage.js";
import { calendarMessages } from "../generated/messages.js";
export function BookingForm({ calendar, binding }: { calendar: CalendarInstance; binding: PaymentBinding }) {
  const s = useSnapshot(calendar),
    f = useDateFormatters(),
    form = useRef<HTMLFormElement>(null),
    [location, setLocation] = useState(() =>
      Math.max(
        0,
        s.locations.findIndex((l) => l.default),
      ),
    ),
    [paymentReady, setPaymentReady] = useState(false),
    [error, setError] = useState<unknown>(),
    id = useId();
  const busy = s.phase === "submitting" || s.phase === "recovery-required",
    m = calendarMessages(s.config.locale?.preset),
    reschedule = !!s.reservation || !!s.config.reservationUuid,
    slot = s.selectedTimeSlot;
  useEffect(() => {
    form.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
  }, []);
  useEffect(() => {
    if (error instanceof FormValidationError) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [error]);
  if (!slot) return null;
  const fieldErrors = error instanceof FormValidationError ? error.fieldErrors : [];
  async function submit() {
    setError(undefined);
    try {
      await calendar.actions.submit({ location: s.locations[location] ? { ...s.locations[location] } : undefined });
    } catch (cause) {
      setError(cause);
    }
  }
  return (
    <form
      ref={form}
      noValidate
      className="cal-mx-auto cal-max-w-[450px] cal-px-6 cal-py-10"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && (!s.stripeConfig || reschedule || paymentReady)) void submit();
      }}
      aria-busy={busy}
    >
      <h1 className="cal-text-2xl cal-font-medium">
        {reschedule ? (s.config.locale?.confirmationForm?.reschedulingEvent ?? "Rescheduling event") : (s.config.locale?.confirmationForm?.confirmBooking ?? "Confirm booking")}
      </h1>
      {reschedule && s.reservation && (
        <p className="cal-my-5 cal-text-theme-500">
          {f.getFormattedDayInMonth(s.reservation.start)} · {f.getFormattedTime(s.reservation.start)} – {f.getFormattedTime(s.reservation.end)} ↓
        </p>
      )}
      <h2 className="cal-mt-6 cal-text-2xl cal-font-semibold">{f.getFormattedDayInMonth(slot.start)}</h2>
      <p className="cal-mt-2 cal-text-xl">
        {f.getFormattedTime(slot.start)} – {f.getFormattedTime(slot.end)}
      </p>
      <fieldset disabled={busy} className="cal-min-w-0">
        {!reschedule && (
          <>
            {s.bookingForm.map((field) => (
              <FormField key={field.uuid} field={field} invalid={fieldErrors.some((e) => e.field === field.uuid || e.field === field.name)} />
            ))}
            {s.locations.length > 1 && !s.config.hideLocation && (
              <label className="cal-mt-5 cal-block" htmlFor={`${id}-location`}>
                {m.location}
                <select id={`${id}-location`} className="cal-ui-input cal-mt-2" value={location} onChange={(e) => setLocation(Number(e.target.value))}>
                  {s.locations.map((l, i) => (
                    <option value={i} key={i}>
                      {l.value || l.type}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {slot.seats > 1 && (
              <label className="cal-mt-5 cal-block" htmlFor={`${id}-seats`}>
                {m.seats}
                <select id={`${id}-seats`} className="cal-ui-input cal-mt-2" value={s.seats} onChange={(e) => calendar.actions.setSeats(Number(e.target.value))}>
                  {Array.from({ length: slot.seats }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <GuestEmails invalidFields={fieldErrors.map((error) => error.field)} />
            {s.stripeConfig && <Payment binding={binding} onReady={setPaymentReady} />}
          </>
        )}
      </fieldset>
      {s.recovery ? (
        <RecoveryMessage recovery={s.recovery} locale={s.config.locale?.preset} />
      ) : (
        !!error && (
          <p role="alert" className="cal-my-5 cal-text-red-600">
            {error instanceof FormValidationError
              ? m.validation
              : error instanceof SlotNoLongerAvailableError
                ? slotNoLongerAvailableText(s.config.locale)
                : error instanceof RescheduleNotAllowedError
                  ? rescheduleNotAllowedText(s.config.locale)
                  : m.bookingFailed}
          </p>
        )
      )}
      <div className="cal-mt-8 cal-flex cal-justify-between cal-gap-4">
        <button type="button" disabled={busy} className="cal-rounded-md cal-border cal-border-theme-200 cal-px-5 cal-py-3" onClick={() => calendar.actions.setView("calendar")}>
          {s.config.locale?.confirmationForm?.buttons?.goBack ?? "Go back"}
        </button>
        <button type="submit" disabled={busy || (!reschedule && !!s.stripeConfig && !paymentReady)} className="cal-rounded-md cal-bg-accent-base cal-px-5 cal-py-3 cal-font-medium cal-text-white hover:cal-bg-accent-dark">
          {reschedule ? (s.config.locale?.confirmationForm?.buttons?.reschedule ?? "Reschedule") : (s.config.locale?.confirmationForm?.buttons?.confirmBooking ?? "Confirm booking")}
        </button>
      </div>
    </form>
  );
}
