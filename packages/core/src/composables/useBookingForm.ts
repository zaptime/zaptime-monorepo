import { ref, Ref, computed } from 'vue';
import { BookingForm } from '../types/InitData';

type BookingFormState = Ref<BookingForm[]> | Record<string, Ref<BookingForm[]>>;
let bookingFormState: BookingFormState = {};

export default function useBookingForm(calendarId?: string) {
  const setBookingForm = (bookingForm: BookingForm[]) => {
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
      return bookingFormState.value as BookingForm[];
    }

    return bookingFormState[calendarId as keyof BookingFormState] as BookingForm[];
  });

  return {
    setBookingForm,
    bookingForm,
  };
}
