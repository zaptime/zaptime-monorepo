
import type IDay from "./types/IDay";
import type IEvent from "./types/IEvent";

export { book, reserve, confirm, cancel } from "./composables/useApi";
export { default as useCalendar } from "./composables/useCalendar";
export { default as useConfig } from "./composables/useConfig";
export { default as useSelectedEvent } from "./composables/useSelectedEvent";

export { IDay, IEvent };

