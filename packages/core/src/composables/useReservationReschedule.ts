import { ref, computed, type ComputedRef } from "vue";
import type { Reservation } from "@zaptime/core-shared";

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
export default function useReservationReschedule(calendarId?: string): {
  setSelectedReservation: (timeSlot: Reservation | undefined) => void;
  reservation: ComputedRef<Reservation | undefined>;
} {
  if (
    calendarId !== undefined &&
    selectedReservation.value[calendarId] === undefined
  ) {
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

  const reservation: ComputedRef<Reservation | undefined> = computed(() => {
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
