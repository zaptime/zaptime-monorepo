import Analytics, { AnalyticsInstance } from 'analytics';
// @ts-expect-error module is
import googleAnalyticsPlugin from '@analytics/google-analytics';
import facebokPixelAnalyticsPlugin from './plugins/facebookPixelPlugin';
import umamiAnalyticsPlugin from './plugins/umamiPlugin';

let analytics: AnalyticsInstance;

export function getAnalytics(init?: any) {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (init === undefined && analytics === undefined) {
    return undefined;
  }

  if (analytics === undefined) {
    analytics = Analytics(init);
  }

  return analytics;
}

type InitAnalyticsData = {
  name: string;
  data: any;
};

export function buildConfig(initData: InitAnalyticsData[]) {
  const plugins = [];

  for (const data of initData) {
    switch (data.name) {
      case 'google-analytics':
        plugins.push(
          googleAnalyticsPlugin({
            measurementIds: [data.data.measurementId],
            enabled: true,
          }),
        );
        break;

      case 'facebook-pixel':
        plugins.push(
          facebokPixelAnalyticsPlugin({
            pixelId: data.data.pixelId,
            enabled: true,
          }),
        );
        break;
      case 'umami':
        plugins.push(
          umamiAnalyticsPlugin({
            dataWebsiteId: data.data.dataWebsiteId,
            src: data.data.src,
            enabled: true,
          }),
        );
        break;
      default:
        throw new Error(`Unknown Analytics Plugin Option: ${name}`);
    }
  }

  const config = {
    app: 'Zaptime',
    debug: true,
    plugins: plugins,
  };

  return config;
}
