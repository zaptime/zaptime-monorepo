import ZaptimeConfig from "../types/ZaptimeConfig";
import defaultConfig from "../defaultConfig";
import { ref, computed } from "vue";
import mergeObjects from "../utils/mergeObjects";
import { reactifyObject } from "@vueuse/core";

interface IConfigState {
  config: ZaptimeConfig;
}

const _config = ref<Record<string, IConfigState>>({
  __DEFAULT__: {
    config: defaultConfig,
  },
});

export default function useConfig(calendarId?: string) {
  if (calendarId !== undefined && _config.value[calendarId] === undefined) {
    _config.value[calendarId] = {
      config: defaultConfig,
    };
  }

  const setConfig = (cfg: ZaptimeConfig) => {
    if (calendarId === undefined) {
      _config.value.__DEFAULT__.config = reactifyObject(
        mergeObjects(defaultConfig, cfg),
      );
    } else {
      _config.value[calendarId].config = reactifyObject(
        mergeObjects(defaultConfig, cfg),
      );
    }
  };

  const config = computed(() => {
    if (calendarId === undefined) {
      return _config.value.__DEFAULT__.config;
    } else {
      return _config.value[calendarId].config;
    }
  });

  return {
    config,
    setConfig,
  };
}
