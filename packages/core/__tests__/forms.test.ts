import { describe, expect, it, vi } from "vitest";
import { createCalendar } from "../src/calendar/createCalendar";
import type { CustomField } from "../src/types/InitData";

const create = () => createCalendar({ config: { token: "test" } });
const field = (type: CustomField["type"], value?: CustomField["value"], extra: Partial<CustomField> = {}): CustomField => ({ uuid: type, name: type, label: type, type, required: false, value, ...extra });

describe("instance forms", () => {
  it("collects every field type and preserves optional false, zero, and arrays", () => {
    const c = create();
    const fields = [
      field("text", "Ada", { mergeTag: "FIRST_NAME" }),
      field("email", "ada@example.test", { mergeTag: "EMAIL" }),
      field("phone", "+123", { mergeTag: "PHONE" }),
      field("textarea", "notes", { mergeTag: "UNKNOWN" }),
      field("number", 0),
      field("switch", false),
      field("checkbox", false),
      field("select", "a", { options: ["a"] }),
      field("multiselect", ["a"], { options: ["a"] }),
      field("radio", "a", { options: ["a"] }),
      field("text", "Lovelace", { uuid: "last", mergeTag: "LAST_NAME" }),
    ];
    c.actions.setBookingForm(fields);
    expect(c.actions.collectFormValues()).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.test",
      phone: "+123",
      customFields: fields.filter((f) => !["FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE"].includes(f.mergeTag ?? "")).map(({ uuid, value }) => ({ uuid, value })),
      guests: undefined,
    });
    c.actions.setCustomFieldValue("number", 42);
    expect(c.getSnapshot().bookingForm.find((f) => f.uuid === "number")?.value).toBe(42);
    expect(() => c.actions.setCustomFieldValue("missing", "x")).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => c.actions.setCustomFieldValue("number", false)).toThrow(expect.objectContaining({ code: "validation" }));
  });
  it("enforces guest limits and indexes while collecting only nonblank enabled guests", () => {
    const c = create();
    expect(c.selectors.guestsEnabled()).toBe(false);
    expect(() => c.actions.addGuest()).toThrow(expect.objectContaining({ code: "validation" }));
    c.actions.setMaxGuests(2);
    c.actions.addGuest("guest@example.test");
    c.actions.addGuest(" ");
    expect(c.selectors.canAddGuest()).toBe(false);
    expect(() => c.actions.addGuest()).toThrow(expect.objectContaining({ code: "validation" }));
    expect(c.actions.collectFormValues().guests).toEqual(["guest@example.test"]);
    for (const index of [-1, 2, 0.5]) {
      expect(() => c.actions.removeGuest(index)).toThrow(expect.objectContaining({ code: "validation" }));
      expect(() => c.actions.updateGuest(index, "x")).toThrow(expect.objectContaining({ code: "validation" }));
    }
    c.actions.updateGuest(0, "new@example.test");
    c.actions.removeGuest(1);
    expect(c.getSnapshot().guests).toEqual(["new@example.test"]);
    c.actions.setMaxGuests(null);
    expect(c.actions.collectFormValues().guests).toBeUndefined();
    expect(() => c.actions.setMaxGuests(-1)).toThrow(expect.objectContaining({ code: "validation" }));
  });
  it("isolates billing defaults, clones caller inputs and preserves the calendar slice", () => {
    const a = create(),
      b = create();
    const calendar = a.getSnapshot().calendar;
    a.actions.updateBillingAddressField("email", "attendee@example.test");
    expect(b.getSnapshot().billingAddress.email).toBe("");
    const address = { ...a.getSnapshot().billingAddress, name: "Ada" };
    a.actions.setBillingAddress(address);
    address.name = "Changed";
    const fields = [field("multiselect", ["a"], { options: ["a", "b"] })];
    a.actions.setBookingForm(fields);
    (fields[0].value as string[]).push("b");
    fields[0].options!.push("c");
    const values = ["b"];
    a.actions.setCustomFieldValue("multiselect", values);
    values.push("a");
    expect(a.getSnapshot().bookingForm[0].value).toEqual(["b"]);
    expect(a.getSnapshot().bookingForm[0].options).toEqual(["a", "b"]);
    expect(a.getSnapshot().billingAddress.name).toBe("Ada");
    expect(a.getSnapshot().calendar).toBe(calendar);
  });
  it("sets ancillary state and emits view changes only on transitions", () => {
    const c = create();
    const event = vi.fn();
    c.onEvent(event);
    const locations = [{ type: "call", value: "phone" }];
    c.actions.setLocations(locations);
    locations[0].value = "changed";
    expect(c.selectors.isPhoneCall()).toBe(true);
    const stripe = { price: 100, currency: "usd", stripeAccountId: "acct" };
    c.actions.setStripeConfig(stripe);
    stripe.price = 200;
    expect(c.getSnapshot().stripeConfig?.price).toBe(100);
    c.actions.setStripeConfig(undefined);
    const reservation = { uuid: "res", email: "a@example.test", start: "start", end: "end", status: "pending" };
    c.actions.setSelectedReservation(reservation);
    reservation.uuid = "changed";
    expect(c.getSnapshot().reservation?.uuid).toBe("res");
    c.actions.setSelectedReservation(undefined);
    c.actions.setSeats(2);
    expect(c.getSnapshot().seats).toBe(2);
    for (const seats of [0, -1, 1.5, NaN, Infinity]) expect(() => c.actions.setSeats(seats)).toThrow(expect.objectContaining({ code: "validation" }));
    c.actions.setView("form");
    c.actions.setView("form");
    c.actions.setCalendarView("pickingTime");
    expect(event).toHaveBeenCalledExactlyOnceWith({ type: "view-changed", payload: "form" });
    expect(c.getSnapshot().calendarView).toBe("pickingTime");
  });
});

