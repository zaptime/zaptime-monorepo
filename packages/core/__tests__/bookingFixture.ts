import { vi } from "vitest";
import { createCalendar } from "../src/calendar/createCalendar";
import { config, slot, createFixtureFetch } from "../../../tests/contracts/fixtures";
export const input = { email: "attendee@example.test" };
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
export async function fixture(options: { paid?: boolean; failConfirmation?: boolean; fetch?: typeof fetch; payment?: any; reconcile?: any } = {}) {
  const transport = options.fetch ?? createFixtureFetch(options);
  const fetcher = vi.fn<typeof fetch>((url, init) =>
    String(url).endsWith("/payments") ? Promise.resolve(Response.json({ success: true, data: { clientSecret: "fixture-secret", paymentIntentId: "pi_test" } })) : transport(url, init),
  );
  const calendar = createCalendar({ config, runtime: { fetch: fetcher }, payment: options.payment, reconcile: options.reconcile });
  await calendar.init();
  calendar.actions.setSelectedTimeSlot(slot);
  return { calendar, fetcher };
}
