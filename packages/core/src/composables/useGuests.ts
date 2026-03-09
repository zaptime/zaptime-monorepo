import { ref, computed } from "vue";

interface State {
  guests: string[];
  maxGuests: number | null;
}

const state = ref<Record<string, State>>({
  __DEFAULT__: { guests: [], maxGuests: null },
});

function getState(calendarId?: string): State {
  const key = calendarId ?? "__DEFAULT__";
  if (!state.value[key]) {
    state.value[key] = { guests: [], maxGuests: null };
  }
  return state.value[key];
}

export default function useGuests(calendarId?: string) {
  const setMaxGuests = (n: number | null) => {
    getState(calendarId).maxGuests = n;
  };

  const maxGuests = computed(() => getState(calendarId).maxGuests);

  const guests = computed(() => getState(calendarId).guests);

  const guestsEnabled = computed(
    () => maxGuests.value !== null && maxGuests.value > 0,
  );

  const canAddGuest = computed(
    () =>
      guestsEnabled.value && guests.value.length < (maxGuests.value as number),
  );

  const addGuest = (email?: string) => {
    if (canAddGuest.value) {
      getState(calendarId).guests.push(email ?? "");
    }
  };

  const removeGuest = (index: number) => {
    getState(calendarId).guests.splice(index, 1);
  };

  const updateGuest = (index: number, email: string) => {
    getState(calendarId).guests[index] = email;
  };

  return {
    guests,
    maxGuests,
    guestsEnabled,
    canAddGuest,
    setMaxGuests,
    addGuest,
    removeGuest,
    updateGuest,
  };
}
