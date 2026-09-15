import type { ZaptimeConfig, CalendarError, RecoveryContext, ReservationResponse, TimeSlot } from "@zaptime/core";
import type { DefineComponent, ComponentOptionsMixin } from "vue";
import Calendar from "./App.vue";
export { book, reserve, confirm, cancel } from "@zaptime/vue-headless";
export { default as useCalendarViewState } from "./composables/useCalendarViewState";
interface CalendarProps {
  config: ZaptimeConfig;
  calendarId?: string;
}
type CalendarEmits = {
  "booking-confirmed": (reservation: ReservationResponse) => void;
  "time-slot-changed": (timeSlot?: TimeSlot) => void;
  "calendar-loaded": () => void;
  error: (error: CalendarError) => void;
  "recovery-required": (context: RecoveryContext) => void;
};
/** Public component contract uses the generic parameters supported since Vue 3.4. */
export const ZaptimeCalendar: DefineComponent<CalendarProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, CalendarEmits> = Calendar;

/**
 * @deprecated Use ZaptimeCalendar. This spelling will be removed in the next major version.
 */
export const ZapTimeCalendar: typeof ZaptimeCalendar = ZaptimeCalendar;

export type { ZaptimeConfig };
