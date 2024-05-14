import type { ZaptimeConfig } from '@zaptime/core';
import { useConfig, useCalendar, fetchRemoteConfiguration, useLocations, useStripeConfig, useBookingForm, useReservationReschedule } from '@zaptime/core';
import { ref, nextTick } from 'vue';
import { getAnalytics, buildConfig } from '../analytics';
import { mergeConfigs } from '../utils/mergeConfigs';
import { isSameDay } from 'date-fns';

export function useInitialization(config: ZaptimeConfig, calendarId?: string) {
  const isEnabled = ref(false);
  const initLoaded = ref(false);

  const { init: initCalendar, dayClicked, state } = useCalendar(calendarId);
  const { setConfig } = useConfig(calendarId);
  const { setLocations } = useLocations(calendarId);
  const { setStripeConfig } = useStripeConfig(calendarId);
  const { setBookingForm } = useBookingForm(calendarId);
  const { setSelectedReservation } = useReservationReschedule(calendarId);
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
      const initData = await fetchRemoteConfiguration(config.token, config.apiBaseUrl, config.reservationUuid);

      if (initData.ok) {
        if (initData.val.disabled) {
          isEnabled.value = false;
          initLoaded.value = true;
          return;
        }

        if (initData.val.reservation !== undefined) {
          setSelectedReservation(initData.val.reservation);
        }

        if (initData.val.locations) {
          setLocations(initData.val.locations);
        }

        if (initData.val.stripeConfig) {
          setStripeConfig(initData.val.stripeConfig);
        }

        if (initData.val.customFields) {
          setBookingForm(initData.val.customFields);
        }

        isEnabled.value = true;

        const mergedConfig = mergeConfigs(initData.val.configuration, config);

        // perepared entry for backend

        let analyticsConfig = undefined;

        if (initData.val.analytics) {
          analyticsConfig = buildConfig(initData.val.analytics);
        }

        const analytics = getAnalytics(analyticsConfig);

        analytics?.track('zaptime:calendar_opened');
        setConfig(mergedConfig);

        await initCalendar();

        // Select day if rescheduling
        if (initData.val.reservation !== undefined) {
          const selectedDay = state.days.find((day) => {
            if (day.date !== undefined) {
              //@ts-expect-error dunno wtf
              return isSameDay(day.date, new Date(initData.val.reservation.start));
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
        console.error(initData.err);
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
