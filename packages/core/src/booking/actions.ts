import { CalendarError } from "../api/errors";
import type { CalendarContext } from "../calendar/lifecycle";
import type { CalendarActions } from "../calendar/types";
import { createFieldActions } from "../forms/fields";
import { validateBookingInput } from "./validation";
import { createWorkflow, type Transaction } from "./workflow";
import { recoverTransaction } from "./recovery";
import type { BookingInput, ConfirmationInput, Operation, RecoveryResult } from "./types";

function key(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(key).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${key(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}
export function createBookingActions(context: CalendarContext) {
  const { store } = context;
  const workflow = createWorkflow(context);
  let active: { key: string; promise: Promise<any> } | undefined;
  let retained: Transaction | undefined;
  const fields = createFieldActions(context);
  // Identity reset releases the previous hold, even if initialization later fails.
  let identity = key([store.getSnapshot().config.token, store.getSnapshot().config.apiBaseUrl, store.getSnapshot().config.reservationUuid]);
  const unsubscribe = store.subscribe(() => {
    const s = store.getSnapshot();
    const next = key([s.config.token, s.config.apiBaseUrl, s.config.reservationUuid]);
    if (next !== identity) {
      identity = next;
      workflow.stop();
      retained = undefined;
    }
  });
  context.addCleanup(() => {
    unsubscribe();
    retained = undefined;
  });
  function coordinate<T>(operation: Operation | "recover", raw: unknown, execute: () => Promise<T>): Promise<T> {
    try {
      context.assertActive();
      const operationKey = key([operation, raw]);
      if (active) return active.key === operationKey ? active.promise : Promise.reject(new CalendarError("busy", "Another booking operation is running"));
      if (operation !== "recover" && store.getSnapshot().phase === "recovery-required") throw new CalendarError("recovery-required", "Resolve the previous operation before retrying");
      if (store.getSnapshot().phase === "success") throw new CalendarError("busy", "Booking is already complete");
      const promise = Promise.resolve()
        .then(execute)
        .finally(() => {
          active = undefined;
        });
      active = { key: operationKey, promise };
      context.trackTransaction(promise);
      if (operation !== "recover") store.commit({ phase: "submitting", error: undefined });
      return promise;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  function action(operation: Operation, raw: Partial<BookingInput> = {}): Promise<any> {
    // Clone synchronously before the caller can mutate arguments.
    let cloned: Partial<BookingInput>;
    try {
      context.assertActive();
      cloned = structuredClone(raw);
    } catch (error) {
      return Promise.reject(error instanceof CalendarError ? error : new CalendarError("validation", "Booking input must contain plain values"));
    }
    const snapshot = store.getSnapshot();
    let collected: ReturnType<typeof fields.collectFormValues>;
    try {
      collected = fields.collectFormValues();
    } catch (error) {
      return Promise.reject(error);
    }
    const previousInput = operation === "confirm" ? (workflow.getHold()?.input ?? retained?.input) : undefined;
    const input: BookingInput = { ...collected, ...previousInput, seats: snapshot.seats, location: snapshot.locations[0] ? { ...snapshot.locations[0] } : undefined, ...cloned };
    if (Array.isArray(input.guests)) input.guests = input.guests.filter((g) => typeof g !== "string" || g.trim() !== "");
    return coordinate(operation, cloned, async () => {
      const tx: Transaction = { snapshot, input, recovery: { operationId: context.runtime.createOperationId(), operation, reservationUuid: snapshot.reservationUuid, paymentStatus: "not-started" } };
      // Continue the original prepared reservation identity for granular confirmation/cancellation.
      const hold = workflow.getHold();
      if (hold && (operation === "confirm" || operation === "cancel")) tx.recovery = { ...hold.recovery, operation };
      try {
        if (operation !== "cancel") {
          if (operation !== "confirm" && !snapshot.selectedTimeSlot) throw new CalendarError("validation", "Select a time slot");
          if (operation !== "reschedule" && !(operation === "submit" && (snapshot.reservation || snapshot.config.reservationUuid))) validateBookingInput(snapshot, input);
        }
        if ((operation === "reserve" || operation === "book" || (operation === "submit" && !snapshot.reservation && !snapshot.config.reservationUuid)) && snapshot.reservationUuid)
          throw new CalendarError("busy", "An existing reservation must be resolved first");
        retained = tx;
        store.commit({ phase: "submitting", error: undefined });
        const response = await workflow.run(tx);
        if (store.getSnapshot().phase === "submitting") store.commit({ phase: "ready" });
        return response;
      } catch (cause) {
        const error = cause instanceof CalendarError ? cause : new CalendarError(tx.step === "payment" ? "recovery-required" : "api", "Booking operation failed");
        if (error.code === "recovery-required" || (tx.recovery.reservationUuid && tx.step !== undefined)) workflow.unresolved(tx, error);
        else store.commit({ phase: error.code === "validation" || error.code === "busy" ? snapshot.phase : "error", error });
        context.emit({ type: "error", payload: error });
        throw error;
      }
    });
  }
  const actions: Pick<CalendarActions, "book" | "reserve" | "confirm" | "cancel" | "reschedule" | "submit" | "recover" | "stopReservationRefresh"> = {
    book: (input) => action("book", input),
    reserve: (input) => action("reserve", input),
    confirm: (input?: ConfirmationInput) => action("confirm", input),
    cancel: () => action("cancel"),
    reschedule: () => action("reschedule"),
    submit: (input) => action("submit", input),
    recover: () =>
      coordinate<RecoveryResult>("recover", undefined, async () => {
        if (!retained || store.getSnapshot().phase !== "recovery-required") throw new CalendarError("validation", "No unresolved booking to recover");
        try {
          return await recoverTransaction(context, workflow, retained);
        } catch (cause) {
          const error = cause instanceof CalendarError ? cause : new CalendarError("recovery-required", "Reconciliation failed");
          workflow.unresolved(retained, error);
          throw error;
        }
      }),
    stopReservationRefresh: () => {
      context.assertActive();
      workflow.stop();
    },
  };
  return { actions };
}
