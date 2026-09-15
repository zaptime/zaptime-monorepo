import type { RecoveryContext, RecoveryResult } from "../booking/types";

/** No deployed recovery endpoint or retry guarantee has been verified. */
export async function reconcileBooking(_context: RecoveryContext): Promise<RecoveryResult> {
  return { status: "unsupported" };
}
