import { StrictMode } from "react";
import { createStripePaymentDriver } from "@zaptime/browser";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ZaptimeCalendar } from "../src/entry";
import { config, formInitData, paidInitData, slot, reservationResponse } from "../../../tests/contracts/fixtures";
const gateway = vi.hoisted(() => ({ mount: vi.fn(async () => {}), confirm: vi.fn(async () => ({ status: "succeeded", paymentIntentId: "pi_fixture" })), dispose: vi.fn(async () => {}) }));
vi.mock("@zaptime/browser", async (importOriginal) => ({ ...(await importOriginal<typeof import("@zaptime/browser")>()), createStripePaymentDriver: vi.fn(() => gateway) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.clearAllMocks();
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-05-01T00:00:00Z"));
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("payments")) return Response.json({ success: true, data: { clientSecret: "fixture-secret" } });
      return Response.json({ success: true, data: url.includes("init") ? { ...formInitData, stripeConfig: paidInitData.stripeConfig } : url.includes("time-slots") ? [slot] : reservationResponse.data });
    }),
  );
});
async function choose() {
  fireEvent.click(await screen.findByRole("button", { name: "May 2, 2030" }));
  fireEvent.click(await screen.findByRole("button", { name: /12:00/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pick a time" }));
  await waitFor(() => expect((screen.getByRole("button", { name: "Confirm booking" }) as HTMLButtonElement).disabled).toBe(false));
}
test("mounts fields before submit and passes billing defaults; confirms only once", async () => {
  const confirmed = vi.fn();
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} onBookingConfirmed={confirmed} />);
  await choose();
  expect(gateway.mount).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(confirmed).toHaveBeenCalledTimes(1));
  expect(gateway.confirm).toHaveBeenCalledTimes(1);
  expect(gateway.confirm.mock.calls[0][0]).toMatchObject({ billingAddress: { email: "attendee@example.test", name: "Test Attendee", country: "CZ" } });
});
test("paid but unconfirmed preserves recovery and never offers to pay again", async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (input, init) => (String(input).endsWith("/confirm") ? Response.json({ success: false }) : original(input, init)));
  const confirmed = vi.fn(),
    recovery = vi.fn();
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} onBookingConfirmed={confirmed} onRecoveryRequired={recovery} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect((await screen.findByRole("alert")).textContent).toMatch(/confirmation/i);
  expect(screen.queryByRole("button", { name: /pay again/i })).toBeNull();
  expect(confirmed).not.toHaveBeenCalled();
  expect(recovery).toHaveBeenCalledTimes(1);
  expect(gateway.confirm).toHaveBeenCalledTimes(1);
  expect((screen.getByRole("button", { name: "Confirm booking" }) as HTMLButtonElement).disabled).toBe(true);
});
test("definite payment failure is distinct and does not confirm or repeat payment", async () => {
  gateway.confirm.mockResolvedValueOnce({ status: "failed", error: new Error("declined") } as never);
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Payment failed");
  expect(vi.mocked(fetch).mock.calls.filter(([u]) => String(u).endsWith("/confirm"))).toHaveLength(0);
  expect(gateway.confirm).toHaveBeenCalledTimes(1);
});
test("billing fields prefill while preserving user edits", async () => {
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Vyplnit fakturační údaje" }));
  expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Test Attendee");
  fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Updated company" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(gateway.confirm).toHaveBeenCalledTimes(1));
  expect(gateway.confirm.mock.calls[0][0]).toMatchObject({ billingAddress: { company: "Updated company" } });
});
test("StrictMode owns one gateway and delivers one booking callback", async () => {
  const confirmed = vi.fn();
  render(
    <StrictMode>
      <ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} onBookingConfirmed={confirmed} />
    </StrictMode>,
  );
  await choose();
  expect(createStripePaymentDriver).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(confirmed).toHaveBeenCalledTimes(1));
  expect(gateway.confirm).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(gateway.dispose).toHaveBeenCalledTimes(1));
});
test("mount readiness gates payment submission and failure leaves form editable", async () => {
  let fail!: (e: Error) => void;
  gateway.mount.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} />);
  fireEvent.click(await screen.findByRole("button", { name: "May 2, 2030" }));
  fireEvent.click(await screen.findByRole("button", { name: /12:00/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pick a time" }));
  expect((screen.getByRole("button", { name: "Confirm booking" }) as HTMLButtonElement).disabled).toBe(true);
  fail(new Error("offline"));
  expect((await screen.findByRole("alert")).textContent).toContain("Payment fields could not be loaded");
  expect((screen.getByRole("textbox", { name: "First name" }) as HTMLInputElement).disabled).toBe(false);
  expect(gateway.confirm).not.toHaveBeenCalled();
});
test("unknown payment remains unresolved and does not confirm", async () => {
  gateway.confirm.mockResolvedValueOnce({ status: "unknown" } as never);
  render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect((await screen.findByRole("alert")).textContent).toContain("payment status is unknown");
  expect(vi.mocked(fetch).mock.calls.filter(([u]) => String(u).endsWith("/confirm"))).toHaveLength(0);
});
test("unmount during payment lets the owned transaction settle without another charge", async () => {
  let settle!: (outcome: { status: string; paymentIntentId: string }) => void;
  const pending = new Promise<{ status: string; paymentIntentId: string }>((resolve) => {
    settle = resolve;
  });
  gateway.confirm.mockImplementationOnce(() => pending);
  const confirmed = vi.fn();
  const { unmount } = render(<ZaptimeCalendar config={{ ...config, stripePublishableKey: "pk_test_fixture" }} onBookingConfirmed={confirmed} />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  await waitFor(() => expect(gateway.confirm).toHaveBeenCalledTimes(1));
  unmount();
  await waitFor(() => expect(gateway.dispose).toHaveBeenCalledTimes(1));
  settle({ status: "succeeded", paymentIntentId: "pi_fixture" });
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith("/confirm"))).toHaveLength(1));
  expect(gateway.confirm).toHaveBeenCalledTimes(1);
  expect(confirmed).not.toHaveBeenCalled();
});
