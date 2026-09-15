import { useSyncExternalStore } from "react";
import type { CalendarInstance } from "@zaptime/core";
/** The complete UI observes lifecycle/recovery alongside the granular headless hooks. */
export function useSnapshot(calendar: CalendarInstance) {
  return useSyncExternalStore(calendar.subscribe, calendar.getSnapshot, calendar.getSnapshot);
}
