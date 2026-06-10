import { createStore, useStoreValue } from "../store/createStore";

const clientOriginalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const timezoneStore = createStore<string>(clientOriginalTimezone);

/** Framework-agnostic accessor (used by the imperative API layer). */
export function getTimezoneValue(): string {
  return timezoneStore.get();
}

export default function useCurrentTimezone(): {
  clientOriginalTimezone: string;
  timezone: string;
  setTimezone: (timezone: string) => void;
} {
  const timezone = useStoreValue(timezoneStore);
  const setTimezone = (tz: string) => timezoneStore.set(tz);
  return { clientOriginalTimezone, timezone, setTimezone };
}
