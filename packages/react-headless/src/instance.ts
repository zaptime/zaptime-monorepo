import { useEffect, useState } from "react";
import { createCalendar, type CreateCalendarOptions } from "@zaptime/core";
import { equal } from "./store";
/** An inert owner is created during render. Only committed effects start work. */
export function useCalendarInstance(options: CreateCalendarOptions) {
  const [owner] = useState(() => ({ calendar: createCalendar(options), config: structuredClone(options.config), leases: 0, started: false }));
  useEffect(() => {
    owner.leases++;
    if (!owner.started) {
      owner.started = true;
      void owner.calendar.init().catch(() => {});
    }
    return () => {
      owner.leases--;
      queueMicrotask(() => {
        if (owner.leases === 0) void owner.calendar.dispose().catch(() => {});
      });
    };
  }, [owner]);
  useEffect(() => {
    if (equal(owner.config, options.config)) return;
    const patch = { ...options.config };
    for (const key of ["apiBaseUrl", "reservationUuid", "rescheduleOverrideToken"] as const) {
      if (key in owner.config && !(key in patch)) patch[key] = undefined;
    }
    // Synchronous validation stays visible to React error boundaries. Core reports
    // asynchronous initialization errors through its state/events.
    const update = owner.calendar.actions.setConfig(patch);
    owner.config = structuredClone(options.config);
    void update.catch(() => {});
  });
  return owner.calendar;
}
