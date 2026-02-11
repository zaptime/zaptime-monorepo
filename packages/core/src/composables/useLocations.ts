import { Location } from "../types/InitData";
import { computed } from "vue";
import { useCalendarScope } from "../scope/calendarScope";

export default function useLocations() {
  const scope = useCalendarScope();

  const setLocations = (newLocations: Location[]) => {
    if (newLocations) {
      scope.locations.value = newLocations;
    }
  };

  const isPhoneCall = computed(() => {
    if (
      scope.locations.value === undefined ||
      scope.locations.value.length === 0
    ) {
      return false;
    }

    return scope.locations.value.some((location) => location.value === "phone");
  });

  const locations = computed(() => {
    return scope.locations.value;
  });

  return {
    locations,
    setLocations,
    isPhoneCall,
  };
}
