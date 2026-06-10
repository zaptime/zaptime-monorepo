import { useState } from "react";
import {
  useCalendar,
  useSelectedTimeSlot,
  useDateFormatters,
  book,
  type ZaptimeConfig,
  type ReservationResponse,
} from "@zaptime/react-core";
import { useInitialization } from "./useInitialization";

type View = "calendar" | "form" | "success";

export function ZaptimeCalendar({
  config,
  calendarId,
}: {
  config: ZaptimeConfig;
  calendarId?: string;
}) {
  const { isEnabled, initLoaded } = useInitialization(config, calendarId);

  const {
    state,
    prev,
    next,
    prevDisabled,
    nextDisabled,
    dayClicked,
    monthName,
    currentYear,
    selectTimeSlot,
    isSelected,
    isSelectedDay,
  } = useCalendar(calendarId);
  const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);
  const { getFormattedTime, getFormattedDayInMonth } =
    useDateFormatters();

  const [view, setView] = useState<View>("calendar");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReservationResponse | null>(null);

  if (!initLoaded) {
    return <div className="zt">Loading…</div>;
  }

  if (!isEnabled) {
    return <div className="zt">This calendar is currently unavailable.</div>;
  }

  if (view === "success") {
    return (
      <div className="zt zt-center">
        <h3>You're booked 🎉</h3>
        <p>
          A confirmation was sent to{" "}
          <strong>{result?.data?.userEmail ?? email}</strong>.
        </p>
      </div>
    );
  }

  if (view === "form" && selectedTimeSlot) {
    return (
      <div className="zt">
        <button className="zt-link" onClick={() => setView("calendar")}>
          ← Back
        </button>
        <h3>
          {getFormattedDayInMonth(selectedTimeSlot.start)} ·{" "}
          {getFormattedTime(selectedTimeSlot.start)}
        </h3>
        <label className="zt-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && <p className="zt-error">{error}</p>}
        <button
          className="zt-primary"
          disabled={!email || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const res = await book({ email, calendarId });
              if (!res.success) throw new Error("Booking rejected");
              setResult(res);
              setView("success");
            } catch (e) {
              setError("Booking failed, please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    );
  }

  return (
    <div className="zt">
      <div className="zt-nav">
        <button disabled={prevDisabled} onClick={() => void prev()}>
          ‹
        </button>
        <strong>
          {monthName} {currentYear}
        </strong>
        <button disabled={nextDisabled} onClick={() => void next()}>
          ›
        </button>
      </div>

      <div className="zt-grid">
        {state.headers.map((header, i) => (
          <div key={`h-${i}`} className="zt-head">
            {header}
          </div>
        ))}
        {state.days.map((day, i) => (
          <button
            key={`d-${i}`}
            className={"zt-day" + (isSelectedDay(day) ? " is-selected" : "")}
            disabled={day.isPast || day.timeSlots === undefined}
            onClick={() => dayClicked(day)}
          >
            {day.label}
          </button>
        ))}
      </div>

      {state.loading && <p className="zt-muted">Loading availability…</p>}
      {!state.loading && !state.monthHasTimeSlots && (
        <p className="zt-muted">No availability this month.</p>
      )}

      <div className="zt-times">
        {state.timeSlots.map((ts) => (
          <button
            key={ts.start}
            className={"zt-time" + (isSelected(ts) ? " is-selected" : "")}
            onClick={() => selectTimeSlot(ts)}
          >
            {getFormattedTime(ts.start)}
          </button>
        ))}
      </div>

      <button
        className="zt-primary"
        disabled={!selectedTimeSlot}
        onClick={() => setView("form")}
      >
        Continue →
      </button>
    </div>
  );
}
