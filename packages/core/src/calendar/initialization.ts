import { startOfMonth } from "date-fns";
import { tz, TZDate } from "@date-fns/tz";
import { createZaptimeClient } from "../api/client";
import { CalendarError } from "../api/errors";
import defaultConfig from "../defaultConfig";
import type ZaptimeConfig from "../types/ZaptimeConfig";
import type CalendarState from "../types/CalendarState";
import { initialSnapshot, type CalendarContext } from "./lifecycle";
import { createAvailability } from "./availability";
import { createPreferences, validateTimezone, validateHourCycle } from "./preferences";
export type CalendarStatePatch = Partial<CalendarState>;

/** Merge detached plain configuration values; undefined leaves earlier values intact. Identity/authorization clearing is handled explicitly by setConfig. */
function merge(...sources: unknown[]): any {
  const result: Record<string, unknown> = {};
  for (const source of sources)
    if (source && typeof source === "object")
      for (const [key, value] of Object.entries(source)) {
        if (value === undefined) continue;
        result[key] = value && typeof value === "object" && !Array.isArray(value) ? merge(result[key], value) : Array.isArray(value) ? value.map((v) => (v && typeof v === "object" ? merge(v) : v)) : value;
      }
  return result;
}
function validate(config: ZaptimeConfig) {
  if (typeof config.token !== "string" || !config.token.trim()) throw new CalendarError("invalid-config", "Calendar token is required");
  for (const key of ["min", "max", "closestBookableDay"] as const)
    if (config[key] !== undefined && (!Number.isInteger(config[key]) || config[key]! < 0)) throw new CalendarError("invalid-config", `${key} must be a nonnegative integer`);
  if (config.apiBaseUrl !== undefined) {
    try {
      const url = new URL(config.apiBaseUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw 0;
    } catch {
      throw new CalendarError("invalid-config", "Invalid API base URL");
    }
  }
  if (config.reservationUuid !== undefined && typeof config.reservationUuid !== "string") throw new CalendarError("invalid-config", "Invalid reservation UUID");
  if (config.locale?.startDayOfWeek !== undefined && !["sun", "mon", "tue", "wed", "thu", "fri", "sat"].includes(config.locale.startDayOfWeek)) throw new CalendarError("invalid-config", "Invalid start day of week");
}
const endpoint = (value?: string) => new URL(value ?? "https://api.zaptime.app/").href.replace(/\/+$/, "") + "/";
const identity = (config: ZaptimeConfig) => JSON.stringify([endpoint(config.apiBaseUrl), config.token, config.reservationUuid ?? ""]);
export function createInitialization(context: CalendarContext) {
  const { store, runtime } = context;
  let local: ZaptimeConfig = merge(store.getSnapshot().config);
  const defaults = { ...defaultConfig, token: undefined };
  const preferences = createPreferences(context);
  const availability = createAvailability(context);
  const client = createZaptimeClient({ fetch: runtime.fetch });
  let generation = 0;
  let promise: Promise<void> | undefined;
  let controller: AbortController | undefined;
  let captured = false;
  const invalidate = () => {
    generation++;
    controller?.abort();
    availability.invalidate();
    preferences.invalidate();
    promise = undefined;
  };
  context.onDispose(invalidate);
  function init(): Promise<void> {
    if (context.isDisposed()) return Promise.reject(new CalendarError("disposed", "Calendar has been disposed"));
    validate(local);
    if (promise) return promise;
    const current = ++generation;
    controller = new AbortController();
    if (!captured) {
      const timezone = runtime.getTimezone();
      const hourCycle = runtime.getHourCycle();
      validateTimezone(timezone);
      validateHourCycle(hourCycle);
      store.commit({ timezone, hourCycle, clientOriginalTimezone: timezone, clientOriginalHourCycle: hourCycle });
      captured = true;
    }
    store.commit({ phase: "initializing", error: undefined });
    promise = (async () => {
      try {
        const data = await client.fetchRemoteConfig(local.token, endpoint(local.apiBaseUrl), local.reservationUuid, controller!.signal);
        if (context.isDisposed() || current !== generation) return;
        const config: ZaptimeConfig = merge(defaults, data.configuration, local);
        validate(config);
        config.apiBaseUrl = endpoint(config.apiBaseUrl);
        const s = store.getSnapshot();
        store.commit({
          config,
          locations: data.locations ?? [],
          stripeConfig: data.stripeConfig,
          bookingForm: data.customFields ?? [],
          maxGuests: data.maxGuests ?? null,
          reservation: data.reservation,
          reservationUuid: data.reservation?.uuid ?? config.reservationUuid,
          isSubscribed: data.isSubscribed,
          analytics: data.analytics,
          eventTypeName: data.eventTypeName,
          calendar: { ...s.calendar, date: startOfMonth(data.reservation ? new Date(data.reservation.start) : runtime.now(), { in: tz(s.timezone) }) } as unknown as CalendarState,
        });
        await preferences.formatters.loadDateFnsConfig(config.locale?.preset ?? "en");
        if (context.isDisposed() || current !== generation) return;
        if (data.disabled) {
          store.commit({ phase: "disabled", calendar: { ...store.getSnapshot().calendar, loading: false, initLoaded: true } as CalendarState });
          return;
        }
        await availability.getDays();
        if (context.isDisposed() || current !== generation) return;
        // Preserve legacy initial search: this month and at most the following month.
        if (!store.getSnapshot().calendar.timeSlots.length && !availability.selectors.nextDisabled() && !data.reservation) await availability.actions.next();
        if (context.isDisposed() || current !== generation) return;
        store.commit({ phase: "ready", calendar: { ...store.getSnapshot().calendar, initLoaded: true } as CalendarState });
        context.emit({ type: "calendar-loaded" });
        context.emit({ type: "analytics", payload: { name: "zaptime:calendar_opened", properties: { eventTypeName: data.eventTypeName } } });
      } catch (cause) {
        if (context.isDisposed() || current !== generation) return;
        const error = cause instanceof CalendarError ? cause : new CalendarError("api", "Calendar initialization failed", { cause });
        const alreadyReported = store.getSnapshot().error === error;
        store.commit({ phase: "error", error, calendar: { ...store.getSnapshot().calendar, loading: false } as CalendarState });
        if (!alreadyReported) context.emit({ type: "error", payload: error });
        promise = undefined;
        throw error;
      }
    })();
    return promise;
  }
  function setConfig(patch: Partial<ZaptimeConfig>): Promise<void> {
    context.assertActive();
    const next: ZaptimeConfig = merge(local, patch);
    // Identity fields support explicit clearing, unlike nested presentation defaults.
    for (const key of ["token", "apiBaseUrl", "reservationUuid", "rescheduleOverrideToken"] as const) if (Object.prototype.hasOwnProperty.call(patch, key)) (next as unknown as Record<string, unknown>)[key] = patch[key];
    validate(next);
    const s = store.getSnapshot();
    const changed = identity(next) !== identity(local);
    if ((changed && (s.phase === "submitting" || s.phase === "recovery-required")) || (Object.prototype.hasOwnProperty.call(patch, "rescheduleOverrideToken") && s.phase === "submitting"))
      throw new CalendarError("busy", "Cannot change booking identity during submission or recovery");
    local = next;
    if (changed) {
      invalidate();
      const baseline = initialSnapshot({ config: next });
      store.commit({
        ...baseline,
        timezone: s.timezone,
        hourCycle: s.hourCycle,
        clientOriginalTimezone: s.clientOriginalTimezone,
        clientOriginalHourCycle: s.clientOriginalHourCycle,
        selectedTimeSlot: undefined,
        reservation: undefined,
        reservationUuid: undefined,
        stripeConfig: undefined,
        analytics: undefined,
        eventTypeName: undefined,
        recovery: undefined,
        error: undefined,
      });
      if (s.selectedTimeSlot) context.emit({ type: "time-slot-changed", payload: undefined });
      return init();
    }
    const effective: ZaptimeConfig = { ...merge(s.config, patch), apiBaseUrl: endpoint(next.apiBaseUrl) };
    if (Object.prototype.hasOwnProperty.call(patch, "rescheduleOverrideToken")) effective.rescheduleOverrideToken = patch.rescheduleOverrideToken;
    store.commit({ config: effective });
    if (s.phase === "idle") return Promise.resolve();
    const current = generation;
    const update = async () => {
      if (patch.locale) await preferences.formatters.loadDateFnsConfig(effective.locale?.preset ?? "en");
      if (context.isDisposed() || generation !== current) return;
      if (patch.closestBookableDay !== undefined || patch.locale?.startDayOfWeek !== undefined) await availability.getDays();
    };
    return update();
  }
  function setTimezone(timezone: string): Promise<void> {
    context.assertActive();
    validateTimezone(timezone);
    const s = store.getSnapshot();
    if (s.timezone === timezone) return Promise.resolve();
    if (s.phase === "submitting" || s.phase === "recovery-required") throw new CalendarError("busy", "Calendar is busy");
    const previousMonth = startOfMonth(new Date(s.calendar.date.getTime()), { in: tz(s.timezone) });
    store.commit({ timezone, calendar: { ...s.calendar, date: new TZDate(previousMonth.getFullYear(), previousMonth.getMonth(), 1, timezone) } as unknown as CalendarState });
    if (s.phase === "idle") return Promise.resolve();
    return availability.getDays();
  }
  return { init, actions: { ...availability.actions, setConfig, setTimezone, setHourCycle: preferences.setHourCycle }, selectors: availability.selectors, formatters: preferences.formatters };
}
