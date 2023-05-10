import type IDay from './types/IDay';
import type IEvent from './types/IEvent';
import type IZapTimeConfig from './types/IZapTimeConfig';
import type IZapTimeTheme from './types/IZapTimeTheme';
import type IZapTimeLocale from './types/IZapTimeLocale';
import type { IZapTimeCustomField, IZapTimeCustomFieldSelect } from './types/IZaptimeCustomField';

export { book, reserve, confirm, cancel } from './composables/useApi';
export { default as useCalendar } from './composables/useCalendar';
export { default as useConfig } from './composables/useConfig';
export { default as useSelectedEvent } from './composables/useSelectedEvent';
export { default as useCurrentTimezone } from './composables/useCurrentTimezone';
export { default as useHourCycle } from './composables/useHourCycle';

export { IDay, IEvent };

export type { IZapTimeConfig, IZapTimeCustomField, IZapTimeCustomFieldSelect, IZapTimeLocale, IZapTimeTheme };
