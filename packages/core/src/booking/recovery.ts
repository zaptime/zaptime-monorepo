import { CalendarError } from "../api/errors";
import { reconcileBooking } from "../api/recovery";
import type { CalendarContext } from "../calendar/lifecycle";
import { bounded, type Transaction, type createWorkflow } from "./workflow";
import type { RecoveryResult } from "./types";

export async function recoverTransaction(context: CalendarContext, workflow: ReturnType<typeof createWorkflow>, tx: Transaction): Promise<RecoveryResult> {
  const result = await bounded(
    context,
    Promise.resolve().then(() => (context.reconcile ?? reconcileBooking)({ ...tx.recovery })),
  );
  if (result.status === "confirmed") {
    if (!result.reservation.success || !result.reservation.data?.uuid || (tx.recovery.reservationUuid && result.reservation.data.uuid !== tx.recovery.reservationUuid))
      throw new CalendarError("recovery-required", "Reconciliation returned a different reservation");
    workflow.complete(tx, result.reservation);
  } else if (result.status === "safe-to-retry") {
    // An adapter authorizes this specific original mutation, never payment or another reservation.
    if (result.operation !== tx.step && !(result.operation === "confirm" && tx.step === "payment" && !!tx.recovery.reservationUuid))
      throw new CalendarError("recovery-required", "Reconciliation did not authorize the original operation");
    tx.holdFailed = false;
    const response = await workflow.step(tx, result.operation);
    if (typeof response !== "boolean" && result.operation !== "reserve") return { status: "confirmed", reservation: response };
    if (result.operation === "reserve") {
      // A prepared hold is still unresolved; this authorization never resumes payment.
      workflow.unresolved(tx, new CalendarError("recovery-required", "Reservation prepared; further reconciliation is required"));
      return { status: "pending" };
    }
  } else if (result.status === "failed") {
    context.store.commit({ error: result.error });
  }
  return result;
}
