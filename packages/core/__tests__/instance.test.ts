// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import { createTestCalendar } from "./helpers/createTestCalendar";
import type { CalendarInstance } from "../src/calendar/types";
import { slot } from "../../../tests/contracts/fixtures";

const instances: CalendarInstance[] = [];
function calendar(overrides: Parameters<typeof createTestCalendar>[0] = {}) {
  const instance = createTestCalendar(overrides);
  instances.push(instance);
  return instance;
}
afterEach(async () => {
  await Promise.all(instances.splice(0).map((instance) => instance.dispose()));
  vi.restoreAllMocks();
});

test("construction, snapshot reads and subscription do not perform runtime effects", () => {
  const effect = vi.fn(() => {
    throw new Error("unexpected runtime effect");
  });
  const a = calendar({ runtime: { fetch: effect, now: effect, getTimezone: effect, getHourCycle: effect, createOperationId: effect, schedule: effect, unschedule: effect } });
  a.subscribe(() => {});
  a.onEvent(() => {});
  expect(a.getSnapshot()).toMatchObject({ phase: "idle", timezone: "UTC", hourCycle: "h23", calendar: { loading: true, initLoaded: false } });
  expect(a.getSnapshot().calendar.date.getTime()).toBe(0);
  expect(effect).not.toHaveBeenCalled();
});

test("publishes stable immutable snapshots and isolates same-config instances", () => {
  const config = { token: "synthetic", locale: { preset: "en", texts: { chooseDate: "Choose" } } };
  const a = calendar({ config });
  const b = calendar({ config });
  const initial = a.getSnapshot();
  const actions = a.actions;
  const selected = { ...slot };
  config.token = "changed";
  config.locale.texts.chooseDate = "Changed";
  a.actions.setSelectedTimeSlot(selected);
  selected.start = "changed";
  expect(a.getSnapshot()).toBe(a.getSnapshot());
  expect(a.actions).toBe(actions);
  expect(a.getSnapshot().revision).toBe(1);
  expect(a.getSnapshot().selectedTimeSlot).toEqual(slot);
  expect(a.getSnapshot().config.token).toBe("synthetic");
  expect(a.getSnapshot().config.locale?.texts?.chooseDate).toBe("Choose");
  expect(a.getSnapshot().calendar).toBe(initial.calendar);
  expect(b.getSnapshot().selectedTimeSlot).toBeUndefined();
  expect(initial.selectedTimeSlot).toBeUndefined();
  expect(Object.isFrozen(a.getSnapshot().selectedTimeSlot)).toBe(true);
});

test("only changed selection publishes and unsubscribe is idempotent", () => {
  const a = calendar();
  const listener = vi.fn();
  const event = vi.fn();
  const unsubscribe = a.subscribe(listener);
  const offEvent = a.onEvent(event);
  a.actions.setSelectedTimeSlot(undefined);
  expect(listener).not.toHaveBeenCalled();
  a.actions.setSelectedTimeSlot(slot);
  const selected = a.getSnapshot();
  a.actions.setSelectedTimeSlot({ ...slot });
  expect(a.getSnapshot()).toBe(selected);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(event).toHaveBeenCalledWith({ type: "time-slot-changed", payload: slot });
  unsubscribe();
  unsubscribe();
  offEvent();
  offEvent();
  a.actions.setSelectedTimeSlot(undefined);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(event).toHaveBeenCalledTimes(1);
});

test("isolates throwing listeners from other subscribers and committed state", () => {
  const a = calendar();
  const listener = vi.fn();
  const event = vi.fn();
  a.subscribe(() => {
    throw new Error("subscriber");
  });
  a.subscribe(listener);
  a.onEvent(() => {
    throw new Error("event");
  });
  a.onEvent(event);
  expect(() => a.actions.setSelectedTimeSlot(slot)).not.toThrow();
  expect(listener).toHaveBeenCalledTimes(1);
  expect(event).toHaveBeenCalledTimes(1);
  expect(a.getSnapshot().selectedTimeSlot).toEqual(slot);
});

test("disposal detaches listeners synchronously and rejects subsequent actions", async () => {
  const a = calendar();
  const listener = vi.fn();
  a.subscribe(listener);
  const disposing = a.dispose();
  expect(() => a.actions.setSelectedTimeSlot(slot)).toThrow(expect.objectContaining({ code: "disposed" }));
  await expect(a.init()).rejects.toMatchObject({ code: "disposed" });
  await disposing;
  await a.dispose();
  expect(a.getSnapshot().phase).toBe("disposed");
  expect(listener).not.toHaveBeenCalled();
});

test("booking without a selected slot rejects validation without initializing", async () => {
  const a = calendar();
  await expect(a.actions.book({ email: "attendee@example.test" })).rejects.toMatchObject({ code: "validation" });
  expect(a.getSnapshot().phase).toBe("idle");
});

test("snapshot dates cannot be changed through their setters", () => {
  const a = calendar();
  const date = a.getSnapshot().calendar.date;
  expect(() => (date as Date).setTime(42)).toThrow("readonly");
  expect(date.getTime()).toBe(0);
});
