import type TimeSlot from "../types/TimeSlot";
import type Status from "../types/Status";
import type { Success, Errors, Location, CustomFieldCollected } from "../types/InitData";
import { Ok, Err, type Result } from "ts-results-es";
import { createZaptimeClient } from "./client";
export { SlotNoLongerAvailableError, RescheduleNotAllowedError } from "./errors";

export interface IOptions {
  /**
   * Email of the attendee
   */
  email: string;

  /**
   * Token of the calendar
   */
  token: string;

  /**
   * Time slot
   */
  timeSlot: TimeSlot;

  /**
   * Timezone of the user
   */
  timezone: string;

  /**
   * First name of the attendee
   */
  firstName?: string;

  /**
   * Last name of the attendee
   */
  lastName?: string;

  /**
   * Number of seats to book
   *
   * @default 1
   */
  seats?: number;

  /**
   * Base URL override
   */
  baseUrl?: string;

  /**
   * Phone number of the attendee
   */
  phone?: string;

  /**
   * Location of the Event Type
   */

  location?: Location;

  /**
   * Custom fields
   */
  customFields?: CustomFieldCollected[];

  /**
   * Guest email addresses
   */
  guests?: string[];
}

export interface IConfirmationOptions
  extends Omit<
    IOptions,
    "email" | "location" | "seats" | "timezone" | "timeSlot"
  > {
  status: Status;
}

// Resolve global fetch at call time for the legacy singleton API.
const client = () => createZaptimeClient({ fetch: (...args) => globalThis.fetch(...args) });
export const book: ReturnType<typeof createZaptimeClient>["book"] = (options) => client().book(options);
export const reserve: ReturnType<typeof createZaptimeClient>["reserve"] = (options) => client().reserve(options);
export const confirm: ReturnType<typeof createZaptimeClient>["confirm"] = (options) => client().confirm(options);
export const reschedule: ReturnType<typeof createZaptimeClient>["reschedule"] = (options) => client().reschedule(options);
export const cancel: ReturnType<typeof createZaptimeClient>["cancel"] = (...args) => client().cancel(...args);
export const refreshReserve: ReturnType<typeof createZaptimeClient>["refreshReserve"] = (...args) => client().refreshReserve(...args);
export const getAvailableTimeSlots: ReturnType<typeof createZaptimeClient>["getAvailableTimeSlots"] = (...args) => client().getAvailableTimeSlots(...args);
export async function fetchRemoteConfig(token: string, baseUrl?: string, reservationUuid?: string): Promise<Result<Success, Errors>> {
  try { return new Ok(await client().fetchRemoteConfig(token, baseUrl, reservationUuid)); }
  catch { return new Err("invalidToken"); }
}
