import type { CalendarError } from "../api/errors";
import type { BillingAddress } from "../types/BillingAddress";
import type { CustomFieldCollected, Location } from "../types/InitData";
import type { ReservationResponse } from "../types/ApiResponses";

export interface BookingInput {
  email: string;
  firstName?: string;
  lastName?: string;
  seats?: number;
  phone?: string;
  location?: Location;
  customFields?: CustomFieldCollected[];
  guests?: string[];
}
export type ConfirmationInput = Omit<BookingInput, "email" | "location" | "seats">;
export type Operation = "book" | "reserve" | "confirm" | "cancel" | "reschedule" | "submit";
export interface RecoveryContext {
  operationId: string;
  operation: Operation;
  reservationUuid?: string;
  paymentStatus: "not-started" | "succeeded" | "failed" | "unknown";
}
export type RecoveryResult =
  | { status: "confirmed"; reservation: ReservationResponse }
  | { status: "pending" }
  | { status: "safe-to-retry"; operation: "confirm" | "book" | "reserve" | "reschedule" | "cancel" }
  | { status: "failed"; error: CalendarError }
  | { status: "unsupported" };
export type PaymentOutcome = { status: "succeeded"; paymentIntentId: string } | { status: "failed"; error: CalendarError } | { status: "unknown"; paymentIntentId?: string; error?: CalendarError };
export interface PaymentDriver {
  confirm(input: { reservationUuid: string; clientSecret: string; billingAddress: BillingAddress }): Promise<PaymentOutcome>;
}
