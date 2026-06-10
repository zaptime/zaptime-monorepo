import { useEffect, useRef, useState } from "react";
import {
  fetchRemoteConfiguration,
  mergeObjects,
  useConfig,
  useLocations,
  useStripeConfig,
  useBookingForm,
  useGuests,
  useReservationReschedule,
  useDateFormatters,
  useCalendar,
  type ZaptimeConfig,
} from "@zaptime/react-core";

/**
 * React mirror of `@zaptime/vue3`'s `useInitialization`: fetch the remote
 * Event Type configuration, seed the headless stores, merge config and run the
 * calendar's `init()`. Lives in the example (the UI layer), not in the headless
 * package — exactly like the Vue side.
 */
export function useInitialization(
  config: ZaptimeConfig,
  calendarId?: string,
): { isEnabled: boolean; initLoaded: boolean } {
  const [isEnabled, setIsEnabled] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);

  const { setConfig } = useConfig(calendarId);
  const { setLocations } = useLocations(calendarId);
  const { setStripeConfig } = useStripeConfig(calendarId);
  const { setBookingForm } = useBookingForm(calendarId);
  const { setMaxGuests } = useGuests(calendarId);
  const { setSelectedReservation } = useReservationReschedule(calendarId);
  const { loadDateFnsConfig } = useDateFormatters();
  const { init } = useCalendar(calendarId);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      if (!config || !config.token) {
        // eslint-disable-next-line no-console
        console.error("Zaptime error: Token is required to initialize.");
        setInitLoaded(true);
        return;
      }

      const initData = await fetchRemoteConfiguration(
        config.token,
        config.apiBaseUrl,
        config.reservationUuid,
      );

      if (initData.isErr()) {
        setInitLoaded(true);
        return;
      }

      const data = initData.value;

      if (data.disabled) {
        setIsEnabled(false);
        setInitLoaded(true);
        return;
      }

      if (data.reservation) setSelectedReservation(data.reservation);
      if (data.locations) setLocations(data.locations);
      if (data.stripeConfig) setStripeConfig(data.stripeConfig);
      if (data.customFields) setBookingForm(data.customFields);
      setMaxGuests(data.maxGuests ?? null);

      setIsEnabled(true);

      // Local config overrides the remote configuration (local wins).
      const merged = mergeObjects(
        structuredClone(data.configuration),
        config,
      ) as ZaptimeConfig;

      await loadDateFnsConfig(merged.locale?.preset || "en");
      setConfig(merged);
      await init();

      setInitLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isEnabled, initLoaded };
}
