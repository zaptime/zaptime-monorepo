export type CalendarErrorCode =
  | "invalid-config"
  | "validation"
  | "slot-unavailable"
  | "reschedule-not-allowed"
  | "disabled"
  | "network"
  | "api"
  | "payment-failed"
  | "recovery-required"
  | "busy"
  | "disposed"
  | "calendar-not-found"
  | "ambiguous-calendar";

export class CalendarError extends Error {
  constructor(
    public readonly code: CalendarErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CalendarError";
  }
}
