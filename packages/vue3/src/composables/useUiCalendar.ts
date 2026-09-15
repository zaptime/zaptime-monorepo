import { inject, type InjectionKey, type ShallowRef } from "vue";
import type { CalendarInstance, CalendarSnapshot, DeepReadonly } from "@zaptime/core";
import type { StripePaymentDriver } from "@zaptime/browser";
export interface UiCalendar {
  calendar: CalendarInstance;
  snapshot: ShallowRef<DeepReadonly<CalendarSnapshot>>;
  setPayment(driver: StripePaymentDriver | undefined): void;
}
export const uiCalendarKey: InjectionKey<UiCalendar> = Symbol("zaptime.ui");
export function useUiCalendar() {
  const value = inject(uiCalendarKey);
  if (!value) throw new Error("Calendar UI owner required");
  return value;
}
