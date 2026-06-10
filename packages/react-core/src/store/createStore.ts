import { useSyncExternalStore } from "react";

/**
 * A minimal framework-agnostic observable store.
 *
 * This is the React-world equivalent of the module-level `ref`/`reactive`
 * stores that `@zaptime/core` uses under the hood: state lives in module scope
 * (shared across every hook caller and across mounts/unmounts) and React
 * components subscribe to it via `useSyncExternalStore`.
 *
 * Updates MUST be immutable — `set` only notifies when the value reference
 * actually changes (compared with `Object.is`). This keeps `getSnapshot`
 * referentially stable, which `useSyncExternalStore` requires.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set: (next) => {
      const value =
        typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Subscribe a React component to a store. The selector must return a
 * referentially stable value when the underlying data has not changed
 * (return the stored value directly, or a primitive) to avoid render loops.
 */
export function useStoreValue<T, S = T>(
  store: Store<T>,
  selector: (state: T) => S = (state) => state as unknown as S,
): S {
  const getSnapshot = () => selector(store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
