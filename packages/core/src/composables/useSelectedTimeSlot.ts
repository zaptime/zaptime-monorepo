import TimeSlot from "../types/TimeSlot";
import { computed } from "vue";
import { useCalendarScope } from "../scope/calendarScope";

export default function useSelectedTimeSlot() {
  const scope = useCalendarScope();

  const setSelectedTimeSlot = (timeSlot: TimeSlot | undefined) => {
    scope.selectedTimeSlot.value = timeSlot;
  };

  const selectedTimeSlot = computed(() => {
    return scope.selectedTimeSlot.value as TimeSlot | undefined;
  });

  return {
    setSelectedTimeSlot,
    selectedTimeSlot,
  };
}
