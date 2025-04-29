import Status from "../types/Status";
import { ref, Ref, computed } from "vue";

type ReservationStatus = Ref<Status> | Record<string, Ref<Status>>;
let _reservationStatusState: ReservationStatus = {};

export default function useReservationStatus(calendarId?: string) {
  const setReservationStatus = (status: Status) => {
    if (calendarId === undefined) {
      _reservationStatusState.value = status;
    } else {
      _reservationStatusState = {
        [calendarId]: ref(status),
      };
    }
  };

  const reservationStatus = computed(() => {
    if (calendarId === undefined) {
      return _reservationStatusState.value as Status;
    }

    return (_reservationStatusState[calendarId as keyof ReservationStatus] as Ref<Status>).value;
  });

  return {
    setReservationStatus,
    reservationStatus,
  };
}
