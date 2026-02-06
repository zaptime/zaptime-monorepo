import { ref, computed } from "vue";

const state = ref<
  Record<
    string,
    {
      guests: string[];
      maxGuests: number | null;
    }
  >
>({
  __DEFAULT__: {
    guests: [],
    maxGuests: null,
  },
});

const normalizeMaxGuests = (
  value: number | null | undefined,
): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  return null;
};

export default function useGuests(calendarId?: string) {
  const getState = () => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }
    if (!state.value[calendarId]) {
      state.value[calendarId] = {
        guests: [],
        maxGuests: null,
      };
    }
    return state.value[calendarId];
  };

  const setMaxGuests = (maxGuests: number | null) => {
    const s = getState();
    s.maxGuests = normalizeMaxGuests(maxGuests);
  };

  const isEnabled = computed(() => {
    const s = getState();
    return typeof s.maxGuests === "number";
  });

  const maxGuests = computed(() => {
    return getState().maxGuests;
  });

  const guests = computed(() => {
    return getState().guests;
  });

  const canAddMore = computed(() => {
    if (typeof maxGuests.value !== "number") {
      return false;
    }

    return guests.value.length < maxGuests.value;
  });

  const addGuest = (email: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: "Email is required" };
    }

    const s = getState();

    if (typeof maxGuests.value !== "number") {
      return { success: false, error: "Guests are disabled" };
    }

    if (s.guests.some((g) => g.toLowerCase() === trimmedEmail)) {
      return { success: false, error: "This email is already added" };
    }

    if (s.guests.length >= maxGuests.value) {
      return {
        success: false,
        error: `Maximum ${maxGuests.value} guests allowed`,
      };
    }

    s.guests.push(trimmedEmail);
    return { success: true };
  };

  const removeGuest = (email: string) => {
    const s = getState();
    const index = s.guests.findIndex(
      (g) => g.toLowerCase() === email.toLowerCase(),
    );
    if (index !== -1) {
      s.guests.splice(index, 1);
    }
  };

  const clearGuests = () => {
    const s = getState();
    s.guests = [];
  };

  const collectGuests = (): string[] => {
    return [...getState().guests];
  };

  return {
    guests,
    maxGuests,
    isEnabled,
    canAddMore,
    setMaxGuests,
    addGuest,
    removeGuest,
    clearGuests,
    collectGuests,
  };
}
