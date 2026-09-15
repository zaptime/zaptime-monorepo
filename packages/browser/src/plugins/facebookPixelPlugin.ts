import type { AnalyticsPlugin } from "analytics";
export default function facebookPixel(config: { pixelId: string; enabled: boolean }): AnalyticsPlugin {
  let fb: typeof import("react-facebook-pixel") | undefined;
  let loaded = false;
  return {
    name: "facebook-pixel",
    initialize: async () => {
      if (typeof window === "undefined") return;
      fb = (await import("react-facebook-pixel")).default;
      fb.init(config.pixelId, undefined, { autoConfig: true, debug: false });
      loaded = true;
    },
    page: () => {
      fb?.pageView();
    },
    track: ({ payload }: any) => {
      fb?.trackSingle(config.pixelId, payload.event, payload.properties);
    },
    loaded: () => loaded,
  };
}
