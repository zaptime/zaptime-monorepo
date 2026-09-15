import { useId, useState, useSyncExternalStore } from "react";
import { ZaptimeCalendar } from "@zaptime/react";
import { ZaptimeProvider, useCalendarInstance, useCalendar, useBookingForm, useBillingAddress, useSelectedTimeSlot } from "@zaptime/react-headless";
import type { ZaptimeConfig } from "@zaptime/core";

const query = new URLSearchParams(location.search);
// Set your event token/API URL in the URL for a real integration. Browser tests
// intercept only this fictional endpoint and never contact a booking service.
const config: ZaptimeConfig = {
  token: query.get("token") ?? "fixture-token",
  apiBaseUrl: query.get("api") ?? "https://booking.example.test/",
  locale: { preset: "en" },
  compact: query.has("compact"),
  theme: { mode: query.has("dark") ? "dark" : "light" },
};

function Fields() {
  const { bookingForm, setCustomFieldValue } = useBookingForm();
  const { billingAddress, updateBillingAddressField } = useBillingAddress();
  const id = useId();
  return (
    <>
      {bookingForm
        .filter((field) => ["text", "email"].includes(field.type))
        .map((field) => (
          <label key={field.uuid}>
            {field.label}
            <input value={String(field.value ?? "")} type={field.type} onChange={(event) => setCustomFieldValue(field.uuid, event.target.value)} />
          </label>
        ))}
      <label htmlFor={`${id}-billing`}>Billing email</label>
      <input id={`${id}-billing`} value={billingAddress.email} onChange={(event) => updateBillingAddressField("email", event.target.value)} />
    </>
  );
}

function Headless({ name, shared = false }: { name: string; shared?: boolean }) {
  const calendar = useCalendarInstance({ config });
  const { state, next, prev, monthName, currentYear, dayClicked, selectTimeSlot } = useCalendar(calendar);
  const { selectedTimeSlot } = useSelectedTimeSlot(calendar);
  const snapshot = useSyncExternalStore(calendar.subscribe, calendar.getSnapshot, calendar.getSnapshot);
  const [shown, setShown] = useState(true);
  return (
    <section data-testid={name} className="demo-card">
      <h2>Custom calendar</h2>
      <button onClick={() => setShown(!shown)}>{shown ? "Hide fields" : "Show fields"}</button>
      {!state.initLoaded ? (
        <p role="status">Loading calendar</p>
      ) : (
        <>
          <h3>
            {monthName} {currentYear}
          </h3>
          <button onClick={() => void prev()}>Previous month</button>
          <button onClick={() => void next()}>Next month</button>
          {state.loading ? (
            <p role="status">Loading availability</p>
          ) : (
            <div>
              {state.days
                .filter((day) => day.timeSlots?.length)
                .map((day) => (
                  <button key={day.label} onClick={() => dayClicked(day)}>
                    Day {day.label}
                  </button>
                ))}
            </div>
          )}
          {state.timeSlots.map((slot) => (
            <button key={slot.start} onClick={() => selectTimeSlot({ ...slot })}>
              {calendar.formatters.getFormattedTime(slot.start)}
            </button>
          ))}
          <p data-testid="selection">{selectedTimeSlot?.start ?? "Select a time"}</p>
          <ZaptimeProvider calendar={calendar}>
            {shown && <Fields />}
            {shared && (
              <div data-testid="shared-fields">
                <Fields />
              </div>
            )}
          </ZaptimeProvider>
          <button disabled={!selectedTimeSlot || snapshot.phase === "submitting"} onClick={() => void calendar.actions.submit().catch(() => {})}>
            Confirm booking
          </button>
          <button onClick={() => void calendar.actions.setConfig({ token: "another-fixture-token" })}>Change event</button>
          <p role="status" data-testid="phase">
            {snapshot.phase}
          </p>
          {snapshot.error && <p role="alert">{snapshot.error.message}</p>}
        </>
      )}
    </section>
  );
}

export function App() {
  const path = location.pathname;
  const [shown, setShown] = useState(true);
  return (
    <main>
      <h1>Zaptime React examples</h1>
      <nav>
        <a href="/calendar">Complete calendar</a> <a href="/headless">Custom calendar</a> <a href="/multiple-calendars">Independent calendars</a> <a href="/shared-calendar">Shared consumers</a>
      </nav>
      {path === "/multiple-calendars" ? (
        <div className="demo-columns">
          <Headless name="calendar-a" />
          <Headless name="calendar-b" />
        </div>
      ) : path === "/headless" || path === "/shared-calendar" ? (
        <Headless name="calendar-a" shared={path === "/shared-calendar"} />
      ) : (
        <>
          <button onClick={() => setShown(!shown)}>{shown ? "Close calendar" : "Open calendar"}</button>
          {shown && (
            <div data-testid="complete-calendar">
              <ZaptimeCalendar config={config} />
            </div>
          )}
          {query.has("multiple") && (
            <div data-testid="second-complete-calendar">
              <ZaptimeCalendar config={config} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
