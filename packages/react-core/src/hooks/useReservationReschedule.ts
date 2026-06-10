import type { Reservation } from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

/*
 * Stores the received Reservation for rescheduling.
 */
const reservationStore = createKeyedStore<Reservation | undefined>(undefined);

/** Framework-agnostic accessors (used by the imperative API layer / init). */
export function getReservationValue(
  calendarId?: string,
): Reservation | undefined {
  return reservationStore.getValue(calendarId);
}

export function setSelectedReservationValue(
  calendarId: string | undefined,
  reservation: Reservation | undefined,
): void {
  reservationStore.setValue(calendarId, reservation);
}

export default function useReservationReschedule(calendarId?: string): {
  reservation: Reservation | undefined;
  setSelectedReservation: (reservation: Reservation | undefined) => void;
} {
  const reservation = useKeyedValue(reservationStore, calendarId);
  const setSelectedReservation = (next: Reservation | undefined) =>
    reservationStore.setValue(calendarId, next);
  return { reservation, setSelectedReservation };
}
