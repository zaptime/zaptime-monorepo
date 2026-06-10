import { describe, it, expect, vi } from "vitest";

// `vi.mock` is hoisted above imports, so the sample data it references must be
// created with `vi.hoisted` (also hoisted) to exist when the factory runs.
const sampleSlots = vi.hoisted(() => [
  {
    calendarId: 1,
    start: "2026-04-14T10:00:00Z",
    end: "2026-04-14T10:30:00Z",
    readableType: "online",
    seats: 1,
    title: "Slot A",
  },
  {
    calendarId: 1,
    start: "2026-04-14T11:00:00Z",
    end: "2026-04-14T11:30:00Z",
    readableType: "online",
    seats: 1,
    title: "Slot B",
  },
]);

// Mock the HTTP layer; getDays() should consume whatever the API returns.
vi.mock("../src/api/api", () => ({
  getAvailableTimeSlots: vi.fn().mockResolvedValue(sampleSlots),
}));

import { getDays, getTimeSlotsForDivenDate, getDfnsConfig } from "../src/index";

describe("getTimeSlotsForDivenDate", () => {
  it("collects only the slots whose start falls on the given day", () => {
    const date = new Date("2026-04-14T00:00:00Z");
    const result = getTimeSlotsForDivenDate(date, sampleSlots, "UTC");
    expect(result).toBeDefined();
    expect(result!.length).toBe(2);
  });

  it("returns undefined when no slot matches the day", () => {
    const date = new Date("2026-04-20T00:00:00Z");
    const result = getTimeSlotsForDivenDate(date, sampleSlots, "UTC");
    expect(result).toBeUndefined();
  });
});

describe("getDays", () => {
  it("builds a full month grid and flags that the month has time slots", async () => {
    const dfnsConfig = await getDfnsConfig("en");
    const { days, hasAnyTimeSlot } = await getDays(
      new Date("2026-04-14T12:00:00Z"),
      dfnsConfig,
      { token: "test-token", locale: { preset: "en" } },
      "UTC",
    );

    expect(hasAnyTimeSlot).toBe(true);
    // Calendar grid is always 35 or 42 cells.
    expect([35, 42]).toContain(days.length);
    // At least one in-month day carries the slots returned by the API.
    const dayWithSlots = days.find(
      (d) => d.timeSlots !== undefined && d.timeSlots.length === 2,
    );
    expect(dayWithSlots).toBeDefined();
  });

  it("reports no time slots when the API returns an empty list", async () => {
    const api = await import("../src/api/api");
    (
      api.getAvailableTimeSlots as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([]);

    const dfnsConfig = await getDfnsConfig("en");
    const { hasAnyTimeSlot } = await getDays(
      new Date("2026-04-14T12:00:00Z"),
      dfnsConfig,
      { token: "test-token", locale: { preset: "en" } },
      "UTC",
    );

    expect(hasAnyTimeSlot).toBe(false);
  });
});
