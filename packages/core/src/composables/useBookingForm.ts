import { computed } from "vue";
import {
  CustomField,
  CustomFieldValue,
  CustomFieldCollected,
} from "../types/InitData";
import { useCalendarScope } from "../scope/calendarScope";

const knownFieldsByMergeTag = [
  "FIRST_NAME",
  "LAST_NAME",
  "EMAIL",
  "PHONE",
] as const;

export default function useBookingForm() {
  const scope = useCalendarScope();

  const setBookingForm = (customFields: CustomField[]) => {
    scope.bookingForm.value = customFields;
  };

  const bookingForm = computed(() => {
    return scope.bookingForm.value;
  });

  function setCustomFieldValue(uuid: string, value: CustomFieldValue) {
    const field = bookingForm.value.find((field) => field.uuid === uuid);

    if (field === undefined) {
      return;
    }

    field.value = value;
  }

  function collectKnownFields() {
    const firstName = bookingForm.value.find(
      (field) => field.mergeTag === "FIRST_NAME",
    );
    const lastName = bookingForm.value.find(
      (field) => field.mergeTag === "LAST_NAME",
    );
    const email = bookingForm.value.find((field) => field.mergeTag === "EMAIL");
    const phone = bookingForm.value.find((field) => field.mergeTag === "PHONE");

    return {
      email: email?.value ? String(email.value) : "",
      firstName: firstName?.value ? String(firstName.value) : undefined,
      lastName: lastName?.value ? String(lastName.value) : undefined,
      phone: phone?.value ? String(phone.value) : undefined,
    };
  }

  function collectUnknownFields() {
    const customFieldsCollected: CustomFieldCollected[] = [];

    const unknownCustomFields = bookingForm.value.filter(
      (field) => !knownFieldsByMergeTag.includes(field.mergeTag as any),
    );

    for (const unknownCustomField of unknownCustomFields) {
      customFieldsCollected.push({
        uuid: unknownCustomField.uuid,
        value: unknownCustomField.value,
      });
    }

    return customFieldsCollected;
  }

  function collectFormValues() {
    const { firstName, lastName, email, phone } = collectKnownFields();

    return {
      firstName,
      lastName,
      email,
      phone,
      customFields: collectUnknownFields(),
    };
  }

  return {
    setBookingForm,
    bookingForm,
    setCustomFieldValue,
    collectFormValues,
  };
}
