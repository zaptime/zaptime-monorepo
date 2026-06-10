import {
  defaultConfig,
  mergeObjects,
  type ZaptimeConfig,
} from "@zaptime/core-shared";
import { createKeyedStore, useKeyedValue } from "../store/keyedStore";

const configStore = createKeyedStore<ZaptimeConfig>(defaultConfig);

function clone<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

/** Framework-agnostic accessors (used by the imperative API layer). */
export function getConfigValue(calendarId?: string): ZaptimeConfig {
  return configStore.getValue(calendarId);
}

export function setConfigValue(
  calendarId: string | undefined,
  cfg: ZaptimeConfig,
): void {
  // Clone the defaults before merging so calendars never mutate the shared
  // default configuration object (and therefore never bleed into each other).
  configStore.setValue(calendarId, mergeObjects(clone(defaultConfig), cfg));
}

export default function useConfig(calendarId?: string): {
  config: ZaptimeConfig;
  setConfig: (cfg: ZaptimeConfig) => void;
} {
  const config = useKeyedValue(configStore, calendarId);
  const setConfig = (cfg: ZaptimeConfig) => setConfigValue(calendarId, cfg);
  return { config, setConfig };
}
