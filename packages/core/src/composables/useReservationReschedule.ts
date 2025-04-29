import { ref, computed } from "vue";
import type { Reservation } from "../types/InitData";

type ReservationState = {
  reservation: Reservation | undefined;
};

const selectedReservation = ref<Record<string, ReservationState>>({
  __DEFAULT__: {
    reservation: undefined,
  },
});

/*
 * This composable is used to store the recieved Reservation for rescheduling.
 */
export default function useReservationReschedule(calendarId?: string) {
  if (calendarId !== undefined && selectedReservation.value[calendarId] === undefined) {
    selectedReservation.value[calendarId] = {
      reservation: undefined,
    };
  }

  const setSelectedReservation = (timeSlot: Reservation | undefined) => {
    if (calendarId === undefined) {
      selectedReservation.value.__DEFAULT__.reservation = timeSlot;
    } else {
      selectedReservation.value[calendarId].reservation = timeSlot;
    }
  };

  const reservation = computed(() => {
    if (calendarId === undefined) {
      return selectedReservation.value.__DEFAULT__.reservation;
    } else {
      return selectedReservation.value[calendarId].reservation;
    }
  });

  return {
    setSelectedReservation,
    reservation,
  };
}
