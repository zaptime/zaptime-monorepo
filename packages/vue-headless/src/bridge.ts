import { computed, getCurrentScope, onScopeDispose, shallowRef, type Ref } from "vue";
import { CalendarError, type CalendarInstance, type CalendarSnapshot, type DeepReadonly } from "@zaptime/core";
export function snapshotBridge(calendar: CalendarInstance) {
  const snapshot = shallowRef(calendar.getSnapshot());
  const stop = calendar.subscribe(() => {
    snapshot.value = calendar.getSnapshot();
  });
  if (getCurrentScope()) onScopeDispose(stop);
  return snapshot;
}
export function copy<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) return value.map(copy) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, copy(v)])) as T;
  return value;
}
export function facade<T extends object>(read: () => T, write?: (value: T, path?: PropertyKey[]) => void, beforeDelete?: () => void): T {
  const mutate = (path: PropertyKey[], fn: (parent: any) => void, changedPath = path) => {
    if (!write) throw new Error("Calendar derived state is readonly");
    const draft = copy(read());
    let parent: any = draft;
    for (const key of path) parent = parent[key];
    fn(parent);
    write(draft, changedPath);
  };
  const at = (path: PropertyKey[]) => {
    let value: any = read();
    for (const key of path) value = value?.[key];
    return value;
  };
  const cache = new Map<string, any>();
  const proxy = (path: PropertyKey[]): any => {
    const key = path.map(String).join("\0");
    if (cache.has(key)) return cache.get(key);
    const target = Array.isArray(at(path)) ? [] : {};
    const result = new Proxy(target, {
      get(_, prop) {
        const value = at(path);
        if (prop === Symbol.iterator && Array.isArray(value))
          return function* () {
            for (let i = 0; i < at(path).length; i++) yield proxy(path)[i];
          };
        if (Array.isArray(value) && ["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin"].includes(String(prop)))
          return (...args: any[]) => {
            let output: any;
            mutate(path, (parent) => {
              output = parent[prop](...args);
            });
            return output;
          };
        const child = value?.[prop];
        if (child instanceof Date) return new Date(child.getTime());
        if (child && typeof child === "object") return proxy([...path, prop]);
        if (typeof child === "function") return child.bind(result);
        return child;
      },
      set(_, prop, value) {
        mutate(
          path,
          (parent) => {
            parent[prop] = copy(value);
          },
          [...path, prop],
        );
        return true;
      },
      deleteProperty(_, prop) {
        beforeDelete?.();
        mutate(
          path,
          (parent) => {
            delete parent[prop];
          },
          [...path, prop],
        );
        return true;
      },
      ownKeys() {
        const keys = Reflect.ownKeys(at(path) ?? {});
        if (Array.isArray(target) && !keys.includes("length")) keys.push("length");
        return keys;
      },
      getOwnPropertyDescriptor(_, prop) {
        const current = at(path);
        if (Array.isArray(target) && prop === "length") return { ...Reflect.getOwnPropertyDescriptor(target, "length")!, value: current?.length ?? 0 };
        if (current == null || !Object.prototype.hasOwnProperty.call(current, prop)) return undefined;
        return { enumerable: true, configurable: true, writable: Boolean(write), value: current[prop] };
      },
      has(_, prop) {
        return prop in (at(path) ?? {});
      },
    });
    cache.set(key, result);
    return result;
  };
  return proxy([]);
}
/** Preserve the one-argument Vue 3.4 Ref contract in inferred public declarations. */
export interface EditableRef<T> extends Ref<T> {}
export function editable<K extends keyof CalendarSnapshot>(snapshot: Ref<DeepReadonly<CalendarSnapshot>>, key: K, write: (value: CalendarSnapshot[K], path?: PropertyKey[]) => void): EditableRef<CalendarSnapshot[K]> {
  const read = () => snapshot.value[key] as CalendarSnapshot[K];
  const value = facade(
    read as () => object,
    write as (v: object) => void,
    key === "config"
      ? () => {
          throw new CalendarError("invalid-config", "Config deletion is unsupported; assign an explicit replacement value");
        }
      : undefined,
  );
  return computed({
    get: () => {
      void snapshot.value;
      return value as CalendarSnapshot[K];
    },
    set: write,
  });
}
