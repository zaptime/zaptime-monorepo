import type { ZaptimeConfig } from '@zaptime/core';
import { useConfig, useCalendar, fetchRemoteConfiguration, useLocations, useStripeConfig, useBookingForm } from '@zaptime/core';
import { ref } from 'vue';
import { getAnalytics, buildConfig } from '../analytics';
import { mergeConfigs } from '../utils/mergeConfigs';

export function useInitialization(config: ZaptimeConfig, calendarId?: string) {
  const isEnabled = ref(false);
  const initLoaded = ref(false);

  const { init: initCalendar } = useCalendar(calendarId);
  const { setConfig } = useConfig(calendarId);
  const { setLocations } = useLocations(calendarId);
  const { setStripeConfig } = useStripeConfig(calendarId);
  const { setBookingForm } = useBookingForm(calendarId);

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
      const initData = await fetchRemoteConfiguration(config.token, config.apiBaseUrl);

      if (initData.ok) {
        if (initData.val.disabled) {
          isEnabled.value = false;
          initLoaded.value = true;
          return;
        }

        if (initData.val.locations) {
          setLocations(initData.val.locations);
        }

        if (initData.val.stripeConfig) {
          setStripeConfig(initData.val.stripeConfig);
        }

        // set testing booking form data
        setBookingForm([
          {
            label: 'Name',
            name: 'Name of Attenddee',
            uuid: '13r5j6346asd',
            type: 'text',
            required: true,
            placeholder: 'Enter your name',
          },
          {
            label: 'Email',
            name: 'Email Address',
            uuid: '00hf31fas',
            type: 'email',
            required: true,
            placeholder: 'Enter your email',
          },
          {
            label: 'Phone',
            name: 'Phone Number',
            uuid: '35f9as1fq',
            type: 'phone',
            required: true,
            placeholder: 'Enter your phone',
          },

          {
            label: 'Additional Questions',
            name: 'Additional Questions',
            uuid: '35f9as1fqhh',
            type: 'textarea',
            required: true,
            placeholder: 'Enter additional questions',
          },

          {
            label: 'I agree to the <a target="_blank" href="https://zaptime.cz/">terms and conditions</a>.',
            name: 'GDPR',
            uuid: '35f9as1fh',
            type: 'checkbox',
            required: true,
          },
        ]);
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
