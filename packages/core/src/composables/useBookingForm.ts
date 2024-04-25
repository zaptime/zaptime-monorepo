import { ref, computed } from 'vue';
import { CustomField, CustomFieldValue, CustomFieldCollected } from '../types/InitData';

const state = ref<Record<string, CustomField[]>>({
  __DEFAULT__: [],
});

const knownFieldsByMergeTag = ['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'PHONE'] as const;

export default function useBookingForm(calendarId?: string) {
  const setBookingForm = (customFields: CustomField[]) => {
    if (calendarId === undefined) {
      state.value.__DEFAULT__ = customFields;
    } else {
      state.value[calendarId] = customFields;
    }
  };

  const bookingForm = computed(() => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }

    return state.value[calendarId];
  });

  function setCustomFieldValue(uuid: string, value: CustomFieldValue) {
    const field = bookingForm.value.find((field) => field.uuid === uuid);

    if (field === undefined) {
      return;
    }

    field.value = value;
  }

  function collectKnownFields() {
    const firstName = bookingForm.value.find((field) => field.mergeTag === 'FIRST_NAME');
    const lastName = bookingForm.value.find((field) => field.mergeTag === 'LAST_NAME');
    const email = bookingForm.value.find((field) => field.mergeTag === 'EMAIL');
    const phone = bookingForm.value.find((field) => field.mergeTag === 'PHONE');

    return {
      email: String(email?.value), //required
      firstName: firstName?.value ? String(firstName.value) : undefined,
      lastName: lastName?.value ? String(lastName.value) : undefined,
      phone: phone?.value ? String(phone.value) : undefined,
    };
  }

  function collectUnknownFields() {
    const customFieldsCollected: CustomFieldCollected[] = [];

    const unknownCustomFields = bookingForm.value.filter((field) => !knownFieldsByMergeTag.includes(field.mergeTag as any));

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
