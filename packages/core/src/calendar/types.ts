import type { CalendarError } from "../api/errors";
import type { BookingInput, ConfirmationInput, PaymentDriver, RecoveryContext, RecoveryResult } from "../booking/types";
import type Day from "../types/Day";
import type TimeSlot from "../types/TimeSlot";
import type CalendarState from "../types/CalendarState";
import type ZaptimeConfig from "../types/ZaptimeConfig";
import type { ReservationResponse } from "../types/ApiResponses";
import type { BillingAddress } from "../types/BillingAddress";
import type { Analytics, Location, StripeConfig, CustomField, CustomFieldValue, Reservation } from "../types/InitData";

export type { BookingInput, ConfirmationInput, Operation, PaymentDriver, PaymentOutcome, RecoveryContext, RecoveryResult } from "../booking/types";
export type ReadonlyDate = Omit<Date, Extract<keyof Date, `set${string}`>>;
export type DeepReadonly<T> = T extends Date ? ReadonlyDate : T extends (...args: any[]) => any ? T : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type Unsubscribe = () => void;
export type HourCycle = "h11" | "h12" | "h23" | "h24" | undefined;
export type View = "calendar" | "form" | "success";
export type CalendarView = "pickingDate" | "pickingTime";
export type Phase = "idle" | "initializing" | "ready" | "disabled" | "submitting" | "recovery-required" | "success" | "error" | "disposing" | "disposed";

export interface CalendarRuntime {
  fetch: typeof globalThis.fetch;
  now: () => Date;
  getTimezone: () => string;
  getHourCycle: () => HourCycle;
  createOperationId: () => string;
  schedule: (callback: () => void, delayMs: number) => unknown;
  unschedule: (handle: unknown) => void;
}
export interface CreateCalendarOptions {
  config: ZaptimeConfig;
  runtime?: Partial<CalendarRuntime>;
  payment?: PaymentDriver;
  reconcile?: (context: RecoveryContext) => Promise<RecoveryResult>;
}
export interface CalendarSnapshot {
  revision: number;
  phase: Phase;
  config: ZaptimeConfig;
  calendar: CalendarState;
  selectedTimeSlot?: TimeSlot;
  timezone: string;
  hourCycle: HourCycle;
  clientOriginalTimezone: string;
  clientOriginalHourCycle: HourCycle;
  locations: Location[];
  stripeConfig?: StripeConfig;
  bookingForm: CustomField[];
  guests: string[];
  maxGuests: number | null;
  billingAddress: BillingAddress;
  reservation?: Reservation;
  reservationUuid?: string;
  seats: number;
  view: View;
  calendarView: CalendarView;
  isSubscribed: boolean;
  analytics?: Analytics[];
  eventTypeName?: string;
  recovery?: RecoveryContext;
  error?: CalendarError;
}
export interface CalendarActions {
  getDays(): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  dayClicked(day: DeepReadonly<Day>): void;
  setSelectedTimeSlot(slot: TimeSlot | undefined): void;
  setConfig(patch: Partial<ZaptimeConfig>): Promise<void>;
  setTimezone(timezone: string): Promise<void>;
  setHourCycle(hourCycle: HourCycle): void;
  setLocations(locations: Location[]): void;
  setStripeConfig(config: StripeConfig | undefined): void;
  setBookingForm(fields: CustomField[]): void;
  setCustomFieldValue(uuid: string, value: CustomFieldValue): void;
  collectFormValues(): Omit<BookingInput, "seats" | "location">;
  setMaxGuests(maxGuests: number | null): void;
  addGuest(email?: string): void;
  removeGuest(index: number): void;
  updateGuest(index: number, email: string): void;
  setBillingAddress(address: BillingAddress): void;
  updateBillingAddressField(field: keyof BillingAddress, value: string): void;
  setSelectedReservation(reservation: Reservation | undefined): void;
  setSeats(seats: number): void;
  setView(view: View): void;
  setCalendarView(view: CalendarView): void;
  book(input: BookingInput): Promise<ReservationResponse>;
  reserve(input: BookingInput): Promise<ReservationResponse>;
  confirm(input?: ConfirmationInput): Promise<ReservationResponse>;
  cancel(): Promise<boolean>;
  reschedule(): Promise<ReservationResponse>;
  submit(overrides?: Partial<BookingInput>): Promise<ReservationResponse>;
  recover(): Promise<RecoveryResult>;
  stopReservationRefresh(): void;
}
export interface CalendarSelectors {
  nextDisabled(): boolean;
  prevDisabled(): boolean;
  monthName(): string;
  currentYear(): string;
  isSelected(slot: TimeSlot): boolean;
  isSelectedDay(day: DeepReadonly<Day>): boolean;
  dayHasTimeSlot(day: DeepReadonly<Day>): boolean;
  guestsEnabled(): boolean;
  canAddGuest(): boolean;
  isPhoneCall(): boolean;
}
export interface CalendarFormatters {
  loadDateFnsConfig(locale: string): Promise<void>;
  getFormattedTime(date: string): string;
  getFormattedDay(date: string): string;
  getFormattedDayInMonth(date: string): string;
}
export type CalendarEvent =
  | { type: "calendar-loaded" }
  | { type: "time-slot-changed"; payload: TimeSlot | undefined }
  | { type: "booking-confirmed"; payload: ReservationResponse }
  | { type: "view-changed"; payload: View }
  | { type: "error"; payload: CalendarError }
  | { type: "recovery-required"; payload: RecoveryContext }
  | { type: "analytics"; payload: { name: string; properties: Record<string, unknown> } }
  | { type: "redirect-requested"; payload: { url: string } };
export interface CalendarInstance {
  getSnapshot(): DeepReadonly<CalendarSnapshot>;
  subscribe(listener: () => void): Unsubscribe;
  onEvent(listener: (event: CalendarEvent) => void): Unsubscribe;
  init(): Promise<void>;
  actions: CalendarActions;
  selectors: CalendarSelectors;
  formatters: CalendarFormatters;
  dispose(): Promise<void>;
}
