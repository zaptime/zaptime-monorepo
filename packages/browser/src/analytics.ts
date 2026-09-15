import type { Analytics, CalendarInstance, DeepReadonly, Unsubscribe } from "@zaptime/core";
import type { AnalyticsInstance, AnalyticsPlugin } from "analytics";
import { navigateBrowser } from "./navigation";

export interface BrowserEffectsOptions {
  analytics?: DeepReadonly<Analytics[]>;
  navigate?: (url: string) => void;
}
async function configure(config: DeepReadonly<Analytics[]>): Promise<AnalyticsInstance> {
  const plugins: AnalyticsPlugin[] = [];
  for (const { name, data } of config) {
    switch (name) {
      case "google-analytics": {
        const { default: plugin } = await import("@analytics/google-analytics");
        plugins.push(plugin({ measurementIds: [data.measurementId], enabled: true }));
        break;
      }
      case "google-tag-manager": {
        const { default: plugin } = await import("@analytics/google-tag-manager");
        plugins.push(plugin({ containerId: data.containerId, enabled: true }));
        break;
      }
      case "facebook-pixel": {
        const { default: plugin } = await import("./plugins/facebookPixelPlugin");
        plugins.push(plugin({ pixelId: data.pixelId, enabled: true }));
        break;
      }
      case "umami": {
        const { default: plugin } = await import("./plugins/umamiPlugin");
        plugins.push(plugin({ src: data.src, dataWebsiteId: data.dataWebsiteId, enabled: true }));
        break;
      }
    }
  }
  const { default: Analytics } = await import("analytics");
  return Analytics({ app: "Zaptime", debug: false, plugins });
}
/** Attaches a single event consumer; callers release it when their browser owner unmounts. */
export function attachBrowserEffects(calendar: CalendarInstance, options: BrowserEffectsOptions = {}): Unsubscribe {
  let active = true;
  let key: string | undefined;
  let delivery: Promise<AnalyticsInstance | undefined> = Promise.resolve(undefined);
  const configurations = new Map<string, Promise<AnalyticsInstance | undefined>>();
  function update() {
    const config = options.analytics ?? calendar.getSnapshot().analytics ?? [];
    const nextKey = JSON.stringify(config);
    if (nextKey === key) return;
    key = nextKey;
    if (!config.length || typeof window === "undefined") {
      delivery = Promise.resolve(undefined);
      return;
    }
    if (!configurations.has(nextKey))
      configurations.set(
        nextKey,
        configure(config).catch(() => undefined),
      );
    delivery = configurations.get(nextKey)!;
  }
  update();
  const offState = calendar.subscribe(update);
  const offEvent = calendar.onEvent((event) => {
    if (!active) return;
    if (event.type === "redirect-requested") (options.navigate ?? navigateBrowser)(event.payload.url);
    if (event.type === "analytics") {
      update();
      // Only established public event metadata may enter third-party integrations.
      const properties: Record<string, string> = {};
      for (const name of ["eventTypeName", "timeSlot"]) if (typeof event.payload.properties[name] === "string") properties[name] = event.payload.properties[name] as string;
      void delivery
        .then((analytics) => {
          if (active) return analytics?.track(event.payload.name, properties);
        })
        .catch(() => {});
    }
  });
  return () => {
    if (!active) return;
    active = false;
    offEvent();
    offState();
    configurations.clear();
  };
}
