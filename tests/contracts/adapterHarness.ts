import type { CalendarInstance, CalendarSnapshot, CreateCalendarOptions, DeepReadonly } from "../../packages/core/src/calendar/types";
/** A fresh mounted adapter consumer; read() must return its most recently rendered snapshot. */
export interface AdapterHarness {
  calendar: CalendarInstance;
  read(): DeepReadonly<CalendarSnapshot>;
  flush(): Promise<void>;
  unmount(): Promise<void>;
}
export type CreateAdapterHarness = (options: CreateCalendarOptions) => Promise<AdapterHarness>;
export type RegisterContractTest = (name: string, test: () => Promise<void>) => void;
