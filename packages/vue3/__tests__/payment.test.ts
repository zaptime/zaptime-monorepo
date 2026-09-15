import { afterEach, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import Calendar from "../src/App.vue";
import { useCalendar, useCalendarViewState, useBookingForm, useBillingAddress } from "@zaptime/vue-headless";
import { config, slot, customFields, createFixtureFetch, rescheduleInitData } from "../../../tests/contracts/fixtures";
const driver = vi.hoisted(() => ({ mount: vi.fn(async () => {}), dispose: vi.fn(async () => {}), confirm: vi.fn(async () => ({ status: "succeeded" })) }));
const factory = vi.hoisted(() => vi.fn());
vi.mock("@zaptime/browser", () => ({
  attachBrowserEffects: () => () => {},
  createStripePaymentDriver: (options: unknown) => {
    factory(options);
    return driver;
  },
}));
function paidFetch(failConfirmation = false): typeof fetch {
  const fixture = createFixtureFetch({ paid: true, failConfirmation });
  return async (input, init) => (String(input).includes("/payments") ? Response.json({ success: true, data: { clientSecret: "fixture-only-secret" } }) : fixture(input, init));
}
const apps: ReturnType<typeof createApp>[] = [];
const flush = async () => {
  for (let i = 0; i < 12; i++) await new Promise((r) => setTimeout(r, 0));
  await nextTick();
};
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount());
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  driver.confirm.mockResolvedValue({ status: "succeeded" });
});
async function mount(id: string, events = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(Calendar, { config: { ...config, stripePublishableKey: "pk_test_fixture" }, calendarId: id, ...events });
  apps.push(app);
  app.mount(host);
  await flush();
  useCalendar(id).selectTimeSlot(slot);
  useBookingForm(id).setBookingForm(customFields);
  useCalendarViewState(id).setView("form");
  await flush();
  return host;
}
it("mounts independent Stripe element references and preserves billing edits", async () => {
  vi.stubGlobal("fetch", paidFetch());
  const first = await mount("first"),
    second = await mount("second");
  expect(factory).toHaveBeenCalledTimes(2);
  const a = factory.mock.calls[0][0],
    b = factory.mock.calls[1][0];
  expect(a.elements.cardNumber).not.toBe(b.elements.cardNumber);
  expect(first.contains(a.elements.cardNumber)).toBe(true);
  expect(second.contains(b.elements.cardNumber)).toBe(true);
  expect(driver.mount).toHaveBeenCalledTimes(2);
  useBillingAddress("first").billingAddress.value.company = "First company";
  expect(useBillingAddress("second").billingAddress.value.company).toBe("");
});
it("confirms paid booking once and keeps paid-but-unconfirmed recovery visible without charging again", async () => {
  const fetch = vi.fn(paidFetch(true));
  vi.stubGlobal("fetch", fetch);
  const confirmed = vi.fn(),
    recovery = vi.fn();
  const host = await mount("paid", { onBookingConfirmed: confirmed, onRecoveryRequired: recovery });
  host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flush();
  expect(driver.confirm).toHaveBeenCalledTimes(1);
  expect(confirmed).not.toHaveBeenCalled();
  expect(recovery).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain("Do not pay again");
  host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flush();
  expect(driver.confirm).toHaveBeenCalledTimes(1);
  expect(useCalendarViewState("paid").view.value).toBe("form");
});
it("renders reschedule rejection without emitting booking-confirmed", async () => {
  const fixture = createFixtureFetch();
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) =>
    String(input).endsWith("/event-types/init") ? Response.json({ success: true, data: rescheduleInitData }) : init?.method === "PUT" ? Response.json({ success: false }, { status: 403 }) : fixture(input, init),
  );
  const confirmed = vi.fn();
  const host = await mount("reschedule", { onBookingConfirmed: confirmed });
  host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flush();
  expect(confirmed).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});
it("renders a definite payment failure without success", async () => {
  const { CalendarError } = await import("@zaptime/core");
  driver.confirm.mockResolvedValue({ status: "failed", error: new CalendarError("payment-failed", "Card declined") } as never);
  vi.stubGlobal("fetch", paidFetch());
  const confirmed = vi.fn();
  const host = await mount("declined", { onBookingConfirmed: confirmed });
  host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flush();
  expect(confirmed).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Payment failed");
  expect(driver.confirm).toHaveBeenCalledTimes(1);
});
