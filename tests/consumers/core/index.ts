import { CalendarError, createCalendar, type CalendarInstance, type CalendarSnapshot } from "@zaptime/core";
const error = new CalendarError("validation", "Fixture validation failure");
if (error.code !== "validation") throw error;
const calendar: CalendarInstance = createCalendar({ config: { token: "fixture-token" } });
const snapshot: ReturnType<CalendarInstance["getSnapshot"]> = calendar.getSnapshot();
const phase: CalendarSnapshot["phase"] = snapshot.phase;
if (phase !== "idle") throw new Error("Expected inert construction");
await calendar.dispose();
