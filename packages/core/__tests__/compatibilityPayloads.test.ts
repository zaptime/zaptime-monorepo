import { afterEach, describe, it, expect, vi } from "vitest";
import { book, reserve, confirm, reschedule } from "../src/api/api";
import { config, slot, reservationResponse, createFixtureFetch } from "../../../tests/contracts/fixtures";
afterEach(() => vi.unstubAllGlobals());
describe("compatibility wire payloads", () => {
  it.each([
    ["book", book],
    ["reserve", reserve],
  ] as const)("%s preserves lowercase wire names and guest/custom-field payloads", async (_name, action) => {
    const fetch = vi.fn(createFixtureFetch());
    vi.stubGlobal("fetch", fetch);
    expect(
      await action({
        token: config.token,
        baseUrl: config.apiBaseUrl,
        timeSlot: slot,
        email: "attendee@example.test",
        firstName: "Test",
        lastName: "Attendee",
        timezone: "UTC",
        seats: 2,
        guests: ["guest@example.test"],
        customFields: [{ uuid: "field-note", value: "Test note" }],
      }),
    ).toEqual(reservationResponse);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      start: "2030-05-02T10:00:00Z",
      end: "2030-05-02T10:30:00Z",
      email: "attendee@example.test",
      firstname: "Test",
      lastname: "Attendee",
      timezone: "UTC",
      seats: 2,
      guests: ["guest@example.test"],
      customFields: [{ uuid: "field-note", value: "Test note" }],
    });
  });

  it("confirmation preserves lowercase wire names", async () => {
    const fetch = vi.fn(createFixtureFetch());
    vi.stubGlobal("fetch", fetch);
    expect(await confirm({ token: config.token, baseUrl: config.apiBaseUrl, status: reservationResponse.data, firstName: "Test", lastName: "Attendee", guests: ["guest@example.test"] })).toEqual(reservationResponse);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({ firstname: "Test", lastname: "Attendee", guests: ["guest@example.test"] });
  });

  it("rescheduling forwards the host override as overrideToken", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(reservationResponse));
    vi.stubGlobal("fetch", fetch);
    await reschedule({ start: slot.start, end: slot.end, uuid: "r-test", token: config.token, baseUrl: config.apiBaseUrl, timezone: "UTC", overrideToken: "fixture-host-proof" });
    expect(fetch.mock.calls[0][0]).toBe("https://booking.example.test/reservations/r-test");
    expect(fetch.mock.calls[0][1]?.method).toBe("PUT");
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({ start: slot.start, end: slot.end, timezone: "UTC", overrideToken: "fixture-host-proof" });
  });

  it("rejects unknown fixture requests instead of fabricating successful bookings", async () => {
    await expect(createFixtureFetch()("https://booking.example.test/unknown", { method: "DELETE" })).rejects.toThrow("Unexpected fixture request: DELETE /unknown");
  });
});
