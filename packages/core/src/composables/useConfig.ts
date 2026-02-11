import ZaptimeConfig from "../types/ZaptimeConfig";
import defaultConfig from "../defaultConfig";
import { computed } from "vue";
import mergeObjects from "../utils/mergeObjects";
import { reactifyObject } from "@vueuse/core";
import { useCalendarScope } from "../scope/calendarScope";

export default function useConfig() {
  const scope = useCalendarScope();

  const setConfig = (cfg: ZaptimeConfig) => {
    scope.config.value = reactifyObject(mergeObjects(defaultConfig, cfg));
  };

  const config = computed(() => {
    return scope.config.value;
  });

  return {
    config,
    setConfig,
  };
}
