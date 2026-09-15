import { useMemo, useSyncExternalStore } from "react";
import type { CalendarInstance, CalendarSnapshot, DeepReadonly } from "@zaptime/core";
type Snapshot = DeepReadonly<CalendarSnapshot>;
/** Structural equality also handles core snapshots that defensively clone domain slices. */
export function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  return ak.length === bk.length && ak.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}
export function useSlice<K extends keyof Snapshot>(calendar: CalendarInstance, ...keys: K[]): Pick<Snapshot, K> {
  const signature = keys.join(",");
  const store = useMemo(() => {
    let previous: Pick<Snapshot, K> | undefined;
    const getSnapshot = () => {
      const snapshot = calendar.getSnapshot();
      const selected = Object.fromEntries(keys.map((key) => [key, snapshot[key]])) as Pick<Snapshot, K>;
      if (previous && equal(previous, selected)) return previous;
      return (previous = selected);
    };
    const serverSnapshot = getSnapshot();
    return { subscribe: calendar.subscribe, getSnapshot, getServerSnapshot: () => serverSnapshot };
  }, [calendar, signature]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
