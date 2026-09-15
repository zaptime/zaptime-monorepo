import type { AnalyticsPlugin } from "analytics";
type UmamiWindow = Window & { umami?: { track(name?: string, properties?: Record<string, unknown>): void } };
export default function umami(config: { src: string; dataWebsiteId: string; enabled: boolean }): AnalyticsPlugin {
  let loaded = false;
  return {
    name: "umami",
    initialize: async () => {
      if (typeof window === "undefined") return;
      const { default: loadScript } = await import("load-script");
      loadScript(config.src, { attrs: { "data-website-id": config.dataWebsiteId } }, (error) => {
        loaded = !error;
      });
    },
    page: () => {
      (window as UmamiWindow).umami?.track();
    },
    track: ({ payload }: any) => {
      (window as UmamiWindow).umami?.track(payload.event, payload.properties);
    },
    loaded: () => loaded,
  };
}
