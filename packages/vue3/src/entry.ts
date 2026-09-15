import type { ZaptimeConfig } from "@zaptime/core";
export { book, reserve, confirm, cancel } from "@zaptime/vue-headless";
export { default as useCalendarViewState } from "./composables/useCalendarViewState";
export { default as ZaptimeCalendar } from "./App.vue";

/**
 * @deprecated will be removed in the next major version
 */
export { default as ZapTimeCalendar } from "./App.vue";

export type { ZaptimeConfig };
