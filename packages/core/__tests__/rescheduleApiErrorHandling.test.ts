import { describe, it, expect, vi, afterEach } from "vitest";
import { reschedule, RescheduleNotAllowedError } from "../src/api/api";

const rescheduleParams = {
  start: "2026-07-29T11:30:00+02:00",
  end: "2026-07-29T12:30:00+02:00",
  uuid: "test-uuid",
  token: "test-token",
  timezone: "Europe/Prague",
};

function stubFetch(status: number, body: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("reschedule API error handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws RescheduleNotAllowedError when the API refuses with 403", async () => {
    // Laravel aborts with 403 when canReschedule() fails (notice period
    // violated, reservation already started, or rescheduling disabled).
    stubFetch(403, { message: "Forbidden" });

    await expect(reschedule(rescheduleParams)).rejects.toBeInstanceOf(RescheduleNotAllowedError);
  });

  it("throws on a non-2xx response", async () => {
    stubFetch(500, { message: "Server Error" });

    await expect(reschedule(rescheduleParams)).rejects.toThrow("Rescheduling time slot failed!");
  });

  it("throws when the API reports success: false", async () => {
    stubFetch(200, { success: false, data: {} });

    await expect(reschedule(rescheduleParams)).rejects.toThrow("Rescheduling time slot failed!");
  });

  it("resolves with the response payload on success", async () => {
    const payload = {
      success: true,
      data: {
        uuid: "test-uuid",
        userId: 1,
        userName: "Host",
        userEmail: "host@example.com",
      },
    };

    stubFetch(200, payload);

    await expect(reschedule(rescheduleParams)).resolves.toEqual(payload);
  });
});
