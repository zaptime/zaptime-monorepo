import { ref } from "vue";

const clientOriginalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timezone = ref<string>(clientOriginalTimezone);

export default function useCurrentTimezone() {
  const setTimezone = (tz: string) => {
    timezone.value = tz;
  };

  return {
    clientOriginalTimezone,
    timezone,
    setTimezone,
  };
}
