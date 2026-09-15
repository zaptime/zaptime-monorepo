import { vi } from "vitest";
import { createCalendar } from "../src/calendar/createCalendar";
export const slot = { start: "2026-09-16T10:00:00Z", end: "2026-09-16T11:00:00Z", calendarId: 1, readableType: "", seats: 1, title: "" };
export const remote = { configuration: { locale: { preset: "en", texts: { chooseDate: "Remote" } } }, disabled: false, isSubscribed: true, eventTypeName: "Meeting" };
export const response = (data: unknown) => new Response(JSON.stringify({ success: true, data }));
export function fixture(data = remote) {
  const fetch = vi.fn<typeof globalThis.fetch>(async (url) => response(String(url).includes("event-types/init") ? data : [slot]));
  const calendar = createCalendar({
    config: { token: "test", max: 1, locale: { texts: { chooseDate: "Local" } } },
    runtime: { fetch, now: () => new Date("2026-09-15T12:00:00Z"), getTimezone: () => "UTC", getHourCycle: () => "h12" },
  });
  return { calendar, fetch };
}
