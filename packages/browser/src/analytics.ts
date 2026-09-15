import type { Analytics, CalendarInstance, DeepReadonly, Unsubscribe } from "@zaptime/core";
import type { AnalyticsInstance, AnalyticsPlugin } from "analytics";
import { navigateBrowser } from "./navigation";

export interface BrowserEffectsOptions {
  analytics?: DeepReadonly<Analytics[]>;
  navigate?: (url: string) => void;
}
function waitUntilReady(analytics: AnalyticsInstance, signal: AbortSignal): Promise<AnalyticsInstance | undefined> {
  return new Promise((resolve) => {
    let settled = false;
    let detach = () => {};
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      detach();
      resolve(ready ? analytics : undefined);
    };
    const abort = () => finish(false);
    const timer = setTimeout(abort, 30000);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) return abort();
    try {
      detach = analytics.ready(() => finish(true));
      // Some SDK implementations call ready synchronously.
      if (settled) detach();
    } catch {
      finish(false);
    }
  });
}
async function configure(config: DeepReadonly<Analytics[]>, signal: AbortSignal, isCurrent: () => boolean): Promise<AnalyticsInstance | undefined> {
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
  if (signal.aborted) return undefined;
  // Also guard the provider boundary: a provider can queue after global readiness.
  for (const plugin of plugins) {
    const track = plugin.track;
    if (track)
      plugin.track = function (...args) {
        if (!signal.aborted && isCurrent()) return track.apply(this, args);
      };
  }
  return waitUntilReady(Analytics({ app: "Zaptime", debug: false, plugins }), signal);
}
/** Attaches a single event consumer; callers release it when their browser owner unmounts. */
export function attachBrowserEffects(calendar: CalendarInstance, options: BrowserEffectsOptions = {}): Unsubscribe {
  let active = true;
  let generation = 0;
  const cancellation = new AbortController();
  let key: string | undefined;
  let delivery: Promise<AnalyticsInstance | undefined> = Promise.resolve(undefined);
  const configurations = new Map<string, Promise<AnalyticsInstance | undefined>>();
  function update() {
    const config = options.analytics ?? calendar.getSnapshot().analytics ?? [];
    const nextKey = JSON.stringify(config);
    if (nextKey === key) return;
    key = nextKey;
    generation++;
    if (!config.length || typeof window === "undefined") {
      delivery = Promise.resolve(undefined);
      return;
    }
    if (!configurations.has(nextKey))
      configurations.set(
        nextKey,
        configure(config, cancellation.signal, () => active && key === nextKey).catch(() => undefined),
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
      const eventGeneration = generation;
      void delivery
        .then((analytics) => {
          if (active && generation === eventGeneration) return analytics?.track(event.payload.name, properties);
        })
        .catch(() => {});
    }
  });
  return () => {
    if (!active) return;
    active = false;
    cancellation.abort();
    offEvent();
    offState();
    configurations.clear();
  };
}
