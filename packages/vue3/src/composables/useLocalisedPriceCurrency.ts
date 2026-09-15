import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useConfig } from "@zaptime/vue-headless";

export function useLocalisedPriceCurrency({ currency: currency, price: price, calendarId: calendarId }: { currency: MaybeRefOrGetter<string>; price: MaybeRefOrGetter<number>; calendarId?: string }) {
  const { config } = useConfig(calendarId);

  const priceCurrency = computed(() => {
    if (!toValue(currency)) return "";
    return new Intl.NumberFormat(config.value.locale?.preset, {
      style: "currency",
      currency: toValue(currency),
      minimumFractionDigits: 0,
    }).format(toValue(price) / 100);
  });

  return {
    priceCurrency,
  };
}
