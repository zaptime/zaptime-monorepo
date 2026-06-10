import type {
  CustomField,
  CustomFieldValue,
  CustomFieldCollected,
} from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";
import { getGuestsState } from "./useGuests";

const bookingFormStore = createKeyedStore<CustomField[]>([]);

const knownFieldsByMergeTag = [
  "FIRST_NAME",
  "LAST_NAME",
  "EMAIL",
  "PHONE",
] as const;

export interface CollectedFormValues {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string;
  phone: string | undefined;
  customFields: CustomFieldCollected[];
  guests: string[] | undefined;
}

/** Framework-agnostic accessors (used during initialization). */
export function setBookingFormValue(
  calendarId: string | undefined,
  customFields: CustomField[],
): void {
  bookingFormStore.setValue(calendarId, customFields);
}

/**
 * Collect the values entered into the booking form, split into the well-known
 * attendee fields (by merge tag) and the remaining custom fields. Mirrors the
 * behaviour of `@zaptime/core`'s `collectFormValues`.
 */
export function collectFormValues(calendarId?: string): CollectedFormValues {
  const fields = bookingFormStore.getValue(calendarId);
  const byTag = (tag: string) => fields.find((field) => field.mergeTag === tag);

  const firstName = byTag("FIRST_NAME");
  const lastName = byTag("LAST_NAME");
  const email = byTag("EMAIL");
  const phone = byTag("PHONE");

  const customFields: CustomFieldCollected[] = fields
    .filter(
      (field) => !knownFieldsByMergeTag.includes(field.mergeTag as never),
    )
    .map((field) => ({ uuid: field.uuid, value: field.value }));

  const { guests, maxGuests } = getGuestsState(calendarId);
  const guestsEnabled = maxGuests !== null && maxGuests > 0;
  const filteredGuests = guestsEnabled
    ? guests.filter((g) => g.trim() !== "")
    : undefined;

  return {
    email: email?.value ? String(email.value) : "",
    firstName: firstName?.value ? String(firstName.value) : undefined,
    lastName: lastName?.value ? String(lastName.value) : undefined,
    phone: phone?.value ? String(phone.value) : undefined,
    customFields,
    guests:
      filteredGuests && filteredGuests.length > 0 ? filteredGuests : undefined,
  };
}

export default function useBookingForm(calendarId?: string): {
  setBookingForm: (customFields: CustomField[]) => void;
  bookingForm: CustomField[];
  setCustomFieldValue: (uuid: string, value: CustomFieldValue) => void;
  collectFormValues: () => CollectedFormValues;
} {
  const bookingForm = useKeyedValue(bookingFormStore, calendarId);

  const setBookingForm = (customFields: CustomField[]) =>
    bookingFormStore.setValue(calendarId, customFields);

  const setCustomFieldValue = (uuid: string, value: CustomFieldValue) => {
    bookingFormStore.updateValue(calendarId, (prev) =>
      prev.map((field) => (field.uuid === uuid ? { ...field, value } : field)),
    );
  };

  return {
    setBookingForm,
    bookingForm,
    setCustomFieldValue,
    collectFormValues: () => collectFormValues(calendarId),
  };
}
