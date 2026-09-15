import { CalendarError, MutationOutcomeUnknownError } from "../api/errors";
import { createZaptimeClient } from "../api/client";
import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarSnapshot, DeepReadonly } from "../calendar/types";
import type { ReservationResponse } from "../types/ApiResponses";
import type { BookingInput, RecoveryContext } from "./types";

export type RetryStep = "book" | "reserve" | "confirm" | "cancel" | "reschedule";
export interface Transaction {
  snapshot: DeepReadonly<CalendarSnapshot>;
  input: BookingInput;
  recovery: RecoveryContext;
  step?: RetryStep | "payment";
  paymentIntentId?: string;
  completed?: boolean;
  holdFailed?: boolean;
}
/** Finite waits bound disposal too. A mutation timeout never proves rollback. */
export async function bounded<T>(context: CalendarContext, work: Promise<T>, ms = 30_000): Promise<T> {
  let timer: unknown;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = context.runtime.schedule(() => reject(new MutationOutcomeUnknownError("Operation outcome is unknown after timeout")), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) context.runtime.unschedule(timer);
  }
}
export function createWorkflow(context: CalendarContext) {
  const { store } = context;
  const client = createZaptimeClient({ fetch: context.runtime.fetch });
  let timer: unknown;
  let hold: Transaction | undefined;
  let generation = 0;
  function stop() {
    generation++;
    if (timer !== undefined) context.runtime.unschedule(timer);
    timer = undefined;
    hold = undefined;
  }
  context.addCleanup(stop);
  function unresolved(tx: Transaction, error: CalendarError) {
    store.commit({ phase: "recovery-required", recovery: { ...tx.recovery }, error });
    context.emit({ type: "recovery-required", payload: { ...tx.recovery } });
  }
  function start(tx: Transaction) {
    stop();
    hold = tx;
    const current = generation;
    // Historical nominal cadence only; deployed expiry/renewal safety is an open release gate.
    const schedule = () => {
      timer = context.runtime.schedule(() => {
        void renew();
      }, 15 * 60_000);
    };
    const renew = async () => {
      try {
        await bounded(context, client.refreshReserve(tx.snapshot.config.token, { uuid: tx.recovery.reservationUuid! }, tx.snapshot.config.apiBaseUrl));
        if (current === generation) schedule();
      } catch {
        if (current !== generation) return;
        tx.holdFailed = true;
        stop();
        unresolved(tx, new CalendarError("recovery-required", "Reservation renewal requires reconciliation"));
      }
    };
    schedule();
  }
  function complete(tx: Transaction, response: ReservationResponse) {
    if (tx.completed) return response;
    tx.completed = true;
    stop();
    store.commit({ phase: "success", view: "success", reservationUuid: response.data.uuid, recovery: undefined, error: undefined });
    context.emit({ type: "view-changed", payload: "success" });
    context.emit({ type: "booking-confirmed", payload: response });
    if (tx.recovery.operation !== "reschedule" && !tx.snapshot.reservation)
      context.emit({ type: "analytics", payload: { name: "zatime:booking_confirmed", properties: { timeSlot: tx.snapshot.selectedTimeSlot?.start } } });
    if (tx.snapshot.config.redirectAfterBookingUrl) context.emit({ type: "redirect-requested", payload: { url: tx.snapshot.config.redirectAfterBookingUrl } });
    return response;
  }
  async function step(tx: Transaction, operation: RetryStep): Promise<ReservationResponse | boolean> {
    if (tx.holdFailed) throw new CalendarError("recovery-required", "Reservation renewal requires reconciliation");
    tx.step = operation;
    const { config, selectedTimeSlot: slot, timezone } = tx.snapshot;
    const base = { token: config.token, baseUrl: config.apiBaseUrl };
    const uuid = tx.recovery.reservationUuid;
    if (operation === "cancel") {
      if (!uuid) return false;
      const result = await bounded(context, client.cancel(config.token, { uuid }, config.apiBaseUrl));
      stop();
      store.commit({ phase: "ready", reservationUuid: undefined, recovery: undefined, error: undefined });
      return result;
    }
    if (operation === "confirm") {
      if (!uuid) throw new CalendarError("validation", "No reservation to confirm");
      return complete(tx, await bounded(context, client.confirm({ ...base, ...tx.input, status: { uuid } })));
    }
    if (!slot) throw new CalendarError("validation", "Select a time slot");
    if (operation === "reschedule") {
      const reservationUuid = tx.snapshot.reservation?.uuid ?? config.reservationUuid;
      if (!reservationUuid) throw new CalendarError("validation", "No reservation to reschedule");
      return complete(tx, await bounded(context, client.reschedule({ ...base, start: slot.start, end: slot.end, timezone, uuid: reservationUuid, overrideToken: config.rescheduleOverrideToken })));
    }
    const response = await bounded(context, client[operation]({ ...base, ...tx.input, timeSlot: { ...slot }, timezone }));
    tx.recovery.reservationUuid = response.data.uuid;
    if (operation === "book") return complete(tx, response);
    store.commit({ reservationUuid: response.data.uuid });
    start(tx);
    return response;
  }
  async function run(tx: Transaction): Promise<ReservationResponse | boolean> {
    const operation = tx.recovery.operation;
    if (operation !== "submit") return step(tx, operation);
    if (tx.snapshot.reservation || tx.snapshot.config.reservationUuid) return step(tx, "reschedule");
    if (!tx.snapshot.stripeConfig) return step(tx, "book");
    if (!context.payment) throw new CalendarError("payment-failed", "Payment fields are unavailable");
    await step(tx, "reserve");
    tx.step = "payment";
    const billing = { ...tx.snapshot.billingAddress };
    billing.email ||= tx.input.email;
    billing.name ||= [tx.input.firstName, tx.input.lastName].filter(Boolean).join(" ");
    billing.country ||= "CZ";
    const payment = await bounded(context, client.createPayment({ token: tx.snapshot.config.token, baseUrl: tx.snapshot.config.apiBaseUrl, reservationUuid: tx.recovery.reservationUuid!, billingAddress: billing }));
    tx.paymentIntentId = payment.paymentIntentId;
    if (tx.holdFailed) throw new CalendarError("recovery-required", "Reservation renewal requires reconciliation");
    tx.recovery.paymentStatus = "unknown";
    const outcome = await bounded(
      context,
      Promise.resolve().then(() => context.payment!.confirm({ reservationUuid: tx.recovery.reservationUuid!, clientSecret: payment.clientSecret, billingAddress: billing })),
      5 * 60_000,
    );
    tx.recovery.paymentStatus = outcome.status;
    if (outcome.status !== "failed") tx.paymentIntentId = outcome.paymentIntentId ?? tx.paymentIntentId;
    if (outcome.status === "failed") throw new CalendarError("payment-failed", outcome.error.message);
    if (outcome.status !== "succeeded") throw new CalendarError("recovery-required", "Payment outcome requires reconciliation");
    return step(tx, "confirm");
  }
  return { run, step, complete, unresolved, stop, getHold: () => hold };
}
