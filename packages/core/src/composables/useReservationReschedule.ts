import { computed } from "vue";
import type { Reservation } from "../types/InitData";
import { useCalendarScope } from "../scope/calendarScope";

/*
 * This composable is used to store the recieved Reservation for rescheduling.
 */
export default function useReservationReschedule() {
  const scope = useCalendarScope();

  const setSelectedReservation = (timeSlot: Reservation | undefined) => {
    scope.reservation.value = timeSlot;
  };

  const reservation = computed(() => {
    return scope.reservation.value;
  });

  return {
    setSelectedReservation,
    reservation,
  };
}
