import loadScript from "load-script";
import { AnalyticsPlugin } from "analytics";

type Config = {
  src: string;
  dataWebsiteId: string;
  enabled: boolean;
};

let umamiLoaded = false;

export default function umami(config: Config): AnalyticsPlugin {
  return {
    name: "umami",

    initialize: async () => {
      const { src, dataWebsiteId } = config;

      if (typeof window !== "undefined") {
        loadScript(
          src,
          {
            attrs: {
              "data-website-id": dataWebsiteId,
            },
          },
          (err) => {
            if (err) {
              console.log(err);
            } else {
              umamiLoaded = true;
            }
          },
        );
      }
    },

    page: (): void => {
      if ("umami" in window) {
        // @ts-expect-error umami in window is not defined
        window.umami.track();
      }
    },

    track: ({ payload }: any) => {
      if ("umami" in window) {
        // @ts-expect-error umami in window is not defined
        window.umami.track(payload.event, payload.properties);
      }
    },

    loaded: (): boolean => {
      return umamiLoaded;
    },
  };
}
