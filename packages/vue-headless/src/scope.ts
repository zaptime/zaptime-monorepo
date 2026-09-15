import type { CalendarInstance, Unsubscribe } from "@zaptime/core";
export type CalendarTarget = CalendarInstance | string;
const live = (c: CalendarInstance) => !["disposing", "disposed"].includes(c.getSnapshot().phase);
export interface CalendarScope {
  register(id: string, calendar: CalendarInstance): Unsubscribe;
  resolve(id?: string): CalendarInstance;
}
export function createCalendarScope(): CalendarScope {
  const entries = new Map<string, { calendar: CalendarInstance; count: number }>();
  return {
    register(id, calendar) {
      const old = entries.get(id);
      if (old && live(old.calendar) && old.calendar !== calendar) throw new Error(`Duplicate calendar ID: ${id}`);
      const entry = old?.calendar === calendar ? old : { calendar, count: 0 };
      entry.count++;
      entries.set(id, entry);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        if (--entry.count === 0 && entries.get(id) === entry) entries.delete(id);
      };
    },
    resolve(id) {
      const candidates = [...new Set([...entries].filter(([key, e]) => (id === undefined || key === id) && live(e.calendar)).map(([, e]) => e.calendar))];
      if (candidates.length !== 1) throw new Error(candidates.length ? "Ambiguous calendar lookup" : "Missing calendar instance");
      return candidates[0];
    },
  };
}
const browserScopes = new Map<CalendarScope, { index: CalendarScope; count: number }>();
export function mountScope(scope: CalendarScope, id: string, calendar: CalendarInstance) {
  if (typeof window === "undefined") return () => {};
  let entry = browserScopes.get(scope);
  if (!entry) {
    entry = { index: createCalendarScope(), count: 0 };
    browserScopes.set(scope, entry);
  }
  const unregister = entry.index.register(id, calendar);
  entry.count++;
  return () => {
    unregister();
    if (--entry.count === 0) browserScopes.delete(scope);
  };
}
export function resolveBrowser(id?: string): CalendarInstance {
  if (typeof window === "undefined") throw new Error("Calendar instance or scope required on server");
  const found: CalendarInstance[] = [];
  for (const { index } of browserScopes.values()) {
    try {
      found.push(index.resolve(id));
    } catch (error) {
      if ((error as Error).message.includes("Ambiguous")) throw error;
    }
  }
  if (found.length !== 1) throw new Error(found.length ? "Ambiguous calendar lookup" : "Missing calendar instance");
  return found[0];
}
