import type { AnalyticsPlugin } from 'analytics';

export default function providerPluginExample(userConfig: any): AnalyticsPlugin {
  // return object for analytics to use
  return {
    /* All plugins require a name */
    name: 'custom',

    /* Everything else below this is optional depending on your plugin requirements */
    // config: {
    //   whatEver: userConfig.whatEver,
    //   elseYouNeed: userConfig.elseYouNeed,
    // },
    initialize: ({ config }) => {
      // load provider script to page

      console.log('initialize from Custom');
    },
    page: ({ payload }) => {
      console.log(payload);

      // call provider specific page tracking
    },
    track: ({ payload }) => {
      console.log('super test', JSON.stringify(payload));

      // call provider specific event tracking
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return true;
    },
  };
}
