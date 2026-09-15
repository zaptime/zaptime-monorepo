import { describe, it, expect, vi, afterEach } from "vitest";
import { createFixtureFetch, reservationResponse } from "../../../tests/contracts/fixtures";
import { CalendarError } from "../src/api/errors";
import { input, deferred, fixture } from "./bookingFixture";
afterEach(() => vi.useRealTimers());
describe("booking workflow", () => {
  it("completes free booking and isolates throwing consumers", async () => {
    const { calendar, fetcher } = await fixture();
    const events: string[] = [];
    calendar.onEvent(() => {
      throw Error("consumer");
    });
    calendar.onEvent((e) => events.push(e.type));
    expect(await calendar.actions.submit(input)).toEqual(reservationResponse);
    expect(calendar.getSnapshot().phase).toBe("success");
    expect(events.filter((e) => e === "booking-confirmed")).toHaveLength(1);
    expect(fetcher.mock.calls.filter((c) => String(c[0]).endsWith("/reservations"))).toHaveLength(1);
    await calendar.dispose();
  });
  it("rejects invalid input before mutation", async () => {
    const { calendar, fetcher } = await fixture();
    const count = fetcher.mock.calls.length;
    await expect(calendar.actions.submit({ email: "invalid" })).rejects.toMatchObject({ code: "validation" });
    expect(fetcher).toHaveBeenCalledTimes(count);
    await calendar.dispose();
  });
  it("retains paid confirmation failure and never repeats payment", async () => {
    const payment = { confirm: vi.fn().mockResolvedValue({ status: "succeeded", paymentIntentId: "pi_test" }) };
    const { calendar } = await fixture({ paid: true, failConfirmation: true, payment });
    await expect(calendar.actions.submit(input)).rejects.toThrow();
    expect(calendar.getSnapshot().phase).toBe("recovery-required");
    await expect(calendar.actions.submit(input)).rejects.toMatchObject({ code: "recovery-required" });
    expect(payment.confirm).toHaveBeenCalledTimes(1);
    await calendar.dispose();
  });
  it("reuses identical promises and rejects conflicting mutations", async () => {
    const gate = deferred<Response>();
    const transport = createFixtureFetch();
    const { calendar } = await fixture({ fetch: (url, init) => (String(url).endsWith("/reservations") ? gate.promise : transport(url, init)) });
    const first = calendar.actions.submit(input);
    expect(calendar.actions.submit({ ...input })).toBe(first);
    await expect(calendar.actions.reserve(input)).rejects.toMatchObject({ code: "busy" });
    gate.resolve(Response.json(reservationResponse));
    await first;
    await calendar.dispose();
  });
  it("retains definite payment failure without unverified automatic cancellation", async () => {
    const { calendar, fetcher } = await fixture({ paid: true, payment: { confirm: async () => ({ status: "failed", error: new CalendarError("payment-failed", "declined") }) } });
    await expect(calendar.actions.submit(input)).rejects.toMatchObject({ code: "payment-failed" });
    expect(calendar.getSnapshot().recovery?.paymentStatus).toBe("failed");
    expect(fetcher.mock.calls.some((c) => c[1]?.method === "DELETE")).toBe(false);
    await calendar.dispose();
  });
});
it("paid success orders reserve, payment, confirmation and success effects", async () => {
  const payment = { confirm: vi.fn().mockResolvedValue({ status: "succeeded", paymentIntentId: "pi_test" }) };
  const { calendar, fetcher } = await fixture({ paid: true, payment });
  await calendar.actions.setConfig({ redirectAfterBookingUrl: "https://example.test/done" });
  const events: string[] = [];
  calendar.onEvent((e) => {
    events.push(e.type);
    if (e.type === "booking-confirmed") expect(calendar.getSnapshot().view).toBe("success");
  });
  await calendar.actions.submit(input);
  expect(
    fetcher.mock.calls
      .filter((c) => c[1]?.method === "POST")
      .map((c) => new URL(String(c[0])).pathname)
      .slice(-3),
  ).toEqual(["/reservations/prepare", "/api/reservations/r-test/payments", "/reservations/r-test/confirm"]);
  expect(events.slice(-4)).toEqual(["view-changed", "booking-confirmed", "analytics", "redirect-requested"]);
  expect(payment.confirm).toHaveBeenCalledTimes(1);
  await calendar.dispose();
});
it("reschedules a paid event without payment", async () => {
  const payment = { confirm: vi.fn() };
  const transport = createFixtureFetch({ paid: true });
  const { calendar, fetcher } = await fixture({ paid: true, payment, fetch: (url, init) => (init?.method === "PUT" ? Promise.resolve(Response.json(reservationResponse)) : transport(url, init)) });
  calendar.actions.setSelectedReservation({ uuid: "r-test", email: input.email, start: "2026-01-01", end: "2026-01-02", status: "confirmed" });
  await calendar.actions.submit();
  expect(payment.confirm).not.toHaveBeenCalled();
  expect(fetcher.mock.calls.some((c) => c[1]?.method === "PUT")).toBe(true);
  await calendar.dispose();
});
it("granular reserve and confirm use saved attendee details", async () => {
  const { calendar } = await fixture();
  await calendar.actions.reserve(input);
  await expect(calendar.actions.confirm({ firstName: "Updated" })).resolves.toEqual(reservationResponse);
  await calendar.dispose();
});
it("locks slot and identity immediately and snapshots caller inputs", async () => {
  const gate = deferred<Response>();
  const transport = createFixtureFetch();
  const { calendar, fetcher } = await fixture({ fetch: (url, init) => (String(url).endsWith("/reservations") ? gate.promise : transport(url, init)) });
  const data = { email: input.email, firstName: "Before" };
  const pending = calendar.actions.book(data);
  data.firstName = "After";
  expect(() => calendar.actions.setSelectedTimeSlot(undefined)).toThrow();
  expect(() => calendar.actions.setConfig({ token: "different" })).toThrow();
  await Promise.resolve();
  expect(JSON.parse(String(fetcher.mock.calls.find((c) => String(c[0]).endsWith("/reservations"))?.[1]?.body)).firstname).toBe("Before");
  gate.resolve(Response.json(reservationResponse));
  await pending;
  await calendar.dispose();
});
it("submits the reservation loaded during reschedule initialization", async () => {
  const { rescheduleInitData } = await import("../../../tests/contracts/fixtures");
  const transport = createFixtureFetch({ paid: true });
  const payment = { confirm: vi.fn() };
  const { calendar, fetcher } = await fixture({
    payment,
    fetch: (url, init) =>
      String(url).endsWith("/event-types/init")
        ? Promise.resolve(Response.json({ success: true, data: rescheduleInitData }))
        : init?.method === "PUT"
          ? Promise.resolve(Response.json(reservationResponse))
          : transport(url, init),
  });
  await expect(calendar.actions.submit()).resolves.toEqual(reservationResponse);
  expect(fetcher.mock.calls.some((c) => c[1]?.method === "PUT")).toBe(true);
  expect(payment.confirm).not.toHaveBeenCalled();
  await calendar.dispose();
});
it("missing payment fields fail before reserving", async () => {
  const { calendar, fetcher } = await fixture({ paid: true });
  await expect(calendar.actions.submit(input)).rejects.toMatchObject({ code: "payment-failed" });
  expect(fetcher.mock.calls.some((c) => String(c[0]).endsWith("/reservations/prepare"))).toBe(false);
  await calendar.dispose();
});
