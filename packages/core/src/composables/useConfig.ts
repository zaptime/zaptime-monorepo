import IZapTimeConfig from "../types/IZapTimeConfig";
import DefaultConfig from "../defaultConfig";
import { ref, computed } from 'vue';

interface IConfigState {
  config: IZapTimeConfig
}

let _config = ref<Record<string, IConfigState>>({
  "__DEFAULT__": {
    config: DefaultConfig
  }
});

export default function useConfig(calendarId?: string) {

  if (calendarId !== undefined && _config.value[calendarId] === undefined) {
    _config.value[calendarId] = {
      config: DefaultConfig
    }
  }

  const setConfig = (cfg: IZapTimeConfig) => {
    if(calendarId === undefined) {
      _config.value.__DEFAULT__.config = cfg;
    } else {
      _config.value[calendarId].config = cfg;
    }
  };

  const config = computed(() => {    
    if(calendarId === undefined) {
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
