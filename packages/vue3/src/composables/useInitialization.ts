import type { ZaptimeConfig } from "@zaptime/core";
import {
  useConfig,
  useCalendar,
  fetchRemoteConfiguration,
  useLocations,
  useStripeConfig,
  useBookingForm,
  useReservationReschedule,
  useDateFormatters,
} from "@zaptime/core";
import { ref, nextTick } from "vue";
import { getAnalytics, buildConfig } from "../analytics";
import { mergeConfigs } from "../utils/mergeConfigs";
import { isSameDay } from "date-fns";
import { useIsSubscribed } from "./useIsSubscribed";

export function useInitialization(config: ZaptimeConfig, calendarId?: string) {
  const isEnabled = ref(false);
  const initLoaded = ref(false);

  const { setConfig } = useConfig(calendarId);
  const { setLocations } = useLocations(calendarId);
  const { loadDateFnsConfig } = useDateFormatters();
  const { setStripeConfig } = useStripeConfig(calendarId);
  const { setBookingForm } = useBookingForm(calendarId);
  const { setSelectedReservation } = useReservationReschedule(calendarId);
  const { init: initCalendar, dayClicked, state } = useCalendar(calendarId);
  const { setIsSubscribed } = useIsSubscribed();
  /**
   * Setups the calendar and configuration based on the provided token and configuration.
   * If the token is not provided, an error will be logged.
   * If the token is provided, the configuration will be fetched from the backend and merged with the provided configuration.
   *
   * @returns {Promise<void>}
   */
  async function init() {
    if (config === undefined || config.token === undefined) {
      console.error(
        "Zaptime error: Token is required, please enter your acquired token into the configuration. See more in the documentation: https://docs.zaptime.app/guide/vue-installation.html. If you don't have a token, you can acquire one at https://zaptime.app.",
      );
    } else {
      const initData = await fetchRemoteConfiguration(
        config.token,
        config.apiBaseUrl,
        config.reservationUuid,
      );

      if (initData.isOk()) {
        if (initData.value.disabled) {
          isEnabled.value = false;
          initLoaded.value = true;
          return;
        }

        await loadDateFnsConfig(
          initData.value.configuration.locale?.preset || "en",
        );

        if (initData.value.reservation !== undefined) {
          setSelectedReservation(initData.value.reservation);
        }

        if (initData.value.locations) {
          setLocations(initData.value.locations);
        }

        if (initData.value.stripeConfig) {
          setStripeConfig(initData.value.stripeConfig);
        }

        if (initData.value.customFields) {
          setBookingForm(initData.value.customFields);
        }

        if (initData.value.isSubscribed === false) {
          setIsSubscribed(false);
        }

        isEnabled.value = true;

        const mergedConfig = mergeConfigs(initData.value.configuration, config);

        // perepared entry for backend

        let analyticsConfig = undefined;

        if (initData.value.analytics) {
          analyticsConfig = buildConfig(initData.value.analytics);
        }

        const analytics = getAnalytics(analyticsConfig);

        analytics?.track("zaptime:calendar_opened");
        setConfig(mergedConfig);

        await initCalendar();

        // Select day if rescheduling
        if (initData.value.reservation !== undefined) {
          const selectedDay = state.days.find((day) => {
            if (day.date !== undefined && initData.value.reservation) {
              return isSameDay(
                day.date,
                new Date(initData.value.reservation.start),
              );
            }
          });

          if (selectedDay !== undefined) {
            nextTick(() => {
              setTimeout(() => {
                dayClicked(selectedDay);
              }, 20);
            });
          }
        }
      } else {
        console.error(initData.error);
        console.error(initData.stack);
      }
    }
  }

  return {
    isEnabled,
    initLoaded,
    init,
  };
}
