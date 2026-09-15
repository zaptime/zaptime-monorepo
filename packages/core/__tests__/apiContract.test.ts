import { afterEach, describe, expect, it, vi } from "vitest";
import { createZaptimeClient } from "../src/api/client";
import { CalendarError, RescheduleNotAllowedError, SlotNoLongerAvailableError } from "../src/api/errors";
import { fetchRemoteConfig } from "../src/api/api";
import { reconcileBooking } from "../src/api/recovery";

const status = { uuid: "r-1", loading: false };
const options = { token: "secret-token", status };
const booking = { token: options.token, email: "a@example.com", timezone: "UTC", timeSlot: { start: "2026-10-01T10:00:00Z", end: "2026-10-01T11:00:00Z" } };
const success = { success: true, data: { uuid: "r-1", userId: 1, userName: "Host", userEmail: "host@example.com" } };
const clientFor = (body: unknown, status = 200) => createZaptimeClient({ fetch: vi.fn<typeof fetch>().mockResolvedValue(Response.json(body, { status })) });
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("normalized API outcomes", () => {
  it.each([400, 500])("rejects HTTP %s even with a success body", async (statusCode) => {
    await expect(clientFor(success, statusCode).confirm(options)).rejects.toMatchObject({ code: "api" });
  });
  it("rejects a failed confirmation body", async () => {
    await expect(clientFor({ success: false }).confirm(options)).rejects.toMatchObject({ code: "api" });
  });
  it.each(["book", "reserve"] as const)("preserves %s slot conflicts", async (method) => {
    await expect(clientFor({}, 409)[method](booking)).rejects.toBeInstanceOf(SlotNoLongerAvailableError);
  });
  it("preserves reschedule denial", async () => {
    await expect(clientFor({}, 403).reschedule({ ...booking.timeSlot, timezone: "UTC", token: options.token, uuid: "r-1" })).rejects.toBeInstanceOf(RescheduleNotAllowedError);
  });
  it("reports disabled availability", async () => {
    await expect(clientFor({}, 403).getAvailableTimeSlots(options.token, "a", "b")).rejects.toMatchObject({ code: "disabled", message: "Disabled" });
  });
  it("retains a transport cause without copying credentials into the message and never retries", async () => {
    const cause = new Error("secret-token");
    const transport = vi.fn<typeof fetch>().mockRejectedValue(cause);
    const error = await createZaptimeClient({ fetch: transport })
      .confirm(options)
      .catch((e) => e);
    expect(error).toBeInstanceOf(CalendarError);
    expect(error).toMatchObject({ code: "recovery-required", cause });
    expect(error.message).not.toContain(options.token);
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it.each(["broken JSON", JSON.stringify({ success: true, data: {} })])("keeps successful unreadable mutation outcomes uncertain", async (body) => {
    const client = createZaptimeClient({ fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response(body)) });
    await expect(client.confirm(options)).rejects.toMatchObject({ code: "recovery-required" });
  });
  it("rejects malformed read JSON without mutation uncertainty", async () => {
    const client = createZaptimeClient({ fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response("broken")) });
    await expect(client.getAvailableTimeSlots(options.token, "a", "b")).rejects.toMatchObject({ code: "api" });
  });
  it("accepts verified refresh envelope and rejects failure", async () => {
    await expect(clientFor({ success: true, data: [] }).refreshReserve(options.token, status)).resolves.toBeUndefined();
    await expect(clientFor({ success: false }).refreshReserve(options.token, status)).rejects.toMatchObject({ code: "api" });
    await expect(clientFor({ success: false }).cancel(options.token, status)).rejects.toMatchObject({ code: "api" });
  });
  it("preserves configured base composition and wire payloads", async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation(async () => Response.json(success));
    const client = createZaptimeClient({ fetch: transport });
    await client.book({ ...booking, baseUrl: "https://example.test/api/", firstName: "A", guests: ["b@example.com"] });
    const [url, request] = transport.mock.calls[0];
    expect(url).toBe("https://example.test/api/reservations");
    expect(request?.method).toBe("POST");
    expect(JSON.parse(request?.body as string)).toEqual({ start: booking.timeSlot.start, end: booking.timeSlot.end, email: booking.email, timezone: "UTC", seats: 1, firstname: "A", guests: ["b@example.com"] });
  });
  it("creates payment with the existing API prefix and billing casing", async () => {
    const data = { clientSecret: "private", paymentIntentId: "pi-1", stripeAccountId: "acct-1", amount: 20 };
    const transport = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data }));
    const billingAddress = { email: "a@example.com", name: "A", company: "", address: "Street", city: "", postalCode: "123", country: "CZ", vatId: "tax", crn: "" };
    await expect(createZaptimeClient({ fetch: transport }).createPayment({ token: options.token, reservationUuid: "r-1", billingAddress })).resolves.toEqual(data);
    expect(transport.mock.calls[0][0]).toBe("https://api.zaptime.app/api/reservations/r-1/payments");
    expect(JSON.parse(transport.mock.calls[0][1]?.body as string)).toEqual({ email: billingAddress.email, name: "A", street: "Street", postalCode: "123", country: "CZ", taxId: "tax" });
  });
  it("bounds reads even when fetch ignores abort", async () => {
    vi.useFakeTimers();
    const transport = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => {}));
    const pending = createZaptimeClient({ fetch: transport }).getAvailableTimeSlots(options.token, "a", "b");
    const assertion = expect(pending).rejects.toMatchObject({ code: "network" });
    await vi.advanceTimersByTimeAsync(30_000);
    await assertion;
    expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
  it("propagates read abort and avoids sending already aborted reads", async () => {
    const controller = new AbortController();
    controller.abort();
    const transport = vi.fn<typeof fetch>();
    await expect(createZaptimeClient({ fetch: transport }).fetchRemoteConfig(options.token, undefined, undefined, controller.signal)).rejects.toMatchObject({ code: "network" });
    expect(transport).not.toHaveBeenCalled();
  });
  it("aborts an active read and clears its deadline", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const transport = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => {}));
    const pending = createZaptimeClient({ fetch: transport }).getAvailableTimeSlots(options.token, "a", "b", undefined, controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({ code: "network" });
    controller.abort();
    await assertion;
    expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("binds each instance transport and initializes using a read signal", async () => {
    const first = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: { name: "First" } }));
    const second = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: { name: "Second" } }));
    await expect(createZaptimeClient({ fetch: first }).fetchRemoteConfig(options.token, "https://example.test/", "r-1")).resolves.toEqual({ name: "First" });
    await expect(createZaptimeClient({ fetch: second }).fetchRemoteConfig(options.token)).resolves.toEqual({ name: "Second" });
    expect(first.mock.calls[0][0]).toBe("https://example.test/event-types/init");
    expect(first.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(first.mock.calls[0][1]?.body as string)).toEqual({ reservationUuid: "r-1" });
  });
  it("keeps the legacy configuration Result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ success: false })));
    expect((await fetchRemoteConfig(options.token)).isErr()).toBe(true);
  });
  it("defaults reconciliation to unsupported", async () => {
    await expect(reconcileBooking({ operationId: "op-1", operation: "book", paymentStatus: "not-started" })).resolves.toEqual({ status: "unsupported" });
  });
});
