/**
 * Bootstraps a headless Zaptime calendar. Mirrors the init sequence of
 * @zaptime/vue3 (packages/vue3/src/composables/useInitialization.ts)
 * without any UI dependency.
 *
 * Usage (client-side only):
 *   const { status, init, eventTypeName } = useZaptimeInit({ token }, calendarId);
 *   onMounted(init);
 */
import { ref, shallowRef } from "vue";
import {
  fetchRemoteConfiguration,
  mergeObjects,
  useBookingForm,
  useCalendar,
  useConfig,
  useDateFormatters,
  useGuests,
  useLocations,
  useReservationReschedule,
  useStripeConfig,
  type ZaptimeConfig,
} from "@zaptime/core";
import { isSameDay } from "date-fns";

export type ZaptimeInitStatus = "idle" | "loading" | "ready" | "disabled" | "error";

export function useZaptimeInit(localConfig: ZaptimeConfig, calendarId?: string) {
  const status = ref<ZaptimeInitStatus>("idle");
  const error = shallowRef<unknown>(null);
  const eventTypeName = ref<string>("");

  const { setConfig } = useConfig(calendarId);
  const { setLocations } = useLocations(calendarId);
  const { setStripeConfig } = useStripeConfig(calendarId);
  const { setBookingForm } = useBookingForm(calendarId);
  const { setMaxGuests } = useGuests(calendarId);
  const { setSelectedReservation } = useReservationReschedule(calendarId);
  const { loadDateFnsConfig } = useDateFormatters();
  const { init: initCalendar, dayClicked, state } = useCalendar(calendarId);

  async function init() {
    if (!localConfig?.token) {
      status.value = "error";
      error.value = new Error("Zaptime: config.token is required");
      return;
    }

    status.value = "loading";

    const result = await fetchRemoteConfiguration(
      localConfig.token,
      localConfig.apiBaseUrl,
      localConfig.reservationUuid,
    );

    if (result.isErr()) {
      status.value = "error";
      error.value = result.error;
      return;
    }

    const remote = result.value;
    eventTypeName.value = remote.eventTypeName;

    if (remote.disabled) {
      status.value = "disabled";
      return;
    }

    if (remote.reservation) setSelectedReservation(remote.reservation);
    if (remote.locations) setLocations(remote.locations);
    if (remote.stripeConfig) setStripeConfig(remote.stripeConfig);
    if (remote.customFields) setBookingForm(remote.customFields);
    setMaxGuests(remote.maxGuests ?? null);

    // Remote configuration is the base; local keys override it.
    const merged = mergeObjects(
      { ...remote.configuration },
      { ...localConfig },
    ) as ZaptimeConfig;

    await loadDateFnsConfig(merged.locale?.preset || "en");
    setConfig(merged);
    await initCalendar();

    // Rescheduling: preselect the day of the existing reservation.
    if (remote.reservation) {
      const current = new Date(remote.reservation.start);
      const day = state.days.find((d) => d.date && isSameDay(d.date, current));
      if (day) dayClicked(day);
    }

    status.value = "ready";
  }

  return { status, error, eventTypeName, init };
}
