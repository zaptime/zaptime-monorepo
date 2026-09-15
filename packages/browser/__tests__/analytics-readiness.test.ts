import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { attachBrowserEffects } from "../src/analytics";
const provider = vi.hoisted(() => ({ loaded: false, initialized: false, track: vi.fn() }));
vi.mock("@analytics/google-analytics", () => ({
  default: () => ({
    name: "delayed-provider",
    initialize() {
      provider.initialized = true;
    },
    loaded: () => provider.loaded,
    track: provider.track,
  }),
}));
function calendar() {
  const events = new Set<any>(),
    changes = new Set<any>();
  let analytics = [{ name: "google-analytics", data: { measurementId: "FIRST" } }];
  return {
    getSnapshot: () => ({ analytics }),
    subscribe: (fn: any) => {
      changes.add(fn);
      return () => changes.delete(fn);
    },
    onEvent: (fn: any) => {
      events.add(fn);
      return () => events.delete(fn);
    },
    emit: () => events.forEach((fn) => fn({ type: "analytics", payload: { name: "booking", properties: {} } })),
    replace: () => {
      analytics = [{ name: "google-analytics", data: { measurementId: "SECOND" } }];
      changes.forEach((fn) => fn());
    },
  };
}
beforeEach(() => {
  provider.loaded = false;
  provider.initialized = false;
  provider.track.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
});
it("does not deliver SDK-queued events after unsubscribe when a real provider becomes ready", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any);
  c.emit();
  await vi.waitFor(() => expect(provider.initialized).toBe(true));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(provider.track).not.toHaveBeenCalled();
  off();
  provider.loaded = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(provider.track).not.toHaveBeenCalled();
});
it("drops queued events from an obsolete remote configuration", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any);
  c.emit();
  await vi.waitFor(() => expect(provider.initialized).toBe(true));
  await new Promise((resolve) => setTimeout(resolve, 50));
  c.replace();
  provider.loaded = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(provider.track).not.toHaveBeenCalled();
  c.emit();
  await vi.waitFor(() => expect(provider.track).toHaveBeenCalledTimes(1));
  off();
});
it("unsubscribes synchronously when a provider never becomes ready", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any);
  c.emit();
  await vi.waitFor(() => expect(provider.initialized).toBe(true));
  expect(off()).toBeUndefined();
  expect(off()).toBeUndefined();
  provider.loaded = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(provider.track).not.toHaveBeenCalled();
});
