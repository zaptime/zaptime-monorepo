import type { RecoveryContext, DeepReadonly } from "@zaptime/core";
import { calendarMessages } from "../generated/messages.js";
/** The complete UI has no verified reconciliation backend. Keep recovery visible without offering an unsafe retry. */
export function RecoveryMessage({ recovery, locale }: { recovery: DeepReadonly<RecoveryContext>; locale?: string }) {
  const m = calendarMessages(locale);
  return (
    <div role="alert" className="cal-my-5 cal-rounded-md cal-border cal-border-amber-300 cal-bg-amber-50 cal-p-4 cal-text-amber-900">
      <p>{recovery.paymentStatus === "succeeded" ? m.confirmationPending : recovery.paymentStatus === "unknown" ? m.paymentUnknown : recovery.paymentStatus === "failed" ? m.paymentFailed : m.bookingPending}</p>
      {recovery.reservationUuid && (
        <p className="cal-mt-2 cal-break-all cal-text-sm">
          {m.reference}: {recovery.reservationUuid}
        </p>
      )}
    </div>
  );
}
