import { useBreakpoints } from "@vueuse/core";
import { watch } from "vue";
import { useConfig } from "@zaptime/core";

export default function useCompactSwitcher() {
  const { config } = useConfig();

  const originalCompactPreference =
    config.value.compact === true ? true : false;

  const breakpoints = useBreakpoints({
    large: 860,
  });

  const isSmaller = breakpoints.smaller("large");

  if (isSmaller.value === true) {
    config.value.compact = true;
  }

  watch(isSmaller, (value) => {
    if (value === true) {
      config.value.compact = true;
    } else {
      config.value.compact = originalCompactPreference;
    }
  });
}
