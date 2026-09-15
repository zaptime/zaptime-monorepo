import { describe, it, expect } from "vitest";
import { fixture, remote, slot, response } from "./initialization.fixtures";
describe("initialization", () => {
  it("is idempotent and merges remote then local and defaults", async () => {
    const { calendar, fetch } = fixture();
    const first = calendar.init();
    expect(calendar.init()).toBe(first);
    await first;
    await calendar.init();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(calendar.getSnapshot().phase).toBe("ready");
    expect(calendar.getSnapshot().config.locale?.texts?.chooseDate).toBe("Local");
    expect(calendar.getSnapshot().config.theme?.preset).toBe("basic");
    expect(calendar.getSnapshot().calendar.selectedDay?.label).toBe("16");
    expect(calendar.getSnapshot().clientOriginalHourCycle).toBe("h12");
  });
  it("does not request availability for disabled events", async () => {
    const { calendar, fetch } = fixture({ ...remote, disabled: true });
    await calendar.init();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(calendar.getSnapshot().phase).toBe("disabled");
  });
  it("resets identity and inputs", async () => {
    const { calendar } = fixture();
    await calendar.init();
    calendar.actions.setSelectedTimeSlot(slot);
    await calendar.actions.setConfig({ token: "another" });
    expect(calendar.getSnapshot().selectedTimeSlot).toBeUndefined();
    expect(calendar.getSnapshot().config.token).toBe("another");
  });
});
it("ignores initialization after reset and disposal", async () => {
  const { calendar, fetch } = fixture();
  let resolve!: (r: Response) => void;
  fetch.mockImplementationOnce(() => new Promise((r) => (resolve = r)));
  const old = calendar.init();
  await calendar.actions.setConfig({ token: "new" });
  const current = calendar.getSnapshot();
  resolve(response({ ...remote, eventTypeName: "Old" }));
  await old;
  expect(calendar.getSnapshot()).toBe(current);
  fetch.mockImplementationOnce(() => new Promise((r) => (resolve = r)));
  const pending = calendar.actions.getDays();
  await calendar.dispose();
  const disposed = calendar.getSnapshot();
  resolve(response([slot]));
  await pending;
  expect(calendar.getSnapshot()).toBe(disposed);
});
it("selects the rescheduling date without timers", async () => {
  const reservation = { start: "2026-09-18T10:00:00Z", end: "2026-09-18T11:00:00Z", uuid: "r", email: "a@example.com", status: "confirmed" };
  const { calendar, fetch } = fixture({ ...remote, reservation } as typeof remote);
  fetch.mockImplementation(async (url) => response(String(url).includes("init") ? { ...remote, reservation } : [slot, { ...slot, start: reservation.start, end: reservation.end }]));
  await calendar.init();
  expect(calendar.getSnapshot().calendar.selectedDay?.label).toBe("18");
});
it("normalizes equivalent endpoints without resetting inputs", async () => {
  const { calendar, fetch } = fixture();
  await calendar.init();
  calendar.actions.setSelectedTimeSlot(slot);
  await calendar.actions.setConfig({ apiBaseUrl: "https://api.zaptime.app" });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(calendar.getSnapshot().selectedTimeSlot).toBeDefined();
});
