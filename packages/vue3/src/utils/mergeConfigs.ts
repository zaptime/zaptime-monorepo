import { mergeObjects } from "@zaptime/core";
import type { ZaptimeConfig } from "@zaptime/core";
import { useBreakpoints } from "@vueuse/core";

/**
 *
 * Merges two configs together. The baseConfig is the default configuration, and the config is the user provided configuration.
 *
 * Takes care of mobile breakpoints and sets the compact mode if the screen is smaller than the large breakpoint.
 *
 * @param baseConfig
 * @param config
 *
 * @returns {ZaptimeConfig}
 */
export function mergeConfigs(baseConfig: Partial<ZaptimeConfig>, config: Partial<ZaptimeConfig>) {
  const breakpoints = useBreakpoints({
    large: 860,
  });

  const isSmaller = breakpoints.smaller("large");

  const merged = mergeObjects({ ...baseConfig }, { ...config }) as ZaptimeConfig;

  if (isSmaller.value) {
    merged.compact = true;
  }

  return merged;
}
