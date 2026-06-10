import type { Status } from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

const reservationStatusStore = createKeyedStore<Status | undefined>(undefined);

/** Framework-agnostic accessors (used by the imperative API layer). */
export function getReservationStatusValue(
  calendarId?: string,
): Status | undefined {
  return reservationStatusStore.getValue(calendarId);
}

export function setReservationStatusValue(
  calendarId: string | undefined,
  status: Status,
): void {
  reservationStatusStore.setValue(calendarId, status);
}

export default function useReservationStatus(calendarId?: string): {
  reservationStatus: Status | undefined;
  setReservationStatus: (status: Status) => void;
} {
  const reservationStatus = useKeyedValue(reservationStatusStore, calendarId);
  const setReservationStatus = (status: Status) =>
    reservationStatusStore.setValue(calendarId, status);
  return { reservationStatus, setReservationStatus };
}
