import type { TimeSlot, ZaptimeConfig, ReservationResponse } from "../../packages/core/src/entry";
import type { CustomField, InitData, Reservation } from "../../packages/core/src/types/InitData";
import type { BillingAddress } from "../../packages/core/src/types/BillingAddress";

/** Fictional data only. These responses do not establish backend recovery guarantees. */
export const config = {
  token: "test-token",
  apiBaseUrl: "https://booking.example.test/",
} satisfies ZaptimeConfig;

export const slot = {
  calendarId: 1,
  start: "2030-05-02T10:00:00Z",
  end: "2030-05-02T10:30:00Z",
  readableType: "meeting",
  seats: 1,
  title: "Test appointment",
} satisfies TimeSlot;

export const reservationResponse = {
  success: true,
  data: { uuid: "r-test", userId: 1, userName: "Test attendee", userEmail: "attendee@example.test" },
} satisfies ReservationResponse;

export const billingAddress = {
  name: "Test attendee",
  email: "attendee@example.test",
  company: "Fictional Company",
  address: "1 Example Street",
  city: "Example City",
  postalCode: "12345",
  country: "CZ",
  crn: "fixture-crn",
  vatId: "fixture-vat-id",
} satisfies BillingAddress;

export const customFields = [
  { uuid: "field-first-name", name: "firstName", label: "First name", type: "text", required: true, mergeTag: "FIRST_NAME", value: "Test" },
  { uuid: "field-last-name", name: "lastName", label: "Last name", type: "text", required: false, mergeTag: "LAST_NAME", value: "Attendee" },
  { uuid: "field-email", name: "email", label: "Email", type: "email", required: true, mergeTag: "EMAIL", value: "attendee@example.test" },
  { uuid: "field-phone", name: "phone", label: "Phone", type: "phone", required: false, mergeTag: "PHONE", value: "+12025550123" },
  { uuid: "field-number", name: "number", label: "Number", type: "number", required: false, value: 0 },
  { uuid: "field-note", name: "note", label: "Note", type: "textarea", required: false, value: "Test note" },
  { uuid: "field-switch", name: "switch", label: "Reminder", type: "switch", required: false, value: false },
  { uuid: "field-checkbox", name: "checkbox", label: "Consent", type: "checkbox", required: true, value: true },
  { uuid: "field-select", name: "select", label: "Topic", type: "select", required: true, options: ["Planning", "Review"], value: "Planning" },
  { uuid: "field-multiselect", name: "multiselect", label: "Interests", type: "multiselect", required: false, options: ["Design", "Development"], value: ["Design", "Development"] },
  { uuid: "field-radio", name: "radio", label: "Format", type: "radio", required: true, options: ["Short", "Detailed"], value: "Short" },
] satisfies CustomField[];

export const guests = ["guest@example.test", "second-guest@example.test"];

export const initData = {
  configuration: { locale: { preset: "en" } },
  disabled: false,
  eventTypeName: "Test appointment",
  isSubscribed: true,
  maxGuests: 2,
  customFields: [],
  locations: [{ type: "in-person", value: "Test office" }],
} satisfies InitData;

export const paidInitData = {
  ...initData,
  stripeConfig: { price: 1000, currency: "USD", stripeAccountId: "acct_test" },
} satisfies InitData;
export const disabledInitData = { ...initData, disabled: true } satisfies InitData;
export const formInitData = { ...initData, customFields } satisfies InitData;
export const reservation = {
  uuid: "r-test",
  email: "attendee@example.test",
  firstName: "Test",
  lastName: "Attendee",
  start: "2030-05-01T10:00:00Z",
  end: "2030-05-01T10:30:00Z",
  status: "confirmed",
  location: { type: "in-person", value: "Test office" },
} satisfies Reservation;
export const rescheduleInitData = { ...initData, reservation } satisfies InitData;
export const rescheduleConfig = {
  ...config,
  reservationUuid: "r-test",
  rescheduleOverrideToken: "fixture-host-proof",
} satisfies ZaptimeConfig;

// Backend-source response differs from the legacy refresh status check.
export const verifiedRefreshResponse = { success: true, data: [] };

/** Override deliberately for deferred availability, PUT rescheduling, or recovery. */
export function createFixtureFetch(options: { paid?: boolean; failConfirmation?: boolean } = {}): typeof globalThis.fetch {
  return async (input, request) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = new URL(rawUrl).pathname;
    const method = (request?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    if (method === "POST" && path === "/event-types/init") {
      return Response.json({ success: true, data: options.paid ? paidInitData : initData });
    }
    if (method === "GET" && path === "/time-slots") return Response.json({ success: true, data: [slot] });
    if (method === "POST" && path === "/api/reservations/r-test/payments") return Response.json({ data: { clientSecret: "fixture-only-secret" } });
    if (method === "POST" && path === "/reservations/r-test/confirm" && options.failConfirmation) return Response.json({ success: false });
    if (method === "POST" && path === "/reservations/r-test/refresh") return Response.json({ status: 200, success: true });
    if (method === "DELETE" && path === "/reservations/r-test") return Response.json({ success: true });
    if (method === "POST" && ["/reservations", "/reservations/prepare", "/reservations/r-test/confirm"].includes(path)) return Response.json(reservationResponse);
    throw new Error(`Unexpected fixture request: ${method} ${path}`);
  };
}
