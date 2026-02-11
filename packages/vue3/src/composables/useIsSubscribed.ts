import { useVue3CalendarScope } from "./useVue3CalendarScope";

export function useIsSubscribed() {
  const scope = useVue3CalendarScope();

  function setIsSubscribed(value: boolean) {
    scope.isSubscribed.value = value;
  }

  return {
    setIsSubscribed,
    isSubscribed: scope.isSubscribed,
  };
}
