import { useEffect } from "react";
import type { CalendarInstance } from "@zaptime/core";
/** Match the complete Vue calendar: narrow screens always use one selection pane. */
export function useResponsiveCalendar(calendar: CalendarInstance, compact?: boolean) {
  useEffect(() => {
    const media = window.matchMedia("(max-width: 859px)");
    let active = true;
    const apply = () => {
      if (active) void calendar.actions.setConfig({ compact: media.matches || compact === true }).catch(() => {});
    };
    queueMicrotask(apply);
    media.addEventListener("change", apply);
    return () => {
      active = false;
      media.removeEventListener("change", apply);
    };
  }, [calendar, compact]);
}
