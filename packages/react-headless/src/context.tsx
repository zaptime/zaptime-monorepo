import { createContext, useContext, type ReactNode } from "react";
import type { CalendarInstance } from "@zaptime/core";
const CalendarContext = createContext<CalendarInstance | undefined>(undefined);
export class CalendarProviderError extends Error {
  readonly code = "missing-calendar-provider";
  constructor() {
    super("Provide a CalendarInstance or wrap this component in ZaptimeProvider.");
    this.name = "CalendarProviderError";
  }
}
/** Borrows a host-owned instance. The host controls initialization and disposal. */
export function ZaptimeProvider({ calendar, children }: { calendar: CalendarInstance; children?: ReactNode }) {
  return <CalendarContext.Provider value={calendar}>{children}</CalendarContext.Provider>;
}
export function useResolvedCalendar(instance?: CalendarInstance) {
  const provided = useContext(CalendarContext);
  const calendar = instance ?? provided;
  if (!calendar) throw new CalendarProviderError();
  return calendar;
}
