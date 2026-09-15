declare module "@analytics/google-analytics" {
  import type { AnalyticsPlugin } from "analytics";
  export default function plugin(config: { measurementIds: string[]; enabled: boolean }): AnalyticsPlugin;
}
declare module "@analytics/google-tag-manager" {
  import type { AnalyticsPlugin } from "analytics";
  export default function plugin(config: { containerId: string; enabled: boolean }): AnalyticsPlugin;
}
declare module "load-script" {
  export default function loadScript(src: string, options: { attrs: Record<string, string> }, callback: (error?: Error) => void): void;
}
