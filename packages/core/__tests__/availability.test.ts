import { it, expect } from "vitest";
import { createCalendar } from "../src/calendar/createCalendar";
import { fixture, response, remote, slot } from "./initialization.fixtures";
it("compares selected days by canonical date and clears slots on day changes", async () => {
  const { calendar } = fixture();
  await calendar.init();
  const day = calendar.getSnapshot().calendar.selectedDay!;
  expect(calendar.selectors.isSelectedDay({ ...day })).toBe(true);
  calendar.actions.setSelectedTimeSlot(slot);
  calendar.actions.dayClicked(calendar.getSnapshot().calendar.days.find((d) => d.label === "17" && d.date)!);
  expect(calendar.getSnapshot().selectedTimeSlot).toBeUndefined();
  expect(calendar.getSnapshot().calendar.timeSlots).toEqual([]);
});
it("uses timezone calendar month boundaries including leap day", async () => {
  const urls: string[] = [];
  const calendar = createCalendar({
    config: { token: "x", max: 0 },
    runtime: {
      now: () => new Date("2024-03-01T00:30:00Z"),
      getTimezone: () => "America/Los_Angeles",
      fetch: async (url) => {
        urls.push(String(url));
        return response(String(url).includes("init") ? remote : []);
      },
    },
  });
  await calendar.init();
  expect(urls[1]).toContain("from=2024-02-01");
  expect(urls[1]).toContain("until=2024-02-29");
  expect(calendar.getSnapshot().calendar.days.filter((d) => d.date)).toHaveLength(29);
  expect(calendar.selectors.nextDisabled()).toBe(true);
});
it("ignores an old month response after the next month resolves", async () => {
  const { calendar, fetch } = fixture();
  await calendar.init();
  let resolve!: (r: Response) => void;
  fetch.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const a = calendar.actions.getDays();
  const october = { ...slot, start: "2026-10-16T10:00:00Z", end: "2026-10-16T11:00:00Z" };
  fetch.mockImplementationOnce(async () => response([october]));
  await calendar.actions.next();
  const snapshot = calendar.getSnapshot();
  resolve(response([slot]));
  await a;
  expect(calendar.getSnapshot()).toBe(snapshot);
  expect(calendar.getSnapshot().calendar.timeSlots[0].start).toBe(october.start);
});
it("buckets by full canonical date across DST and never matches another month", async () => {
  const slots = [
    { ...slot, start: "2026-03-29T00:30:00Z" },
    { ...slot, start: "2026-03-29T01:30:00Z" },
    { ...slot, start: "2026-04-29T01:30:00Z" },
  ];
  const calendar = createCalendar({
    config: { token: "x", max: 0 },
    runtime: { now: () => new Date("2026-03-01T00:00:00Z"), getTimezone: () => "Europe/Prague", fetch: async (url) => response(String(url).includes("init") ? remote : slots) },
  });
  await calendar.init();
  const day = calendar.getSnapshot().calendar.days.find((d) => d.date && d.label === "29")!;
  expect(day.timeSlots).toHaveLength(2);
  expect(day.date?.toISOString()).toBe("2026-03-28T23:00:00.000Z");
});
it("retains or invalidates a selected instant when changing timezone", async () => {
  const { calendar } = fixture();
  await calendar.init();
  calendar.actions.setSelectedTimeSlot(slot);
  await calendar.actions.setTimezone("Pacific/Honolulu");
  expect(calendar.getSnapshot().selectedTimeSlot?.start).toBe(slot.start);
  expect(calendar.getSnapshot().clientOriginalTimezone).toBe("UTC");
});
it("preserves closest-day and previous-month bounds and clears unavailable selection once", async () => {
  const { calendar, fetch } = fixture();
  await calendar.init();
  await calendar.actions.setConfig({ min: 0, closestBookableDay: 2 });
  expect(calendar.selectors.prevDisabled()).toBe(true);
  expect(String(fetch.mock.calls.at(-1)?.[0])).toContain("from=2026-09-17");
  calendar.actions.setSelectedTimeSlot(slot);
  const events: unknown[] = [];
  calendar.onEvent((event) => {
    if (event.type === "time-slot-changed") events.push(event.payload);
  });
  await calendar.actions.getDays();
  await calendar.actions.getDays();
  expect(calendar.getSnapshot().selectedTimeSlot).toBeUndefined();
  expect(events).toEqual([undefined]);
});
it("publishes coherent selection snapshots on refresh and day clicks", async () => {
  const { calendar, fetch } = fixture();
  await calendar.init();
  calendar.actions.setSelectedTimeSlot(slot);
  const observed: ReturnType<typeof calendar.getSnapshot>[] = [];
  calendar.subscribe(() => observed.push(calendar.getSnapshot()));
  fetch.mockImplementationOnce(async () => response([]));
  await calendar.actions.getDays();
  for (const s of observed) if (s.selectedTimeSlot) expect(s.calendar.timeSlots.some((time) => time.start === s.selectedTimeSlot!.start)).toBe(true);
  await calendar.actions.getDays();
  calendar.actions.setSelectedTimeSlot(slot);
  observed.length = 0;
  calendar.actions.dayClicked(calendar.getSnapshot().calendar.days.find((d) => d.date && d.label === "17")!);
  expect(observed).toHaveLength(1);
  expect(observed[0].selectedTimeSlot).toBeUndefined();
  expect(observed[0].calendar.selectedDay?.label).toBe("17");
});
it("rejects availability actions while busy and discards a read overtaken by submission", async () => {
  const { createCalendarContext } = await import("../src/calendar/lifecycle");
  const { createInitialization } = await import("../src/calendar/initialization");
  let resolve!: (r: Response) => void;
  let deferred = false;
  const context = createCalendarContext({
    config: { token: "x", max: 1 },
    runtime: {
      now: () => new Date("2026-09-15T12:00:00Z"),
      getTimezone: () => "UTC",
      fetch: async (url) => (String(url).includes("init") ? response(remote) : deferred ? new Promise((r) => (resolve = r)) : response([slot])),
    },
  });
  const calendar = createInitialization(context);
  await calendar.init();
  deferred = true;
  const old = calendar.actions.getDays();
  context.store.commit({ phase: "submitting" });
  const busy = context.store.getSnapshot();
  for (const action of [calendar.actions.getDays, calendar.actions.next, calendar.actions.prev]) await expect(action()).rejects.toMatchObject({ code: "busy" });
  expect(context.store.getSnapshot()).toBe(busy);
  context.store.commit({ phase: "ready" });
  const current = context.store.getSnapshot();
  resolve(response([]));
  await old;
  expect(context.store.getSnapshot()).toBe(current);
});
