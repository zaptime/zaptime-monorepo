import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ZaptimeCalendar } from "../src/entry";
import { rescheduleConfig, rescheduleInitData, slot, reservationResponse } from "../../../tests/contracts/fixtures";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
test("reschedule forwards host override and omits payment/form collection", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-05-01T00:00:00Z"));
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => Response.json({ success: true, data: String(input).includes("init") ? rescheduleInitData : String(input).includes("time-slots") ? [slot] : reservationResponse.data })),
  );
  const confirmed = vi.fn();
  render(<ZaptimeCalendar config={rescheduleConfig} onBookingConfirmed={confirmed} />);
  fireEvent.click(await screen.findByRole("button", { name: "May 2, 2030" }));
  fireEvent.click(await screen.findByRole("button", { name: /12:00/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pick a time" }));
  expect(screen.queryByRole("textbox", { name: "Email" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reschedule" }));
  await waitFor(() => expect(confirmed).toHaveBeenCalledTimes(1));
  const put = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === "PUT");
  expect(JSON.parse(put![1]!.body as string)).toMatchObject({ overrideToken: "fixture-host-proof" });
});
