import { CalendarError } from "../api/errors";
import { createStore, immutableCopy } from "./store";
import type { CalendarEvent, CalendarRuntime, CalendarSnapshot, CreateCalendarOptions } from "./types";

export function resolveRuntime(overrides: Partial<CalendarRuntime> = {}): CalendarRuntime {
  let fetchImplementation = overrides.fetch;
  let operationSequence = 0;
  return {
    fetch: (...args) => {
      fetchImplementation ??= globalThis.fetch.bind(globalThis);
      return fetchImplementation(...args);
    },
    now: () => new Date(),
    getTimezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    getHourCycle: () => new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle,
    createOperationId: () => globalThis.crypto?.randomUUID?.() ?? `operation-${Date.now()}-${++operationSequence}`,
    schedule: (callback, delayMs) => setTimeout(callback, delayMs),
    unschedule: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    ...overrides,
  };
}

export function initialSnapshot(options: CreateCalendarOptions): CalendarSnapshot {
  return {
    revision: 0,
    phase: "idle",
    config: options.config,
    calendar: { date: new Date(0), days: [], timeSlots: [], monthHasTimeSlots: false, selectedDay: null, loading: true, headers: [], initLoaded: false },
    timezone: "UTC",
    hourCycle: "h23",
    clientOriginalTimezone: "UTC",
    clientOriginalHourCycle: "h23",
    locations: [],
    bookingForm: [],
    guests: [],
    maxGuests: null,
    billingAddress: { name: "", email: "", company: "", address: "", city: "", postalCode: "", country: "", crn: "", vatId: "" },
    seats: 1,
    view: "calendar",
    calendarView: "pickingDate",
    isSubscribed: false,
  };
}

/** Private composition seam for availability, forms and booking modules. Never exported from entry. */
export function createCalendarContext(options: CreateCalendarOptions) {
  const store = createStore(initialSnapshot(options));
  const runtime = resolveRuntime(options.runtime);
  const eventListeners = new Set<(event: CalendarEvent) => void>();
  const transactions = new Set<Promise<unknown>>();
  const disposers = new Set<() => void>();
  const cleanups = new Set<() => void | Promise<void>>();
  let disposed = false;
  let disposal: Promise<void> | undefined;
  return {
    store,
    runtime,
    payment: options.payment,
    reconcile: options.reconcile,
    isDisposed: () => disposed,
    assertActive() {
      if (disposed) throw new CalendarError("disposed", "Calendar has been disposed");
    },
    emit(event: CalendarEvent) {
      if (disposed) return;
      const published = immutableCopy(event) as CalendarEvent;
      for (const listener of [...eventListeners]) {
        try {
          listener(published);
        } catch {
          /* Effects must not change transaction outcomes. */
        }
      }
    },
    onEvent(listener: (event: CalendarEvent) => void) {
      if (!disposed) eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },
    addCleanup(cleanup: () => void | Promise<void>) {
      if (disposed) throw new CalendarError("disposed", "Calendar has been disposed");
      cleanups.add(cleanup);
      return () => {
        cleanups.delete(cleanup);
      };
    },
    onDispose(callback: () => void) {
      disposers.add(callback);
      return () => {
        disposers.delete(callback);
      };
    },
    trackTransaction(transaction: Promise<unknown>) {
      transactions.add(transaction);
      void transaction.then(
        () => transactions.delete(transaction),
        () => transactions.delete(transaction),
      );
    },
    dispose(): Promise<void> {
      if (disposal) return disposal;
      disposed = true;
      store.clearListeners();
      eventListeners.clear();
      for (const callback of disposers) callback();
      disposers.clear();
      store.commit({ phase: "disposing" });
      disposal = Promise.resolve().then(async () => {
        await Promise.allSettled([...transactions]);
        const results = await Promise.allSettled([...cleanups].map((cleanup) => Promise.resolve().then(cleanup)));
        cleanups.clear();
        store.commit({ phase: "disposed" });
        const failures = results.filter((result) => result.status === "rejected");
        if (failures.length)
          throw new AggregateError(
            failures.map((result) => result.reason),
            "Calendar cleanup failed",
          );
      });
      return disposal;
    },
  };
}
export type CalendarContext = ReturnType<typeof createCalendarContext>;
