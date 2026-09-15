import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarActions } from "../calendar/types";
import type { CustomField } from "../types/InitData";
import { assertFormEditable, invalid, validateFieldValue } from "../booking/validation";

const knownTags = ["FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE"];
export function createFieldActions(context: CalendarContext): Pick<CalendarActions, "setBookingForm" | "setCustomFieldValue" | "collectFormValues"> {
  const { store } = context;
  return {
    setBookingForm(fields) {
      assertFormEditable(context);
      for (const field of fields) if (field.value !== undefined) validateFieldValue(field, field.value);
      store.commit({ bookingForm: fields });
    },
    setCustomFieldValue(uuid, value) {
      assertFormEditable(context);
      const fields = store.getSnapshot().bookingForm;
      const field = fields.find(field => field.uuid === uuid);
      if (!field) invalid(uuid, "unknown-field");
      validateFieldValue(field, value);
      store.commit({ bookingForm: fields.map(field => ({ ...field, options: field.options ? [...field.options] : undefined, value: field.uuid === uuid ? value : Array.isArray(field.value) ? [...field.value] : field.value })) as CustomField[] });
    },
    collectFormValues() {
      context.assertActive();
      const { bookingForm, guests, maxGuests } = store.getSnapshot();
      const known = (tag: string) => {
        const value = bookingForm.find(field => field.mergeTag === tag)?.value;
        return value === undefined || value === "" ? undefined : String(value);
      };
      const filtered = (maxGuests ?? 0) > 0 ? guests.filter(guest => guest.trim() !== "") : [];
      return {
        firstName: known("FIRST_NAME"), lastName: known("LAST_NAME"), email: known("EMAIL") ?? "", phone: known("PHONE"),
        customFields: bookingForm.filter(field => !knownTags.includes(field.mergeTag ?? "")).map(({uuid, value}) => ({uuid, value: typeof value === "object" ? [...value] : value})),
        guests: filtered.length ? filtered : undefined,
      };
    },
  };
}
