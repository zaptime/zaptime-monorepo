import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ZaptimeCalendar } from "../src/entry";
import { config, initData, slot } from "../../../tests/contracts/fixtures";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-05-01T00:00:00Z"));
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => Response.json({ success: true, data: String(input).includes("init") ? initData : [slot] })),
  );
});
test("SSR renders deterministic loading without network", () => {
  const html = renderToString(<ZaptimeCalendar config={config} />);
  expect(html).toContain("Loading");
  expect(fetch).not.toHaveBeenCalled();
});
test("loads, selects date and time, forwards callbacks once", async () => {
  const loaded = vi.fn(),
    changed = vi.fn();
  render(<ZaptimeCalendar config={{ ...config, externalBooking: true }} onCalendarLoaded={loaded} onTimeSlotChanged={changed} />);
  fireEvent.click(await screen.findByRole("button", { name: "May 2, 2030" }));
  fireEvent.click(await screen.findByRole("button", { name: /12:00/ }));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed.mock.calls[0][0]).toEqual(slot);
  expect(loaded).toHaveBeenCalledTimes(1);
});
test("two roots own their preferences and unique labels", async () => {
  render(
    <>
      <ZaptimeCalendar config={config} calendarId="one" />
      <ZaptimeCalendar config={config} calendarId="two" />
    </>,
  );
  await waitFor(() => expect(screen.getAllByLabelText("Timezone")).toHaveLength(2));
  const roots = screen.getAllByRole("region", { name: "Booking calendar" });
  fireEvent.change(within(roots[0]).getByLabelText("Timezone"), { target: { value: "America/New_York" } });
  await waitFor(() => expect((within(roots[0]).getByLabelText("Timezone") as HTMLSelectElement).value).toBe("America/New_York"));
  expect((within(roots[1]).getByLabelText("Timezone") as HTMLSelectElement).value).not.toBe("America/New_York");
  expect(new Set(screen.getAllByLabelText("Timezone").map((n) => n.id)).size).toBe(2);
});
test("disabled and initialization failures are accessible", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(Response.json({ success: true, data: { ...initData, disabled: true } }));
  render(<ZaptimeCalendar config={config} />);
  expect(await screen.findByRole("status")).toBeTruthy();
  await screen.findByText("This calendar is currently unavailable.");
  cleanup();
  vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 500 }));
  render(<ZaptimeCalendar config={config} />);
  expect(await screen.findByRole("alert")).toBeTruthy();
});
test("announces deferred month loading and preserves compact theme changes", async () => {
  const { rerender } = render(<ZaptimeCalendar config={config} />);
  await screen.findByRole("button", { name: "May 2, 2030" });
  let release!: (r: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getByRole("status").textContent).toContain("Loading");
  release(Response.json({ success: true, data: [] }));
  await screen.findByText("June 2030");
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  rerender(<ZaptimeCalendar config={{ ...config, compact: true, theme: { mode: "dark", colors: { accentBase: "#ff0000" } } }} />);
  await waitFor(() => expect(screen.getByRole("region").getAttribute("data-compact")).toBe("true"));
  expect(screen.getByRole("region").className).toContain("dark");
  expect(screen.getByRole("region").style.getPropertyValue("--c-zaptime-accent-base")).toBe("#ff0000");
});
