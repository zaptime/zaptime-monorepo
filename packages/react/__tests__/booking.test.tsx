import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ZaptimeCalendar } from "../src/entry";
import { config, formInitData, slot, reservationResponse } from "../../../tests/contracts/fixtures";
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
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return Response.json({ success: true, data: url.includes("init") ? formInitData : url.includes("time-slots") ? [slot] : reservationResponse.data });
    }),
  );
});
async function choose() {
  fireEvent.click(await screen.findByRole("button", { name: "May 2, 2030" }));
  fireEvent.click(await screen.findByRole("button", { name: /12:00/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pick a time" }));
}
test("submits controlled fields, selected location, guests and seats; success fires once", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({
      success: true,
      data: {
        ...formInitData,
        locations: [
          { type: "office", value: "Office" },
          { type: "phone", value: "Phone" },
        ],
      },
    }),
  );
  const confirmed = vi.fn();
  render(<ZaptimeCalendar config={config} onBookingConfirmed={confirmed} />);
  await choose();
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), { target: { value: "Updated" } });
  fireEvent.click(screen.getByRole("button", { name: "Add guest" }));
  fireEvent.change(screen.getByLabelText("Guest 1"), { target: { value: "guest@example.test" } });
  fireEvent.change(screen.getByLabelText("Location"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(confirmed).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("status")).toBeTruthy();
  const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith("/reservations"));
  expect(JSON.parse(call![1]!.body as string)).toMatchObject({ firstname: "Updated", guests: ["guest@example.test"], location: { type: "phone", value: "Phone" } });
});
test("validation preserves entered values and announces field errors without network mutation", async () => {
  render(<ZaptimeCalendar config={config} />);
  await choose();
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect((screen.getByRole("textbox", { name: "Email" }) as HTMLInputElement).value).toBe("invalid");
  expect(vi.mocked(fetch).mock.calls.filter(([u]) => String(u).endsWith("/reservations"))).toHaveLength(0);
});
test("invalid guest is highlighted, described and focused", async () => {
  render(<ZaptimeCalendar config={config} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Add guest" }));
  fireEvent.change(screen.getByLabelText("Guest 1"), { target: { value: "invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await screen.findByRole("alert");
  const guest = screen.getByLabelText("Guest 1");
  expect(guest.getAttribute("aria-invalid")).toBe("true");
  expect(guest.getAttribute("aria-describedby")).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(guest));
});
test("configured consent HTML remains an accessible link", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({ success: true, data: { ...formInitData, customFields: formInitData.customFields.map((f) => (f.type === "checkbox" ? { ...f, label: 'Accept <a href="https://example.test/terms">Terms</a>' } : f)) } }),
  );
  render(<ZaptimeCalendar config={config} />);
  await choose();
  expect(screen.getByRole("link", { name: "Terms" }).getAttribute("href")).toBe("https://example.test/terms");
});
test("seat selection is forwarded to the core booking payload", async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation((input, init) => (String(input).includes("time-slots") ? Promise.resolve(Response.json({ success: true, data: [{ ...slot, seats: 3 }] })) : original(input, init)));
  const confirmed = vi.fn();
  render(<ZaptimeCalendar config={config} onBookingConfirmed={confirmed} />);
  await choose();
  fireEvent.change(screen.getByLabelText("Seats"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(confirmed).toHaveBeenCalledTimes(1));
  const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith("/reservations"));
  expect(JSON.parse(call![1]!.body as string).seats).toBe(2);
});
