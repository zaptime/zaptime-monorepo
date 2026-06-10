import type { TimeSlot } from "@zaptime/core-shared";
import { ref, computed, type ComputedRef } from "vue";

type SelectedTimeSlot = {
  selectedTimeSlot: TimeSlot | undefined;
};

const _selectedTimeSlot = ref<Record<string, SelectedTimeSlot>>({
  __DEFAULT__: {
    selectedTimeSlot: undefined,
  },
});

export default function useSelectedTimeSlot(calendarId?: string): {
  setSelectedTimeSlot: (timeSlot: TimeSlot | undefined) => void;
  selectedTimeSlot: ComputedRef<TimeSlot | undefined>;
} {
  if (
    calendarId !== undefined &&
    _selectedTimeSlot.value[calendarId] === undefined
  ) {
    _selectedTimeSlot.value[calendarId] = {
      selectedTimeSlot: undefined,
    };
  }

  const setSelectedTimeSlot = (timeSlot: TimeSlot | undefined) => {
    if (calendarId === undefined) {
      _selectedTimeSlot.value.__DEFAULT__.selectedTimeSlot = timeSlot;
    } else {
      _selectedTimeSlot.value[calendarId].selectedTimeSlot = timeSlot;
    }
  };

  const selectedTimeSlot: ComputedRef<TimeSlot | undefined> = computed(() => {
    if (calendarId === undefined) {
      return _selectedTimeSlot.value.__DEFAULT__.selectedTimeSlot as
        | TimeSlot
        | undefined;
    } else {
      return _selectedTimeSlot.value[calendarId].selectedTimeSlot as
        | TimeSlot
        | undefined;
    }
  });

  return {
    setSelectedTimeSlot,
    selectedTimeSlot,
  };
}
