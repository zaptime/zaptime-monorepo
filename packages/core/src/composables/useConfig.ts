import IZapTimeConfig from '../types/IZapTimeConfig';
import defaultConfig from '../defaultConfig';
import { ref, computed } from 'vue';
import mergeObjects from '../utils/mergeObjects';
interface IConfigState {
  config: IZapTimeConfig;
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

  const setConfig = (cfg: IZapTimeConfig) => {
    if (calendarId === undefined) {
      _config.value.__DEFAULT__.config = mergeObjects(defaultConfig, cfg);
    } else {
      _config.value[calendarId].config = mergeObjects(defaultConfig, cfg);
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