describe("submission validation", () => {
  it("reports required and malformed fields without rejecting optional false or zero", async () => {
    const { validateFields, FormValidationError } = await import("../src/booking/validation");
    expect(() => validateFields([field("number", 0), field("checkbox", false), field("switch", false)])).not.toThrow();
    try {
      validateFields([field("text", " ", { required: true }), field("checkbox", undefined, { required: true }), field("multiselect", [], { required: true }), field("email", "bad")]);
      expect.fail("expected validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(FormValidationError);
      expect((error as InstanceType<typeof FormValidationError>).fieldErrors).toEqual([
        { field: "text", code: "required" },
        { field: "checkbox", code: "required" },
        { field: "multiselect", code: "required" },
        { field: "email", code: "email" },
      ]);
    }
    expect(() => validateFields([field("email", "a@localhost")])).not.toThrow();
    expect(() => validateFields([field("select", "other", { options: ["a"] })])).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => validateFields([field("number", Infinity)])).toThrow(expect.objectContaining({ code: "validation" }));
  });
  it("validates effective overrides, selected seats, and guest emails before submission", async () => {
    const { validateBookingInput } = await import("../src/booking/validation");
    const c = create();
    c.actions.setBookingForm([field("email", "old@example.test", { mergeTag: "EMAIL", required: true }), field("text", "stored", { required: true })]);
    c.actions.setSelectedTimeSlot({ calendarId: 1, start: "start", end: "end", readableType: "event", seats: 2, title: "Event" });
    const valid = { email: "a@example.test", customFields: [{ uuid: "text", value: "override" }] };
    expect(() => validateBookingInput(c.getSnapshot(), valid)).not.toThrow();
    for (const email of ["", " ", "bad"]) expect(() => validateBookingInput(c.getSnapshot(), { ...valid, email })).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => validateBookingInput(c.getSnapshot(), { email: "a@example.test" })).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => validateBookingInput(c.getSnapshot(), { ...valid, seats: 3 })).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => c.actions.setSeats(3)).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => validateBookingInput(c.getSnapshot(), { ...valid, customFields: [{ uuid: "unknown", value: "x" }] })).toThrow(expect.objectContaining({ code: "validation" }));
    expect(() => validateBookingInput(c.getSnapshot(), { ...valid, guests: ["g@example.test"] })).toThrow(expect.objectContaining({ code: "validation" }));
    c.actions.setMaxGuests(2);
    expect(() => validateBookingInput(c.getSnapshot(), { ...valid, guests: [" ", "g@example.test"] })).not.toThrow();
    expect(() => validateBookingInput(c.getSnapshot(), { ...valid, guests: ["bad"] })).toThrow(expect.objectContaining({ code: "validation" }));
  });
  it("rejects malformed guest payloads as typed errors and retains editable drafts", async () => {
    const { validateBookingInput } = await import("../src/booking/validation");
    const c = create();
    c.actions.setMaxGuests(2);
    c.actions.addGuest("unfinished");
    expect(c.actions.collectFormValues().guests).toEqual(["unfinished"]);
    expect(() => validateBookingInput(c.getSnapshot(), { email: "a@example.test", guests: [false as unknown as string] })).toThrow(expect.objectContaining({ code: "validation" }));
  });
  it("rejects draft mutations after disposal", async () => {
    const c = create();
    await c.dispose();
    expect(() => c.actions.setBookingForm([])).toThrow(expect.objectContaining({ code: "disposed" }));
    expect(() => c.actions.addGuest()).toThrow(expect.objectContaining({ code: "disposed" }));
    expect(() => c.actions.updateBillingAddressField("name", "Ada")).toThrow(expect.objectContaining({ code: "disposed" }));
  });
});

