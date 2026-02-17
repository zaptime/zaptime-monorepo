import { computed } from "vue";
import { useConfig } from "@zaptime/core";

export function useLocalisedPriceCurrency({
  currency: currency,
  price: price,
}: {
  currency: string;
  price: number;
}) {
  const { config } = useConfig();

  const priceCurrency = computed(() => {
    return new Intl.NumberFormat(config.value.locale?.preset, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price / 100);
  });

  return {
    priceCurrency,
  };
}
