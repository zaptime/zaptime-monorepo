import TimeSlot from '../types/TimeSlot';
import { ref, computed } from 'vue';

type SelectedTimeSlot = {
  selectedTimeSlot: TimeSlot | undefined;
};

const _selectedTimeSlot = ref<Record<string, SelectedTimeSlot>>({
  __DEFAULT__: {
    selectedTimeSlot: undefined,
  },
});

export default function useSelectedTimeSlot(calendarId?: string) {
  if (calendarId !== undefined && _selectedTimeSlot.value[calendarId] === undefined) {
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

  const selectedTimeSlot = computed(() => {
    if (calendarId === undefined) {
      return _selectedTimeSlot.value.__DEFAULT__.selectedTimeSlot as TimeSlot | undefined;
    } else {
      return _selectedTimeSlot.value[calendarId].selectedTimeSlot as TimeSlot | undefined;
    }
  });

  return {
    setSelectedTimeSlot,
    selectedTimeSlot,
  };
}
