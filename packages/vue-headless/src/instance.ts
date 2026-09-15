import { createCalendar, type CreateCalendarOptions } from "@zaptime/core";
import { getCurrentInstance, onMounted, onUnmounted } from "vue";
import { provideCalendar } from "./context";
export function useCalendarInstance(options: CreateCalendarOptions & { calendarId?: string }) {
  if (!getCurrentInstance()) throw new Error("useCalendarInstance requires Vue setup");
  const calendar = createCalendar(options);
  provideCalendar(calendar, options.calendarId);
  let lease = 0;
  onMounted(() => {
    lease++;
    void calendar.init().catch(() => {});
  });
  onUnmounted(() => {
    const released = ++lease;
    queueMicrotask(() => {
      if (lease === released) void calendar.dispose();
    });
  });
  return calendar;
}
