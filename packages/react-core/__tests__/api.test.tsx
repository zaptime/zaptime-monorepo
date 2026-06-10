import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub the pure HTTP layer so we can assert what the stateful wrappers forward.
vi.mock("../../core-shared/src/api/api", () => ({
  book: vi.fn().mockResolvedValue({
    success: true,
    data: { uuid: "res-1", userId: 1, userName: "U", userEmail: "u@e.com" },
  }),
  reserve: vi.fn().mockResolvedValue({
    success: true,
    data: { uuid: "res-2", userId: 1, userName: "U", userEmail: "u@e.com" },
  }),
  confirm: vi.fn(),
  cancel: vi.fn(),
  reschedule: vi.fn(),
  refreshReserve: vi.fn(),
  fetchRemoteConfig: vi.fn(),
  getAvailableTimeSlots: vi.fn().mockResolvedValue([]),
}));

import * as sharedApi from "../../core-shared/src/api/api";
import { book, reserve, stopReservationRefresh } from "../src/api/useApi";
import { setSelectedTimeSlotValue } from "../src/hooks/useSelectedTimeSlot";
import { setConfigValue } from "../src/hooks/useConfig";

const slot = {
  calendarId: 1,
  start: "2026-04-14T10:00:00Z",
  end: "2026-04-14T10:30:00Z",
  readableType: "online",
  seats: 1,
  title: "Slot",
};

describe("imperative API (react-core)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stopReservationRefresh();
  });

  it("book() forwards the selected time slot and config token to the pure API", async () => {
    const id = "rc-book-" + Date.now();
    setConfigValue(id, { token: "tok_123" });
    setSelectedTimeSlotValue(id, slot);

    const res = await book({ email: "a@b.com", calendarId: id });

    expect(res.success).toBe(true);
    expect(vi.mocked(sharedApi.book)).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(sharedApi.book).mock.calls[0][0];
    expect(arg.token).toBe("tok_123");
    expect(arg.email).toBe("a@b.com");
    expect(arg.timeSlot.start).toBe(slot.start);
  });

  it("book() throws when no time slot is selected", async () => {
    const id = "rc-book-empty-" + Date.now();
    setConfigValue(id, { token: "tok" });
    setSelectedTimeSlotValue(id, undefined);

    await expect(book({ email: "a@b.com", calendarId: id })).rejects.toThrow();
    expect(vi.mocked(sharedApi.book)).not.toHaveBeenCalled();
  });

  it("reserve() calls the pure reserve API and stores the reservation status", async () => {
    const id = "rc-reserve-" + Date.now();
    setConfigValue(id, { token: "tok_r" });
    setSelectedTimeSlotValue(id, slot);

    const res = await reserve({ email: "a@b.com", calendarId: id });
    stopReservationRefresh();

    expect(res.data.uuid).toBe("res-2");
    expect(vi.mocked(sharedApi.reserve)).toHaveBeenCalledTimes(1);
  });
});
