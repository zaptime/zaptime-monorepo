import { useId } from "react";
import { useGuests, useConfig } from "@zaptime/react-headless";
import { calendarMessages } from "../generated/messages.js";
export function GuestEmails({ invalidFields = [] }: { invalidFields?: readonly string[] }) {
  const g = useGuests(),
    { config } = useConfig(),
    id = useId(),
    m = calendarMessages(config.locale?.preset);
  if (!g.guestsEnabled) return null;
  return (
    <div className="cal-mt-5">
      {g.guests.map((email, index) => (
        <div key={index} className="cal-mt-3">
          <label htmlFor={`${id}-${index}`} className="cal-text-sm">
            {m.guest} {index + 1}
          </label>
          <div className="cal-flex cal-gap-2">
            <input
              aria-invalid={invalidFields.includes(`guests.${index}`) || undefined}
              aria-describedby={invalidFields.includes(`guests.${index}`) ? `${id}-${index}-error` : undefined}
              id={`${id}-${index}`}
              className="cal-ui-input"
              type="email"
              value={email}
              onChange={(e) => g.updateGuest(index, e.target.value)}
            />
            <button type="button" aria-label={`${m.removeGuest} ${index + 1}`} onClick={() => g.removeGuest(index)}>
              ×
            </button>
          </div>
          {invalidFields.includes(`guests.${index}`) && (
            <p id={`${id}-${index}-error`} className="cal-mt-1 cal-text-sm cal-text-red-600">
              {m.invalidField}
            </p>
          )}
        </div>
      ))}
      {g.canAddGuest && (
        <button type="button" className="cal-mt-3 cal-text-sm cal-font-medium cal-text-accent-base" onClick={() => g.addGuest()}>
          {config.locale?.confirmationForm?.addGuests ?? "Add guest"}
        </button>
      )}
    </div>
  );
}
