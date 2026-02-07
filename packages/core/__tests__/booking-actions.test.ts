import { createApp, h } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCalendarScope,
  provideCalendarScope,
  type CalendarScope,
} from "../src/scope/calendarScope";
import useConfig from "../src/composables/useConfig";
import useSelectedTimeSlot from "../src/composables/useSelectedTimeSlot";
import useLocations from "../src/composables/useLocations";
import { useBookingActions } from "../src/composables/useApi";

const { bookApiMock } = vi.hoisted(() => {
  return {
    bookApiMock: vi.fn(async (payload: any) => {
      return {
        success: true,
        data: {
          uuid: payload.timeSlot.start,
          userId: 1,
          userName: "Test User",
          userEmail: payload.email,
        },
      };
    }),
  };
});

vi.mock("../src/api/api", async () => {
  const actual = await vi.importActual<any>("../src/api/api");

  return {
    ...actual,
    book: bookApiMock,
  };
});

function runInScope<T>(scope: CalendarScope, factory: () => T): T {
  let result!: T;

  const app = createApp({
    setup() {
      provideCalendarScope(scope);
      result = factory();
      return () => h("div");
    },
  });

  const target = document.createElement("div");
  app.mount(target);
  app.unmount();

  return result;
}

describe("useBookingActions", () => {
  beforeEach(() => {
    bookApiMock.mockClear();
  });

  it("reads state from the active scope", async () => {
    const scopeA = createCalendarScope();
    const scopeB = createCalendarScope();

    runInScope(scopeA, () => {
      const { setConfig } = useConfig();
      const { setSelectedTimeSlot } = useSelectedTimeSlot();
      const { setLocations } = useLocations();

      setConfig({ token: "token-a", apiBaseUrl: "https://api-a.test" });
      setSelectedTimeSlot({
        calendarId: 1,
        start: "2026-01-11T10:00:00.000Z",
        end: "2026-01-11T10:30:00.000Z",
        readableType: "30 min",
        seats: 1,
        title: "A",
      });
      setLocations([{ type: "phone", value: "Phone" }]);
    });

    runInScope(scopeB, () => {
      const { setConfig } = useConfig();
      const { setSelectedTimeSlot } = useSelectedTimeSlot();
      const { setLocations } = useLocations();

      setConfig({ token: "token-b", apiBaseUrl: "https://api-b.test" });
      setSelectedTimeSlot({
        calendarId: 2,
        start: "2026-01-12T10:00:00.000Z",
        end: "2026-01-12T10:30:00.000Z",
        readableType: "30 min",
        seats: 1,
        title: "B",
      });
      setLocations([{ type: "phone", value: "Phone" }]);
    });

    const actionsA = runInScope(scopeA, () => useBookingActions());
    const actionsB = runInScope(scopeB, () => useBookingActions());

    await actionsA.book({ email: "a@example.com" });
    await actionsB.book({ email: "b@example.com" });

    expect(bookApiMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: "token-a",
        baseUrl: "https://api-a.test",
        email: "a@example.com",
        timeSlot: expect.objectContaining({ title: "A" }),
      }),
    );

    expect(bookApiMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        token: "token-b",
        baseUrl: "https://api-b.test",
        email: "b@example.com",
        timeSlot: expect.objectContaining({ title: "B" }),
      }),
    );
  });
});
