import Analytics from 'analytics';

// import googleAnalyticsPlugin from '@analytics/google-analytics';
// import customerIOPlugin from '@analytics/customerio';
import providerPluginExample from './providerExample';
/* Initialize analytics */

const analytics = Analytics({
  app: 'zaptime',
  debug: true,

  plugins: [
    // googleAnalyticsPlugin({
    //   trackingId: 'UA-121991291',
    // }),

    providerPluginExample({ test: '123' }),
  ],
});

/* Track a page view */
// analytics.plugins.enable('custom');

export default analytics;

// /* Track a custom event */
// analytics.track('userPurchase', {
//   price: 20
//   item: 'pink socks'
// })

// /* Identify a visitor */
// analytics.identify('user-id-xyz', {
//   firstName: 'bill',
//   lastName: 'murray',
//   email: 'da-coolest@aol.com'
// })
