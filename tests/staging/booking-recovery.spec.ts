import { test, expect } from "@playwright/test";
import { isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

type Mutation = "book" | "reserve" | "confirm" | "reschedule" | "cancel";
export type RecoveryScenario =
  | `deduplicate-${Mutation}`
  | "lost-confirmation-response"
  | "reuse-payment-intent"
  | "unknown-payment-outcome"
  | "page-closure"
  | "refresh-during-authentication"
  | "failed-payment-cancellation"
  | "paid-cancellation-refund"
  | "lookup-authorization";

/** Normalized test observations, NOT Zaptime API response fields. */
export interface RecoveryObservation {
  evidenceRefs: string[];
  original: { operationId: string; reservationUuid: string; paymentIntentId?: string };
  recovered: { operationId: string; reservationUuid: string; paymentIntentId?: string };
  successfulChargeCount: number;
  reservationCount: number;
  paymentIntentCount: number;
  paymentConfirmationAttempts: number;
  bookingStatus: "confirmed" | "pending" | "canceled" | "failed";
  mutationEffectCount?: number;
  originalMutationAttempts?: number;
  recoveryStatus?: "confirmed" | "pending" | "unsupported";
  browserClosedAtMs?: number;
  webhookProcessedAtMs?: number;
  serverObservedAtMs?: number;
  refreshCadenceMs?: number;
  observedHoldDurationMs?: number;
  authenticationCompleted?: boolean;
  renewalFailureReconciled?: boolean;
  cancellationAfterDefinitiveFailure?: boolean;
  refundCount?: number;
  refundedAmount?: number;
  chargedAmount?: number;
  cancellationMatchesDocumentedRefundPolicy?: boolean;
  unauthorizedLookupRejected?: boolean;
  crossCalendarLookupRejected?: boolean;
  authorizedLookupMatchedIdentity?: boolean;
}

/** Implement only after reviewing the backend contract and approved staging setup. */
export interface BookingRecoveryStagingAdapter {
  // Read-only preflight must verify the actual backend and Stripe account mode.
  preflight(): Promise<{
    environment: "staging";
    stripeLivemode: false;
    apiOrigin: string;
    deploymentRevision: string;
    contractEvidenceRefs: string[];
  }>;
  // Each scenario owns isolated synthetic attendees and server-side observations.
  runScenario(scenario: RecoveryScenario): Promise<RecoveryObservation>;
  // Release local resources. Cleanup mutations need separately evidenced semantics.
  dispose(): Promise<void>;
}

let adapter: BookingRecoveryStagingAdapter | undefined;

test.beforeAll(async () => {
  // Also guard direct execution with a different Playwright config.
  if (process.env.ZAPTIME_STAGING_TEST_MODE !== "stripe-test") {
    throw new Error("UNVERIFIED: explicit ZAPTIME_STAGING_TEST_MODE=stripe-test required.");
  }
  const adapterPath = process.env.ZAPTIME_STAGING_ADAPTER;
  const approvedOrigin = process.env.ZAPTIME_STAGING_APPROVED_ORIGIN;
  if (!adapterPath || !isAbsolute(adapterPath) || !adapterPath.endsWith(".mjs")) {
    throw new Error("UNVERIFIED: provide an absolute path to a reviewed staging adapter .mjs.");
  }
  if (!approvedOrigin) {
    throw new Error("UNVERIFIED: approved staging origin required; no production default exists.");
  }
  const url = new URL(approvedOrigin);
  if (url.protocol !== "https:" || url.origin !== approvedOrigin || url.hostname === "api.zaptime.app") {
    throw new Error("UNVERIFIED: expected an approved HTTPS staging origin, without credentials or path.");
  }
  // The reviewed module must be inert on import; never load an untrusted adapter.
  const module = await import(pathToFileURL(adapterPath).href);
  adapter = await module.createStagingAdapter({ approvedOrigin });
  const preflight = await adapter!.preflight();
  expect(preflight.environment).toBe("staging");
  expect(preflight.stripeLivemode).toBe(false);
  expect(preflight.apiOrigin === approvedOrigin).toBe(true);
  expect(preflight.deploymentRevision.length).toBeGreaterThan(0);
  expect(preflight.contractEvidenceRefs.length).toBeGreaterThan(0);
});

test.afterAll(async () => {
  await adapter?.dispose();
});

async function observe(scenario: RecoveryScenario): Promise<RecoveryObservation> {
  if (!adapter) throw new Error("UNVERIFIED: staging adapter did not pass preflight.");
  const result = await adapter.runScenario(scenario);
  expect(result.evidenceRefs.length).toBeGreaterThan(0);
  // Boolean comparisons avoid printing reservation/payment identifiers on failure.
  expect(Boolean(result.original.operationId && result.original.reservationUuid)).toBe(true);
  expect(result.recovered.operationId === result.original.operationId).toBe(true);
  expect(result.recovered.reservationUuid === result.original.reservationUuid).toBe(true);
  expect(result.reservationCount).toBe(1);
  return result;
}

function expectOnePayment(result: RecoveryObservation) {
  expect(Boolean(result.original.paymentIntentId)).toBe(true);
  expect(result.recovered.paymentIntentId === result.original.paymentIntentId).toBe(true);
  expect(result.paymentIntentCount).toBe(1);
  expect(result.successfulChargeCount).toBe(1);
  expect(result.paymentConfirmationAttempts).toBe(1);
}

test("lost confirmation response recovers the original paid reservation", async () => {
  const result = await observe("lost-confirmation-response");
  expectOnePayment(result);
  expect(result.bookingStatus).toBe("confirmed");
  expect(result.recoveryStatus).toBe("confirmed");
});

for (const operation of ["book", "reserve", "confirm", "reschedule", "cancel"] as const) {
  test(`${operation} retry with original identity applies its side effects once`, async () => {
    const result = await observe(`deduplicate-${operation}`);
    expect(result.originalMutationAttempts).toBeGreaterThanOrEqual(2);
    expect(result.mutationEffectCount).toBe(1);
  });
}

test("payment creation retry retrieves the same intent", async () => {
  const result = await observe("reuse-payment-intent");
  expect(result.originalMutationAttempts).toBeGreaterThanOrEqual(2);
  expectOnePayment(result);
});

test("unknown payment outcome reconciles without another payment", async () => {
  const result = await observe("unknown-payment-outcome");
  expect(Boolean(result.original.paymentIntentId)).toBe(true);
  expect(result.recovered.paymentIntentId === result.original.paymentIntentId).toBe(true);
  expect(result.paymentIntentCount).toBe(1);
  expect(result.paymentConfirmationAttempts).toBe(1);
  expect([0, 1]).toContain(result.successfulChargeCount);
  expect(["pending", "confirmed"]).toContain(result.bookingStatus);
  expect(["pending", "confirmed"]).toContain(result.recoveryStatus);
});

test("webhook finalizes booking after the browser has closed", async () => {
  const result = await observe("page-closure");
  expectOnePayment(result);
  expect(result.bookingStatus).toBe("confirmed");
  expect(result.browserClosedAtMs).toBeGreaterThan(0);
  expect(result.webhookProcessedAtMs).toBeGreaterThan(result.browserClosedAtMs!);
  expect(result.serverObservedAtMs).toBeGreaterThanOrEqual(result.webhookProcessedAtMs!);
});

test("15 minute renewal survives authentication and reconciles renewal failure", async () => {
  const result = await observe("refresh-during-authentication");
  expect(result.refreshCadenceMs).toBe(900_000);
  expect(result.observedHoldDurationMs).toBeGreaterThan(1_200_000);
  expect(result.authenticationCompleted).toBe(true);
  expect(result.renewalFailureReconciled).toBe(true);
  expectOnePayment(result);
  expect(result.bookingStatus).toBe("confirmed");
});

test("definitively failed payment permits cancellation without a charge", async () => {
  const result = await observe("failed-payment-cancellation");
  expect(result.cancellationAfterDefinitiveFailure).toBe(true);
  expect(result.successfulChargeCount).toBe(0);
  expect(result.bookingStatus).toBe("canceled");
  expect(result.refundCount).toBe(0);
});

test("paid cancellation follows the evidenced refund policy", async () => {
  const result = await observe("paid-cancellation-refund");
  expectOnePayment(result);
  expect(result.bookingStatus).toBe("canceled");
  expect(result.cancellationMatchesDocumentedRefundPolicy).toBe(true);
  expect(result.refundCount).toBeGreaterThanOrEqual(0);
  expect(result.refundedAmount).toBeGreaterThanOrEqual(0);
  expect(result.chargedAmount).toBeGreaterThan(0);
  expect(result.refundedAmount).toBeLessThanOrEqual(result.chargedAmount!);
});

test("status lookup authorizes the original calendar and rejects unrelated callers", async () => {
  const result = await observe("lookup-authorization");
  expect(result.unauthorizedLookupRejected).toBe(true);
  expect(result.crossCalendarLookupRejected).toBe(true);
  expect(result.authorizedLookupMatchedIdentity).toBe(true);
});
