import { ref, computed } from "vue";
import { GuestsConfig } from "../types/InitData";

const DEFAULT_MAX_GUESTS = 10;

const state = ref<
  Record<
    string,
    {
      guests: string[];
      config: GuestsConfig | null;
    }
  >
>({
  __DEFAULT__: {
    guests: [],
    config: null,
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useGuests(calendarId?: string) {
  const getState = () => {
    if (calendarId === undefined) {
      return state.value.__DEFAULT__;
    }
    if (!state.value[calendarId]) {
      state.value[calendarId] = {
        guests: [],
        config: null,
      };
    }
    return state.value[calendarId];
  };

  const setGuestsConfig = (config: GuestsConfig) => {
    const s = getState();
    s.config = config;
  };

  const isEnabled = computed(() => {
    const s = getState();
    return s.config?.enabled ?? false;
  });

  const maxGuests = computed(() => {
    const s = getState();
    return s.config?.maxGuests ?? DEFAULT_MAX_GUESTS;
  });

  const guests = computed(() => {
    return getState().guests;
  });

  const canAddMore = computed(() => {
    return guests.value.length < maxGuests.value;
  });

  const addGuest = (
    email: string,
  ): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: "Email is required" };
    }

    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Invalid email format" };
    }

    const s = getState();

    if (s.guests.some((g) => g.toLowerCase() === trimmedEmail)) {
      return { success: false, error: "This email is already added" };
    }

    if (s.guests.length >= maxGuests.value) {
      return { success: false, error: `Maximum ${maxGuests.value} guests allowed` };
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
    setGuestsConfig,
    addGuest,
    removeGuest,
    clearGuests,
    collectGuests,
  };
}
