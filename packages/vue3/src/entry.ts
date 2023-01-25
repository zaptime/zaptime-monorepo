import "./assets/tailwind.css";

import type IZapTimeConfig from "./types/IZapTimeConfig";
export { book, reserve, confirm, cancel } from "@zaptime/core";
export { default as useCalendarViewState } from "./composables/useCalendarViewState";
export { default as ZapTimeCalendar } from "./App.vue";
export { IZapTimeConfig };
