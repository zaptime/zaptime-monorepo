import Status from "../types/Status";
import { computed } from "vue";
import { useCalendarScope } from "../scope/calendarScope";

export default function useReservationStatus() {
  const scope = useCalendarScope();

  const setReservationStatus = (status: Status) => {
    scope.reservationStatus.value = status;
  };

  const reservationStatus = computed(() => {
    return scope.reservationStatus.value as Status | undefined;
  });

  return {
    setReservationStatus,
    reservationStatus,
  };
}
