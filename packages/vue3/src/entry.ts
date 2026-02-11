import "./assets/tailwind.css";
import type { ZaptimeConfig } from "@zaptime/core";
export {
  useBookingActions,
  book,
  reserve,
  confirm,
  cancel,
} from "@zaptime/core";
export { default as useCalendarViewState } from "./composables/useCalendarViewState";
export { default as ZaptimeCalendar } from "./App.vue";

/**
 * @deprecated will be removed in the next major version
 * @internal
 */
export { default as ZapTimeCalendar } from "./App.vue";

export type { ZaptimeConfig };
