import { Location } from "../types/InitData";
import { ref, computed } from "vue";

const state = ref<Record<string, Location[]>>({
  __DEFAULT__: [],
});

export default function useLocations(calendarId?: string) {
  const setLocations = (newLocations: Location[]) => {
    if (newLocations) {
      if (calendarId === undefined) {
        state.value.__DEFAULT__ = newLocations;
      } else {
        state.value[calendarId] = newLocations;
      }
    }
  };

  const isPhoneCall = computed(() => {
    if (calendarId) {
      if (
        state.value[calendarId] === undefined ||
        state.value[calendarId].length === 0
      ) {
        return false;
      }

      return state.value[calendarId].some(
        (location) => location.value === "phone",
      );
    } else {
      if (
        state.value.__DEFAULT__ === undefined ||
        state.value.__DEFAULT__.length === 0
      ) {
        return false;
      }

      return state.value.__DEFAULT__.some(
        (location) => location.value === "phone",
      );
    }
  });

  const locations = computed(() => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }

    return state.value[calendarId];
  });

  return {
    locations,
    setLocations,
    isPhoneCall,
  };
}
