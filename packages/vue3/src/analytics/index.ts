import Analytics, { AnalyticsInstance } from 'analytics';
// @ts-expect-error module is
import googleAnalyticsPlugin from '@analytics/google-analytics';
import facebokPixelAnalyticsPlugin from './plugins/facebookPixelPlugin';
import umamiAnalyticsPlugin from './plugins/umamiPlugin';

let analytics: AnalyticsInstance;

export function getAnalytics(init?: any) {
  if (analytics === undefined) {
    analytics = Analytics(init);
  }

  return analytics;
}

export function buildConfig({ name, token }: { name: string; token: string }) {
  const plugins = [];

  switch (name) {
    case 'google-analytics':
      plugins.push(
        googleAnalyticsPlugin({
          measurementIds: [token],
          enabled: true,
        }),
      );
      break;

    case 'facebook-pixel':
      plugins.push(
        facebokPixelAnalyticsPlugin({
          pixelId: token,
          enabled: true,
        }),
      );
      break;
    case 'umami':
      plugins.push(
        umamiAnalyticsPlugin({
          dataWebsiteId: '68081e5a-e0e3-45d3-b472-f0162a022d75',
          src: 'https://umami-zaptime.vercel.app/script.js',
          enabled: true,
        }),
      );
      break;
    default:
      throw new Error(`Unknown Analytics Plugin Option: ${name}`);
  }

  const config = {
    app: 'Zaptime',
    debug: true,
    plugins: plugins,
  };

  return config;
}
