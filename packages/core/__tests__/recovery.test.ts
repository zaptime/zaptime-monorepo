import { it, expect, vi } from "vitest";
import { fixture, input } from "./bookingFixture";
import { reservationResponse } from "../../../tests/contracts/fixtures";
it("defaults unknown payments to unsupported recovery", async () => {
  const { calendar } = await fixture({ paid: true, payment: { confirm: async () => ({ status: "unknown" }) } });
  await expect(calendar.actions.submit(input)).rejects.toMatchObject({ code: "recovery-required" });
  expect(await calendar.actions.recover()).toEqual({ status: "unsupported" });
  expect(calendar.getSnapshot().phase).toBe("recovery-required");
  await calendar.dispose();
});
it("authoritative completion preserves original operation and emits once", async () => {
  const reconcile = vi.fn().mockResolvedValue({ status: "confirmed", reservation: reservationResponse });
  const { calendar } = await fixture({ paid: true, failConfirmation: true, reconcile, payment: { confirm: async () => ({ status: "succeeded", paymentIntentId: "pi_test" }) } });
  await expect(calendar.actions.submit(input)).rejects.toThrow();
  const identity = calendar.getSnapshot().recovery;
  const events = vi.fn();
  calendar.onEvent(events);
  await calendar.actions.recover();
  expect(reconcile).toHaveBeenCalledWith(identity);
  expect(calendar.getSnapshot().phase).toBe("success");
  expect(events.mock.calls.filter((c) => c[0].type === "booking-confirmed")).toHaveLength(1);
  await calendar.dispose();
});
it("retries only authorized confirmation with original identity and no payment replay", async () => {
  let failed = true;
  const transport = (await import("../../../tests/contracts/fixtures")).createFixtureFetch({ paid: true });
  const reconcile = vi.fn().mockResolvedValue({ status: "safe-to-retry", operation: "confirm" });
  const payment = { confirm: vi.fn().mockResolvedValue({ status: "succeeded", paymentIntentId: "pi_test" }) };
  const { calendar } = await fixture({ paid: true, payment, reconcile, fetch: (url, init) => (String(url).endsWith("/confirm") && failed ? Promise.resolve(Response.json({ success: false })) : transport(url, init)) });
  await expect(calendar.actions.submit(input)).rejects.toThrow();
  const identity = calendar.getSnapshot().recovery;
  failed = false;
  expect(await calendar.actions.recover()).toEqual({ status: "confirmed", reservation: reservationResponse });
  expect(reconcile).toHaveBeenCalledWith(identity);
  expect(payment.confirm).toHaveBeenCalledTimes(1);
  await calendar.dispose();
});
it("rejects mismatched recovery identity and unauthorized new booking", async () => {
  const reconcile = vi
    .fn()
    .mockResolvedValueOnce({ status: "confirmed", reservation: { ...reservationResponse, data: { ...reservationResponse.data, uuid: "different" } } })
    .mockResolvedValueOnce({ status: "safe-to-retry", operation: "book" });
  const { calendar } = await fixture({ paid: true, payment: { confirm: async () => ({ status: "unknown" }) }, reconcile });
  await expect(calendar.actions.submit(input)).rejects.toThrow();
  await expect(calendar.actions.recover()).rejects.toMatchObject({ code: "recovery-required" });
  await expect(calendar.actions.recover()).rejects.toMatchObject({ code: "recovery-required" });
  expect(calendar.getSnapshot().phase).toBe("recovery-required");
  await calendar.dispose();
});
it("bounds reconciliation and deduplicates concurrent recovery", async () => {
  vi.useFakeTimers();
  try {
    const reconcile = vi.fn(() => new Promise<never>(() => {}));
    const { calendar } = await fixture({ paid: true, payment: { confirm: async () => ({ status: "unknown" }) }, reconcile });
    await expect(calendar.actions.submit(input)).rejects.toThrow();
    const first = calendar.actions.recover();
    expect(calendar.actions.recover()).toBe(first);
    const rejection = expect(first).rejects.toMatchObject({ code: "recovery-required" });
    await vi.advanceTimersByTimeAsync(30000);
    await rejection;
    expect(reconcile).toHaveBeenCalledTimes(1);
    expect(calendar.getSnapshot().phase).toBe("recovery-required");
    await calendar.dispose();
  } finally {
    vi.useRealTimers();
  }
});
it("lost free mutation cannot be retried without authoritative permission", async () => {
  const transport = (await import("../../../tests/contracts/fixtures")).createFixtureFetch();
  const { calendar, fetcher } = await fixture({ fetch: (url, init) => (String(url).endsWith("/reservations") ? Promise.reject(Error("lost response")) : transport(url, init)) });
  await expect(calendar.actions.book(input)).rejects.toMatchObject({ code: "recovery-required" });
  await expect(calendar.actions.book(input)).rejects.toMatchObject({ code: "recovery-required" });
  expect(await calendar.actions.recover()).toEqual({ status: "unsupported" });
  expect(fetcher.mock.calls.filter((c) => String(c[0]).endsWith("/reservations"))).toHaveLength(1);
  await calendar.dispose();
});
it("pending and definitive reconciliation failure remain unresolved without success effects", async () => {
  const error = new (await import("../src/api/errors")).CalendarError("payment-failed", "declined");
  const reconcile = vi.fn().mockResolvedValueOnce({ status: "pending" }).mockResolvedValueOnce({ status: "failed", error });
  const { calendar } = await fixture({ paid: true, payment: { confirm: async () => ({ status: "unknown" }) }, reconcile });
  await expect(calendar.actions.submit(input)).rejects.toThrow();
  const events = vi.fn();
  calendar.onEvent(events);
  expect(await calendar.actions.recover()).toEqual({ status: "pending" });
  expect(await calendar.actions.recover()).toEqual({ status: "failed", error });
  expect(calendar.getSnapshot().phase).toBe("recovery-required");
  expect(events.mock.calls.some((c) => c[0].type === "booking-confirmed")).toBe(false);
  await calendar.dispose();
});
it("retains a manually selected reschedule UUID before a lost PUT and rejects another reservation", async () => {
  const { createFixtureFetch, reservation } = await import("../../../tests/contracts/fixtures");
  const transport = createFixtureFetch();
  const reconcile = vi.fn().mockResolvedValue({ status: "confirmed", reservation: { ...reservationResponse, data: { ...reservationResponse.data, uuid: "another-reservation" } } });
  const { calendar } = await fixture({ reconcile, fetch: (url, init) => (init?.method === "PUT" ? Promise.reject(new Error("Lost PUT response")) : transport(url, init)) });
  calendar.actions.setSelectedReservation(reservation);
  await expect(calendar.actions.reschedule()).rejects.toMatchObject({ code: "recovery-required" });
  expect(calendar.getSnapshot().recovery?.reservationUuid).toBe(reservation.uuid);
  await expect(calendar.actions.recover()).rejects.toMatchObject({ code: "recovery-required" });
  expect(reconcile).toHaveBeenCalledWith(expect.objectContaining({ reservationUuid: reservation.uuid }));
  expect(calendar.getSnapshot().phase).toBe("recovery-required");
  await calendar.dispose();
});
