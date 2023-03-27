import { useBreakpoints } from '@vueuse/core';
import { watch } from 'vue';
import { useConfig } from '@zaptime/core';
import IZapTimeConfig from '../types/IZapTimeConfig';

export default function useCompactSwitcher(calendarId?: string) {
  const { config, setConfig } = useConfig(calendarId);

  const originalCompactPreference = config.value.compact === true ? true : false;

  const breakpoints = useBreakpoints({
    large: 860,
  });

  const isSmaller = breakpoints.smaller('large');

  watch(isSmaller, (value) => {
    const cfg: IZapTimeConfig = { ...config.value };
    if (value === true) {
      cfg.compact = true;
      setConfig(cfg);
    } else {
      cfg.compact = originalCompactPreference;
      setConfig(cfg);
    }
  });
}
