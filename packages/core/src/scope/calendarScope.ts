import {
  inject,
  provide,
  reactive,
  ref,
  type InjectionKey,
  type Ref,
} from "vue";

import type TimeSlot from "../types/TimeSlot";
import type CalendarState from "../types/CalendarState";
import type ZaptimeConfig from "../types/ZaptimeConfig";
import type Status from "../types/Status";
import type {
  CustomField,
  Location,
  Reservation,
  StripeConfig,
} from "../types/InitData";
import defaultConfig from "../defaultConfig";

export type BillingAddress = {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  crn: string;
  vatId: string;
};

export const createDefaultBillingAddress = (): BillingAddress => ({
  name: "",
  email: "",
  company: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  crn: "",
  vatId: "",
});

export const createInitialCalendarState = (): CalendarState => ({
  date: new Date(),
  days: [],
  timeSlots: [],
  monthHasTimeSlots: false,
  selectedDay: null,
  loading: true,
  headers: [],
  dfnsConfig: undefined,
  attendeeState: undefined,
  initLoaded: false,
});

export type CalendarScope = {
  calendarState: CalendarState;
  config: Ref<ZaptimeConfig>;
  selectedTimeSlot: Ref<TimeSlot | undefined>;
  timezone: Ref<string>;
  hourCycle: Ref<"h23" | "h11" | "h12" | "h24" | undefined>;
  dateFnsConfig: Ref<any>;
  locations: Ref<Location[]>;
  stripeConfig: Ref<StripeConfig | undefined>;
  bookingForm: Ref<CustomField[]>;
  billingAddress: Ref<BillingAddress>;
  reservation: Ref<Reservation | undefined>;
  reservationStatus: Ref<Status | undefined>;
};

const clientOriginalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

let clientOriginalHourCycle: "h23" | "h11" | "h12" | "h24" | undefined = "h23";

if (typeof window !== "undefined") {
  clientOriginalHourCycle = Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
  }).resolvedOptions().hourCycle;
}

export const createCalendarScope = (): CalendarScope => {
  return {
    calendarState: reactive(createInitialCalendarState()),
    config: ref(defaultConfig),
    selectedTimeSlot: ref(undefined),
    timezone: ref(clientOriginalTimezone),
    hourCycle: ref(clientOriginalHourCycle),
    dateFnsConfig: ref(undefined),
    locations: ref([]),
    stripeConfig: ref(undefined),
    bookingForm: ref([]),
    billingAddress: ref(createDefaultBillingAddress()),
    reservation: ref(undefined),
    reservationStatus: ref(undefined),
  };
};

export const calendarScopeKey: InjectionKey<CalendarScope> = Symbol(
  "zaptime-calendar-scope",
);

let fallbackScope: CalendarScope | null = null;

export const provideCalendarScope = (scope?: CalendarScope): CalendarScope => {
  const providedScope = scope ?? createCalendarScope();
  fallbackScope = providedScope;
  provide(calendarScopeKey, providedScope);
  return providedScope;
};

export const useCalendarScope = (): CalendarScope => {
  const scope = inject(calendarScopeKey, null);

  if (scope !== null) {
    return scope;
  }

  if (fallbackScope === null) {
    fallbackScope = createCalendarScope();
  }

  return fallbackScope;
};

export { clientOriginalTimezone, clientOriginalHourCycle };