describe("validation review regressions", () => {
  it("rejects duplicate custom field UUIDs before a contradictory later value can bypass validation", async () => {
    const { validateBookingInput } = await import("../src/booking/validation");
    const c = create();
    c.actions.setBookingForm([field("number", 1, { required: true })]);
    expect(() =>
      validateBookingInput(c.getSnapshot(), {
        email: "a@example.test",
        customFields: [
          { uuid: "number", value: 1 },
          { uuid: "number", value: false },
        ],
      }),
    ).toThrow(expect.objectContaining({ code: "validation", fieldErrors: [{ field: "number", code: "duplicate-field" }] }));
  });
  it("retains the original guest row index after ignoring blank rows", async () => {
    const { validateBookingInput } = await import("../src/booking/validation");
    const c = create();
    c.actions.setMaxGuests(2);
    expect(() => validateBookingInput(c.getSnapshot(), { email: "a@example.test", guests: [" ", "bad"] })).toThrow(expect.objectContaining({ fieldErrors: [{ field: "guests.1", code: "email" }] }));
  });
  it.each<CustomField["type"]>(["text", "email", "phone", "number", "textarea", "switch", "checkbox", "select", "multiselect", "radio"])("requires a supplied value for %s", async (type) => {
    const { validateFields } = await import("../src/booking/validation");
    expect(() => validateFields([field(type, undefined, { required: true })])).toThrow(expect.objectContaining({ fieldErrors: [{ field: type, code: "required" }] }));
  });
  it.each<[CustomField["type"], CustomField["value"]]>([
    ["text", "answer"],
    ["email", "a@example.test"],
    ["phone", "+123"],
    ["number", 0],
    ["textarea", "answer"],
    ["switch", false],
    ["checkbox", false],
    ["select", "a"],
    ["multiselect", ["a"]],
    ["radio", "a"],
  ])("accepts a supplied required %s value according to backend presence rules", async (type, value) => {
    const { validateFields } = await import("../src/booking/validation");
    expect(() => validateFields([field(type, value, { required: true })])).not.toThrow();
  });
  it.each(["submitting", "recovery-required"] as const)("guards form mutations in %s without publishing partial updates", async (phase) => {
    const { createCalendarContext } = await import("../src/calendar/lifecycle");
    const { createFieldActions } = await import("../src/forms/fields");
    const { createGuestActions } = await import("../src/forms/guests");
    const { createBillingActions } = await import("../src/forms/billing");
    const context = createCalendarContext({ config: { token: "test" } });
    const fields = createFieldActions(context),
      guests = createGuestActions(context).actions,
      billing = createBillingActions(context);
    fields.setBookingForm([field("text", "before")]);
    guests.setMaxGuests(2);
    guests.addGuest("a@example.test");
    context.store.commit({ phase });
    const before = context.store.getSnapshot();
    for (const action of [
      () => fields.setBookingForm([]),
      () => fields.setCustomFieldValue("text", "after"),
      () => guests.setMaxGuests(1),
      () => guests.addGuest(),
      () => guests.removeGuest(0),
      () => guests.updateGuest(0, "after"),
      () => billing.setBillingAddress({ ...before.billingAddress }),
      () => billing.updateBillingAddressField("name", "after"),
    ]) {
      expect(action).toThrow(expect.objectContaining({ code: "busy" }));
      expect(context.store.getSnapshot()).toBe(before);
    }
    expect(fields.collectFormValues().customFields).toEqual([{ uuid: "text", value: "before" }]);
  });
});
