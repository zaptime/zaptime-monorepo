import { useSyncExternalStore } from "react";
import { createStore, type Store } from "./createStore";

/**
 * A store keyed by `calendarId`, mirroring the multi-calendar state isolation
 * in `@zaptime/core` (a `Record<string, T>` with a `__DEFAULT__` fallback when
 * no `calendarId` is provided).
 *
 * All writes are immutable: a new record (and a new per-key value) is produced
 * on every change so that only the affected calendar's subscribers re-render.
 */
export interface KeyedStore<T> {
  store: Store<Record<string, T>>;
  getValue: (calendarId?: string) => T;
  setValue: (calendarId: string | undefined, value: T) => void;
  updateValue: (calendarId: string | undefined, updater: (prev: T) => T) => void;
}

export const DEFAULT_KEY = "__DEFAULT__";

export const keyOf = (calendarId?: string): string => calendarId ?? DEFAULT_KEY;

export function createKeyedStore<T>(defaultValue: T): KeyedStore<T> {
  const store = createStore<Record<string, T>>({ [DEFAULT_KEY]: defaultValue });

  const getValue = (calendarId?: string): T => {
    const current = store.get()[keyOf(calendarId)];
    return current === undefined ? defaultValue : current;
  };

  const setValue = (calendarId: string | undefined, value: T): void => {
    store.set((prev) => ({ ...prev, [keyOf(calendarId)]: value }));
  };

  const updateValue = (
    calendarId: string | undefined,
    updater: (prev: T) => T,
  ): void => {
    store.set((prev) => {
      const key = keyOf(calendarId);
      const current = prev[key] === undefined ? defaultValue : prev[key];
      return { ...prev, [key]: updater(current) };
    });
  };

  return { store, getValue, setValue, updateValue };
}

/**
 * Reactively read a calendar's value from a keyed store. Returns the stored
 * value directly (referentially stable until the next immutable write), so it
 * is safe to use as a `useSyncExternalStore` snapshot.
 */
export function useKeyedValue<T>(
  keyed: KeyedStore<T>,
  calendarId?: string,
): T {
  const getSnapshot = () => keyed.getValue(calendarId);
  return useSyncExternalStore(keyed.store.subscribe, getSnapshot, getSnapshot);
}
