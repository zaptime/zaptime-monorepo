import type { CalendarSnapshot, DeepReadonly, Unsubscribe } from "./types";

/** Clone inputs before publication, including Dates (freezing alone does not protect them). */
export function immutableCopy<T>(value: T, copies = new WeakMap<object, object>()): DeepReadonly<T> {
  if (value && typeof value === "object" && copies.has(value)) {
    return copies.get(value) as DeepReadonly<T>;
  }
  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    copies.set(value, copy);
    for (const name of Object.getOwnPropertyNames(Date.prototype)) {
      if (name.startsWith("set")) {
        Object.defineProperty(copy, name, {
          value: () => {
            throw new TypeError("Snapshot dates are readonly");
          },
        });
      }
    }
    return Object.freeze(copy) as DeepReadonly<T>;
  }
  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    copies.set(value, copy);
    for (const item of value) copy.push(immutableCopy(item, copies));
    return Object.freeze(copy) as DeepReadonly<T>;
  }
  if (value && typeof value === "object") {
    const copy = Object.create(Object.getPrototypeOf(value));
    copies.set(value, copy);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if ("value" in descriptor) {
        // A cause is an opaque diagnostic handle (possibly a native Response or
        // cyclic Error). Preserve its identity and internal slots as Error.cause promises.
        if (!(value instanceof Error && key === "cause")) {
          descriptor.value = immutableCopy(descriptor.value, copies);
        }
        Object.defineProperty(copy, key, descriptor);
      } else {
        // Capture accessor values now, rather than retaining mutable caller closures.
        Object.defineProperty(copy, key, {
          value: immutableCopy(Reflect.get(value, key), copies),
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          writable: false,
        });
      }
    }
    return Object.freeze(copy);
  }
  return value as DeepReadonly<T>;
}

/** Internal store. Domain modules commit complete logical transitions atomically. */
export function createStore(initial: CalendarSnapshot) {
  let snapshot = immutableCopy(initial);
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    clearListeners() {
      listeners.clear();
    },
    commit(patch: Partial<Omit<CalendarSnapshot, "revision">>): boolean {
      const keys = Object.keys(patch) as (keyof typeof patch)[];
      if (keys.every((key) => Object.is(snapshot[key], patch[key]))) return false;
      const copied: Record<string, unknown> = {};
      for (const key of keys) {
        copied[key] = Object.is(snapshot[key], patch[key]) ? snapshot[key] : immutableCopy(patch[key]);
      }
      snapshot = Object.freeze({ ...snapshot, ...copied, revision: snapshot.revision + 1 });
      for (const listener of [...listeners]) {
        try {
          listener();
        } catch {
          /* Observers cannot roll back a committed transition. */
        }
      }
      return true;
    },
  };
}
export type CalendarStore = ReturnType<typeof createStore>;
