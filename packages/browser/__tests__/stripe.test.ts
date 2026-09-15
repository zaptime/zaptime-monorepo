import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createStripePaymentDriver } from "../src/stripe";
const sdk = vi.hoisted(() => ({ load: vi.fn(), confirm: vi.fn(), fields: [] as any[] }));
vi.mock("@stripe/stripe-js/pure", () => ({ loadStripe: sdk.load }));
function fields() {
  return Object.fromEntries(
    ["cardNumber", "cardExpiry", "cardCvc"].map((key) => {
      const node = document.createElement("div");
      document.body.append(node);
      return [key, node];
    }),
  ) as any;
}
const input = { reservationUuid: "r", clientSecret: "synthetic_secret", billingAddress: { name: "", email: "", company: "", address: "", city: "", postalCode: "", country: "", crn: "", vatId: "" } };
beforeEach(() => {
  sdk.fields = [];
  sdk.confirm.mockReset().mockResolvedValue({ paymentIntent: { id: "pi_test", status: "succeeded" } });
  sdk.load.mockReset().mockResolvedValue({
    elements: () => ({
      create: () => {
        const field = { mount: vi.fn(), destroy: vi.fn() };
        sdk.fields.push(field);
        return field;
      },
    }),
    confirmCardPayment: sdk.confirm,
  });
});
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});
it("is lazy and mounts separate element references for separate accounts", async () => {
  const a = fields(),
    b = fields();
  const first = createStripePaymentDriver({ publishableKey: "pk_test", accountId: "acct_a", elements: a });
  const second = createStripePaymentDriver({ publishableKey: "pk_test", accountId: "acct_b", elements: b });
  expect(sdk.load).not.toHaveBeenCalled();
  expect(await first.confirm(input)).toEqual({ status: "succeeded", paymentIntentId: "pi_test" });
  await second.confirm(input);
  expect(sdk.load).toHaveBeenCalledWith("pk_test", { stripeAccount: "acct_a" });
  expect(sdk.load).toHaveBeenCalledWith("pk_test", { stripeAccount: "acct_b" });
  expect(sdk.fields[0].mount).toHaveBeenCalledWith(a.cardNumber);
  expect(sdk.fields[3].mount).toHaveBeenCalledWith(b.cardNumber);
  await first.dispose();
  await second.dispose();
});
it.each(["missing", "disconnected", "duplicate", "key"])("rejects %s fields before contacting Stripe", async (kind) => {
  const elements = fields();
  if (kind === "missing") elements.cardCvc = undefined;
  if (kind === "disconnected") elements.cardExpiry.remove();
  if (kind === "duplicate") elements.cardCvc = elements.cardNumber;
  const driver = createStripePaymentDriver({ publishableKey: kind === "key" ? "" : "pk_test", elements });
  expect(await driver.confirm(input)).toMatchObject({ status: "failed", error: { code: "payment-failed" } });
  expect(sdk.confirm).not.toHaveBeenCalled();
});
it.each([
  ["requires_payment_method", "failed"],
  ["processing", "unknown"],
  ["requires_action", "unknown"],
  ["requires_capture", "unknown"],
])("maps %s to %s", async (status, expected) => {
  sdk.confirm.mockResolvedValue({ paymentIntent: { id: "pi_test", status } });
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  expect(await driver.confirm(input)).toMatchObject({ status: expected });
  await driver.dispose();
});
it("sanitizes decline details and treats thrown confirmation as unknown", async () => {
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  sdk.confirm.mockResolvedValueOnce({ error: { type: "card_error", code: "card_declined", message: input.clientSecret } });
  const result = await driver.confirm(input);
  expect(result).toMatchObject({ status: "failed" });
  expect(JSON.stringify(result)).not.toContain(input.clientSecret);
  sdk.confirm.mockRejectedValueOnce(new Error(input.clientSecret));
  expect(await driver.confirm(input)).toMatchObject({ status: "unknown" });
  await driver.dispose();
});
it("defers destruction while confirming and rejects new work after disposal", async () => {
  let finish: any;
  sdk.confirm.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  const pending = driver.confirm(input);
  await vi.waitFor(() => expect(finish).toBeDefined());
  const disposing = driver.dispose();
  expect(sdk.fields[0].destroy).not.toHaveBeenCalled();
  expect(await driver.confirm(input)).toMatchObject({ status: "failed", error: { code: "disposed" } });
  finish({ paymentIntent: { id: "pi_test", status: "succeeded" } });
  await pending;
  await disposing;
  expect(sdk.fields[0].destroy).toHaveBeenCalledTimes(1);
});
it("returns unknown when authentication UI disappears", async () => {
  const elements = fields();
  sdk.confirm.mockImplementation(async () => {
    elements.cardNumber.remove();
    return { paymentIntent: { id: "pi_test", status: "succeeded" } };
  });
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements });
  expect(await driver.confirm(input)).toMatchObject({ status: "unknown" });
  await driver.dispose();
});
it("bounds confirmation at five minutes without retrying", async () => {
  vi.useFakeTimers();
  sdk.confirm.mockReturnValue(new Promise(() => {}));
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  const pending = driver.confirm(input);
  await vi.advanceTimersByTimeAsync(300000);
  expect(await pending).toMatchObject({ status: "unknown" });
  expect(sdk.confirm).toHaveBeenCalledTimes(1);
  await driver.dispose();
});
it("mounts styled fields explicitly before submitting card data", async () => {
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields(), style: { base: { color: "#123456" } } });
  await driver.mount();
  expect(sdk.fields).toHaveLength(3);
  expect(sdk.confirm).not.toHaveBeenCalled();
  await driver.confirm(input);
  expect(sdk.fields).toHaveLength(3);
  await driver.dispose();
});
it("never retries a timed-out SDK operation on the same driver", async () => {
  vi.useFakeTimers();
  sdk.confirm.mockReturnValue(new Promise(() => {}));
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  const pending = driver.confirm(input);
  await vi.advanceTimersByTimeAsync(300000);
  await pending;
  expect(await driver.confirm(input)).toMatchObject({ status: "unknown" });
  expect(sdk.confirm).toHaveBeenCalledTimes(1);
  await driver.dispose();
});
it("does not send confirmation if disposed during SDK loading", async () => {
  let resolve: any;
  sdk.load.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  const mounting = driver.mount();
  await vi.waitFor(() => expect(resolve).toBeDefined());
  const disposing = driver.dispose();
  resolve({ elements: () => ({ create: () => ({ mount: vi.fn(), destroy: vi.fn() }) }), confirmCardPayment: sdk.confirm });
  await mounting;
  await disposing;
  expect(sdk.confirm).not.toHaveBeenCalled();
  expect(await driver.confirm(input)).toMatchObject({ status: "failed", error: { code: "disposed" } });
});
it("bounds a stalled SDK mount and releases a disposed form", async () => {
  vi.useFakeTimers();
  sdk.load.mockReturnValue(new Promise(() => {}));
  const driver = createStripePaymentDriver({ publishableKey: "pk_test", elements: fields() });
  const mounting = driver.mount();
  const rejected = expect(mounting).rejects.toMatchObject({ code: "payment-failed" });
  const disposing = driver.dispose();
  await vi.advanceTimersByTimeAsync(30000);
  await rejected;
  await disposing;
});
