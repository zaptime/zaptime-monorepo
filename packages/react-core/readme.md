# @zaptime/react-core

Headless **React** hooks for the [Zaptime](https://zaptime.app) calendar booking
system. This is the React mirror of [`@zaptime/core`](https://www.npmjs.com/package/@zaptime/core)
(Vue): the same composable API and the same imperative booking functions, sharing
the same underlying API client and calendar logic.

It ships **no UI** — you bring your own components and wire them to the hooks.

## Install

```bash
npm install @zaptime/react-core
# react >= 18 is a peer dependency
```

## Usage

```tsx
import { useEffect } from "react";
import {
  useCalendar,
  useConfig,
  useSelectedTimeSlot,
  useDateFormatters,
  book,
} from "@zaptime/react-core";

function Calendar() {
  const { setConfig } = useConfig();
  const { state, init, next, prev, dayClicked, selectTimeSlot, isSelected } =
    useCalendar();
  const { selectedTimeSlot } = useSelectedTimeSlot();
  const { getFormattedTime } = useDateFormatters();

  useEffect(() => {
    setConfig({ token: "YOUR_CALENDAR_TOKEN" });
    void init();
  }, []);

  return (
    <div>
      {state.days.map((day, i) => (
        <button key={i} disabled={day.isPast} onClick={() => dayClicked(day)}>
          {day.label}
        </button>
      ))}

      {state.timeSlots.map((slot) => (
        <button
          key={slot.start}
          aria-pressed={isSelected(slot)}
          onClick={() => selectTimeSlot(slot)}
        >
          {getFormattedTime(slot.start)}
        </button>
      ))}

      <button
        disabled={!selectedTimeSlot}
        onClick={() => book({ email: "attendee@example.com" })}
      >
        Book
      </button>
    </div>
  );
}
```

## API

The surface mirrors `@zaptime/core` one-to-one:

| Hooks | Imperative functions | Types |
| --- | --- | --- |
| `useCalendar`, `useConfig`, `useSelectedTimeSlot`, `useCurrentTimezone`, `useHourCycle`, `useLocations`, `useStripeConfig`, `useBookingForm`, `useGuests`, `useBillingAddress`, `useReservationReschedule`, `useDateFormatters` | `book`, `reserve`, `confirm`, `cancel`, `reschedule`, `fetchRemoteConfiguration`, `stopReservationRefresh` | `ZaptimeConfig`, `Day`, `TimeSlot`, `CalendarState`, `CustomField`, `CustomFieldCollected`, `ReservationResponse` |

Every hook accepts an optional `calendarId` to run multiple isolated calendars on
the same page.

### Difference from `@zaptime/core` (Vue)

Hooks return already-unwrapped reactive values, not Vue refs — so you read
`config`, `state`, `selectedTimeSlot` directly (no `.value`). State is shared
across hook callers via React's `useSyncExternalStore`.

## License

MIT © Zaptime s.r.o.
