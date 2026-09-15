import { CalendarError } from "../api/errors";
import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarSnapshot, DeepReadonly } from "../calendar/types";
import type { CustomField, CustomFieldValue } from "../types/InitData";
import type { BookingInput } from "./types";

export interface FieldValidationError {
  field: string;
  code: "required" | "email" | "type" | "option" | "range" | "limit" | "index" | "unknown-field" | "duplicate-field";
}
export class FormValidationError extends CalendarError {
  readonly fieldErrors: readonly Readonly<FieldValidationError>[];
  constructor(errors: FieldValidationError[]) {
    super("validation", "Booking input is invalid");
    this.name = "FormValidationError";
    this.fieldErrors = Object.freeze(errors.map((error) => Object.freeze({ ...error })));
  }
}
export function invalid(field: string, code: FieldValidationError["code"]): never {
  throw new FormValidationError([{ field, code }]);
}
export function assertFormEditable(context: CalendarContext) {
  context.assertActive();
  const phase = context.store.getSnapshot().phase;
  if (phase === "submitting" || phase === "recovery-required") throw new CalendarError("busy", "Booking input cannot change during an unresolved operation");
}
const blank = (value: unknown) => value === undefined || value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
// HTML email input grammar; do not impose a dotted-domain business requirement.
const emailValid = (email: string) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(email);

export function validateFieldValue(field: DeepReadonly<CustomField>, value: DeepReadonly<CustomFieldValue>) {
  const valid =
    field.type === "number"
      ? value === "" || (typeof value === "number" && Number.isFinite(value)) || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
      : field.type === "checkbox" || field.type === "switch"
        ? typeof value === "boolean"
        : field.type === "multiselect"
          ? Array.isArray(value) && value.every((item) => typeof item === "string")
          : typeof value === "string";
  if (!valid) invalid(field.uuid, "type");
  if (field.options && ["select", "radio", "multiselect"].includes(field.type) && !blank(value)) {
    for (const item of Array.isArray(value) ? value : [value]) if (!field.options.includes(String(item))) invalid(field.uuid, "option");
  }
}
export function validateFields(fields: readonly DeepReadonly<CustomField>[]) {
  const errors: FieldValidationError[] = [];
  for (const field of fields) {
    try {
      if (field.required && blank(field.value)) invalid(field.uuid, "required");
      if (field.value !== undefined) validateFieldValue(field, field.value);
      if ((field.type === "email" || field.mergeTag === "EMAIL") && !blank(field.value) && !emailValid(String(field.value))) invalid(field.uuid, "email");
    } catch (error) {
      if (!(error instanceof FormValidationError)) throw error;
      errors.push(...error.fieldErrors);
    }
  }
  if (errors.length) throw new FormValidationError(errors);
}
export function validateSeats(seats: number, available?: number) {
  if (!Number.isInteger(seats) || seats < 1 || (available !== undefined && seats > available)) invalid("seats", "range");
}
/** Validate the effective payload, including overrides, against server-provided fields. */
export function validateBookingInput(snapshot: DeepReadonly<CalendarSnapshot>, input: BookingInput) {
  if (blank(input.email)) invalid("email", "required");
  if (typeof input.email !== "string" || !emailValid(input.email)) invalid("email", "email");
  validateSeats(input.seats ?? snapshot.seats, snapshot.selectedTimeSlot?.seats);
  const known: Record<string, string | undefined> = { FIRST_NAME: input.firstName, LAST_NAME: input.lastName, EMAIL: input.email, PHONE: input.phone };
  const seenFields = new Set<string>();
  for (const field of input.customFields ?? []) {
    if (seenFields.has(field.uuid)) invalid(field.uuid, "duplicate-field");
    seenFields.add(field.uuid);
    if (!snapshot.bookingForm.some((candidate) => candidate.uuid === field.uuid && !Object.hasOwn(known, candidate.mergeTag ?? ""))) invalid(field.uuid, "unknown-field");
  }
  validateFields(
    snapshot.bookingForm.map((field) => ({
      ...field,
      value: Object.hasOwn(known, field.mergeTag ?? "") ? known[field.mergeTag!] : input.customFields?.find((candidate) => candidate.uuid === field.uuid)?.value,
    })),
  );
  if (input.guests !== undefined && (!Array.isArray(input.guests) || input.guests.some((guest) => typeof guest !== "string"))) invalid("guests", "type");
  const guests = input.guests?.filter((guest) => guest.trim() !== "") ?? [];
  if (guests.length > (snapshot.maxGuests ?? 0)) invalid("guests", "limit");
  input.guests?.forEach((guest, index) => {
    if (guest.trim() !== "" && !emailValid(guest)) invalid(`guests.${index}`, "email");
  });
}
