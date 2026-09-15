import { createCalendar } from "../../src/calendar/createCalendar";
import type { CalendarInstance, CreateCalendarOptions } from "../../src/calendar/types";
import { config, createFixtureFetch } from "../../../../tests/contracts/fixtures";

export function createTestCalendar(overrides: Partial<CreateCalendarOptions> = {}): CalendarInstance {
  return createCalendar({
    ...overrides,
    config: overrides.config ?? config,
    runtime: {
      fetch: createFixtureFetch(),
      now: () => new Date("2030-05-01T00:00:00Z"),
      getTimezone: () => "UTC",
      getHourCycle: () => "h23",
      ...overrides.runtime,
    },
  });
}
