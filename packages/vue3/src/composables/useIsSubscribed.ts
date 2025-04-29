import { ref } from "vue";

const isSubscribed = ref(true);

export function useIsSubscribed() {
  function setIsSubscribed(value: boolean) {
    isSubscribed.value = value;
  }

  return {
    setIsSubscribed,
    isSubscribed,
  };
}
