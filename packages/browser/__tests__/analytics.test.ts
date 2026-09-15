import { expect, it, vi, beforeEach } from "vitest";
import { attachBrowserEffects } from "../src/analytics";
const sdk = vi.hoisted(() => ({ create: vi.fn(), track: vi.fn(), ga: vi.fn(), gtm: vi.fn() }));
vi.mock("analytics", () => ({ default: sdk.create }));
vi.mock("@analytics/google-analytics", () => ({ default: sdk.ga }));
vi.mock("@analytics/google-tag-manager", () => ({ default: sdk.gtm }));
function calendar() {
  const listeners = new Set<any>();
  const changes = new Set<any>();
  let analytics: any[] | undefined;
  return {
    getSnapshot: () => ({ analytics }),
    onEvent: (fn: any) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    subscribe: (fn: any) => {
      changes.add(fn);
      return () => changes.delete(fn);
    },
    emit: (event: any) => listeners.forEach((fn) => fn(event)),
    configure: (value: any[]) => {
      analytics = value;
      changes.forEach((fn) => fn());
    },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  sdk.create.mockReturnValue({
    track: sdk.track,
    ready: (callback: () => void) => {
      callback();
      return () => {};
    },
  });
  sdk.ga.mockReturnValue({ name: "ga" });
  sdk.gtm.mockReturnValue({ name: "gtm" });
});
it("configures remote integrations once and delivers each event once", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any, {});
  c.configure([
    { name: "google-analytics", data: { measurementId: "G_TEST" } },
    { name: "google-tag-manager", data: { containerId: "GTM_TEST" } },
  ]);
  c.emit({ type: "analytics", payload: { name: "booking-confirmed", properties: { eventTypeName: "Consultation" } } });
  await vi.waitFor(() => expect(sdk.track).toHaveBeenCalledTimes(1));
  c.configure([
    { name: "google-analytics", data: { measurementId: "G_TEST" } },
    { name: "google-tag-manager", data: { containerId: "GTM_TEST" } },
  ]);
  expect(sdk.create).toHaveBeenCalledTimes(1);
  expect(sdk.ga).toHaveBeenCalledWith({ measurementIds: ["G_TEST"], enabled: true });
  off();
  c.emit({ type: "analytics", payload: { name: "ignored", properties: {} } });
  expect(sdk.track).toHaveBeenCalledTimes(1);
});
it("uses injected navigation once and detaches idempotently", () => {
  const c = calendar(),
    navigate = vi.fn();
  const off = attachBrowserEffects(c as any, { navigate });
  c.emit({ type: "redirect-requested", payload: { url: "https://example.com/thanks" } });
  expect(navigate).toHaveBeenCalledExactlyOnceWith("https://example.com/thanks");
  off();
  off();
  c.emit({ type: "redirect-requested", payload: { url: "https://example.com/thanks" } });
  expect(navigate).toHaveBeenCalledTimes(1);
});
it("drops queued effects after unsubscribe and never forwards sensitive properties", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any, { analytics: [{ name: "google-analytics", data: { measurementId: "G_TEST" } }] });
  c.emit({ type: "analytics", payload: { name: "booking", properties: { clientSecret: "secret", email: "private", billingAddress: { name: "private" }, eventTypeName: "Public" } } });
  await vi.waitFor(() => expect(sdk.track).toHaveBeenCalledTimes(1));
  expect(sdk.track.mock.calls[0]).toEqual(["booking", { eventTypeName: "Public" }]);
  off();
});
it("drops an event queued while the lazy integration is loading", async () => {
  const c = calendar();
  const off = attachBrowserEffects(c as any, { analytics: [{ name: "google-analytics", data: { measurementId: "G_TEST" } }] });
  c.emit({ type: "analytics", payload: { name: "booking", properties: {} } });
  off();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(sdk.track).not.toHaveBeenCalled();
});
it("releases readiness listeners and timeout immediately on cleanup", async () => {
  vi.useFakeTimers();
  try {
    const detach = vi.fn();
    const ready = vi.fn(() => detach);
    sdk.create.mockReturnValue({ track: sdk.track, ready });
    const c = calendar();
    const off = attachBrowserEffects(c as any, { analytics: [{ name: "google-analytics", data: { measurementId: "G_TEST" } }] });
    c.emit({ type: "analytics", payload: { name: "booking", properties: {} } });
    await vi.advanceTimersByTimeAsync(0);
    expect(ready).toHaveBeenCalledTimes(1);
    off();
    expect(detach).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(30000);
    expect(sdk.track).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
it("drops analytics when SDK readiness registration fails", async () => {
  sdk.create.mockReturnValue({
    track: sdk.track,
    ready: () => {
      throw new Error("Provider unavailable");
    },
  });
  const c = calendar();
  const off = attachBrowserEffects(c as any, { analytics: [{ name: "google-analytics", data: { measurementId: "G_TEST" } }] });
  c.emit({ type: "analytics", payload: { name: "booking", properties: {} } });
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(sdk.track).not.toHaveBeenCalled();
  off();
});
