import { ref, Ref, computed } from 'vue';
import { CustomField } from '../types/InitData';

type BookingFormState = Ref<CustomField[]> | Record<string, Ref<CustomField[]>>;
let bookingFormState: BookingFormState = {};

export default function useBookingForm(calendarId?: string) {
  const setBookingForm = (bookingForm: CustomField[]) => {
    if (calendarId === undefined) {
      bookingFormState.value = bookingForm;
    } else {
      bookingFormState = {
        calendarId: ref(bookingForm),
      };
    }
  };

  const bookingForm = computed(() => {
    if (calendarId === undefined) {
      return bookingFormState.value as CustomField[];
    }

    return bookingFormState[calendarId as keyof BookingFormState] as CustomField[];
  });

  return {
    setBookingForm,
    bookingForm,
  };
}
