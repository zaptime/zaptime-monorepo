import { computed } from "vue";
import { useConfig } from "@zaptime/core";

export function useLocalisedPriceCurrency({
  currency: currency,
  price: price,
  calendarId: calendarId,
}: {
  currency: string;
  price: number;
  calendarId?: string;
}) {
  const { config } = useConfig(calendarId);

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
