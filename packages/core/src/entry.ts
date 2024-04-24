import type Day from './types/Day';
import type TimeSlot from './types/TimeSlot';
import type { CustomField } from './types/InitData';
import type ZaptimeConfig from './types/ZaptimeConfig';
export { book, reserve, confirm, cancel, fetchRemoteConfiguration } from './composables/useApi';
export { default as useCalendar } from './composables/useCalendar';
export { default as useConfig } from './composables/useConfig';
export { default as useSelectedTimeSlot } from './composables/useSelectedTimeSlot';
export { default as useCurrentTimezone } from './composables/useCurrentTimezone';
export { default as useHourCycle } from './composables/useHourCycle';
export { default as useLocations } from './composables/useLocations';
export { default as useStripeConfig } from './composables/useStripeConfig';
export { default as useBookingForm } from './composables/useBookingForm';
export { useDateFormatters } from './composables/useDateFormatters';

export { default as mergeObjects } from './utils/mergeObjects';

export type { Day, TimeSlot, ZaptimeConfig, CustomField };
