import { AnalyticsPlugin } from "analytics";

type Config = {
  pixelId: string;
  enabled: boolean;
};

let fb: any;
let fbLoaded = false;
export default function facebookPixel(config: Config): AnalyticsPlugin {
  return {
    name: "facebook-pixel",
    initialize: async () => {
      const { pixelId } = config;
      if (typeof window !== "undefined") {
        await import("react-facebook-pixel")
          .then((module) => (fb = module.default))
          .then(() => {
            if (!fbLoaded) {
              fb.init(pixelId, {
                autoConfig: true,
                debug: true,
              });
              fbLoaded = true;
            }
          });
      }
    },
    page: (): void => {
      fb.pageView();
    },

    track: ({ payload }: any) => {
      fb.track(payload.event, payload.properties);
    },

    loaded: (): boolean => {
      return fbLoaded;
    },
  };
}
