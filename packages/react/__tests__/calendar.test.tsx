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
  expect(screen.queryByRole("button", { name: "Next month" })).toBeNull();
  expect(screen.queryByText(/1970/)).toBeNull();
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
test("keyboard focus follows available dates", async () => {
  vi.mocked(fetch).mockImplementation(async (input) => Response.json({ success: true, data: String(input).includes("init") ? initData : [slot, { ...slot, start: "2030-05-03T10:00:00Z", end: "2030-05-03T10:30:00Z" }] }));
  render(<ZaptimeCalendar config={config} />);
  const first = await screen.findByRole("button", { name: "May 2, 2030" });
  first.focus();
  fireEvent.keyDown(first, { key: "ArrowRight" });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "May 3, 2030" }));
});
test("dark mode activates prefixed Tailwind rules and meeting metadata shows price and platform", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({ success: true, data: { ...initData, locations: [{ type: "google-meet", value: "" }], stripeConfig: { price: 1234, currency: "USD", stripeAccountId: "acct_fixture" } } }),
  );
  render(<ZaptimeCalendar config={{ ...config, theme: { mode: "dark" } }} />);
  await screen.findByRole("button", { name: "May 2, 2030" });
  expect(screen.getByRole("region", { name: "Booking calendar" }).classList.contains("cal-dark")).toBe(true);
  expect(screen.getByText("Google Meet")).toBeTruthy();
  expect(screen.getByText("$12.34")).toBeTruthy();
});
test("compact keyboard date selection moves focus into time pane", async () => {
  render(<ZaptimeCalendar config={{ ...config, compact: true }} />);
  const day = await screen.findByRole("button", { name: "May 2, 2030" });
  day.focus();
  fireEvent.click(day);
  await waitFor(() => expect(document.activeElement?.tagName).toBe("H2"));
  expect(document.activeElement?.textContent).toContain("May 2");
});
test("compact empty month explains availability and offers next month", async () => {
  vi.mocked(fetch).mockImplementation(async (input) => Response.json({ success: true, data: String(input).includes("init") ? initData : [] }));
  render(<ZaptimeCalendar config={{ ...config, compact: true }} />);
  expect(await screen.findByRole("button", { name: "Show next month" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("There is no time slot");
});
test("block introduction HTML is rendered in a block container", async () => {
  render(<ZaptimeCalendar config={{ ...config, locale: { texts: { introduction: '<p>Book <a href="https://example.test">here</a></p>' } } }} />);
  const link = await screen.findByRole("link", { name: "here" });
  expect(link.parentElement?.tagName).toBe("P");
  expect(link.parentElement?.parentElement?.tagName).toBe("DIV");
});
