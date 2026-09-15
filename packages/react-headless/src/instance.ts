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
    owner.config = structuredClone(options.config);
    // Core reports asynchronous initialization errors through its state/events.
    void owner.calendar.actions.setConfig(options.config).catch(() => {});
  });
  return owner.calendar;
}
