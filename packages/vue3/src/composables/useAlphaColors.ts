import { useConfig } from "@zaptime/core";
import { computed } from "vue";
import mix from "../utils/mixColors";

export default function useAlphaColors() {
  const { config } = useConfig();

  const color = computed(() => {
    return getColorForAlpha(0.34);
  });

  const color2 = computed(() => {
    return getColorForAlpha(0.24);
  });

  const getColorForAlpha = (alpha: number) => {
    if (
      config.value &&
      config.value.theme &&
      config.value.theme.mode === "dark" &&
      config.value.theme.colors &&
      config.value.theme.colors[900]
    ) {
      return mix(
        config.value.theme.colors[900].replace("#", ""),
        "000000",
        alpha * 100,
      );
    }

    return "";
  };

  return {
    color,
    color2,
  };
}
