import { computed } from "vue";
import { useUiCalendar } from "./useUiCalendar";
export function useIsSubscribed() {
  const { snapshot } = useUiCalendar();
  return { isSubscribed: computed(() => snapshot.value.isSubscribed) };
}
