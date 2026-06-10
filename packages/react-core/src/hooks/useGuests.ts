import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

interface GuestsState {
  guests: string[];
  maxGuests: number | null;
}

const guestsStore = createKeyedStore<GuestsState>({ guests: [], maxGuests: null });

/** Framework-agnostic accessors (used by booking form collection / init). */
export function getGuestsState(calendarId?: string): GuestsState {
  return guestsStore.getValue(calendarId);
}

export function setMaxGuestsValue(
  calendarId: string | undefined,
  n: number | null,
): void {
  guestsStore.updateValue(calendarId, (prev) => ({ ...prev, maxGuests: n }));
}

export default function useGuests(calendarId?: string): {
  guests: string[];
  maxGuests: number | null;
  guestsEnabled: boolean;
  canAddGuest: boolean;
  setMaxGuests: (n: number | null) => void;
  addGuest: (email?: string) => void;
  removeGuest: (index: number) => void;
  updateGuest: (index: number, email: string) => void;
} {
  const state = useKeyedValue(guestsStore, calendarId);
  const guests = state.guests;
  const maxGuests = state.maxGuests;
  const guestsEnabled = maxGuests !== null && maxGuests > 0;
  const canAddGuest = guestsEnabled && guests.length < (maxGuests as number);

  const setMaxGuests = (n: number | null) => setMaxGuestsValue(calendarId, n);

  const addGuest = (email?: string) => {
    if (canAddGuest) {
      guestsStore.updateValue(calendarId, (prev) => ({
        ...prev,
        guests: [...prev.guests, email ?? ""],
      }));
    }
  };

  const removeGuest = (index: number) => {
    guestsStore.updateValue(calendarId, (prev) => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  const updateGuest = (index: number, email: string) => {
    guestsStore.updateValue(calendarId, (prev) => ({
      ...prev,
      guests: prev.guests.map((g, i) => (i === index ? email : g)),
    }));
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
