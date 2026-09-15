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

export class SlotNoLongerAvailableError extends CalendarError {
  constructor(options?: ErrorOptions) {
    super("slot-unavailable", "The selected time slot is no longer available.", options);
    this.name = "SlotNoLongerAvailableError";
  }
}

export class RescheduleNotAllowedError extends CalendarError {
  constructor(options?: ErrorOptions) {
    super("reschedule-not-allowed", "This reservation can no longer be rescheduled.", options);
    this.name = "RescheduleNotAllowedError";
  }
}

/** The request may have committed. Only authoritative reconciliation can resolve it. */
export class MutationOutcomeUnknownError extends CalendarError {
  constructor(message: string, options?: ErrorOptions) {
    super("recovery-required", message, options);
    this.name = "MutationOutcomeUnknownError";
  }
}
