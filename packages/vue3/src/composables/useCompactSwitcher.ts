import { onMounted, onUnmounted, watch } from "vue";
import { useConfig, type CalendarTarget } from "@zaptime/vue-headless";
/** Media detection starts after mount, preserving deterministic SSR. */
export default function useCompactSwitcher(target?: CalendarTarget, preference?: () => boolean | undefined) {
  const { config } = useConfig(target);
  const initialPreference = config.value.compact;
  let media: MediaQueryList | undefined;
  const apply = () => {
    if (media) config.value.compact = media.matches || (preference ? preference() : initialPreference) === true;
  };
  onMounted(() => {
    media = window.matchMedia("(max-width: 859px)");
    media.addEventListener("change", apply);
    apply();
  });
  if (preference) watch(preference, apply);
  onUnmounted(() => {
    media?.removeEventListener("change", apply);
    media = undefined;
  });
}
