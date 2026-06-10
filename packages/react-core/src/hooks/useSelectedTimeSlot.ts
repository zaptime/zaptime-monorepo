import type { TimeSlot } from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

const selectedTimeSlotStore = createKeyedStore<TimeSlot | undefined>(undefined);

/** Framework-agnostic accessors (used by the imperative API layer). */
export function getSelectedTimeSlotValue(
  calendarId?: string,
): TimeSlot | undefined {
  return selectedTimeSlotStore.getValue(calendarId);
}

export function setSelectedTimeSlotValue(
  calendarId: string | undefined,
  timeSlot: TimeSlot | undefined,
): void {
  selectedTimeSlotStore.setValue(calendarId, timeSlot);
}

export default function useSelectedTimeSlot(calendarId?: string): {
  selectedTimeSlot: TimeSlot | undefined;
  setSelectedTimeSlot: (timeSlot: TimeSlot | undefined) => void;
} {
  const selectedTimeSlot = useKeyedValue(selectedTimeSlotStore, calendarId);
  const setSelectedTimeSlot = (timeSlot: TimeSlot | undefined) =>
    selectedTimeSlotStore.setValue(calendarId, timeSlot);
  return { selectedTimeSlot, setSelectedTimeSlot };
}
