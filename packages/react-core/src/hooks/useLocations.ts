import type { Location } from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

const locationsStore = createKeyedStore<Location[]>([]);

/** Framework-agnostic accessors (used by the imperative API layer / init). */
export function getLocationsValue(calendarId?: string): Location[] {
  return locationsStore.getValue(calendarId);
}

export function setLocationsValue(
  calendarId: string | undefined,
  newLocations: Location[],
): void {
  if (newLocations) {
    locationsStore.setValue(calendarId, newLocations);
  }
}

export default function useLocations(calendarId?: string): {
  locations: Location[];
  setLocations: (newLocations: Location[]) => void;
  isPhoneCall: boolean;
} {
  const locations = useKeyedValue(locationsStore, calendarId);
  const setLocations = (newLocations: Location[]) =>
    setLocationsValue(calendarId, newLocations);
  const isPhoneCall =
    locations.length > 0 &&
    locations.some((location) => location.value === "phone");
  return { locations, setLocations, isPhoneCall };
}
