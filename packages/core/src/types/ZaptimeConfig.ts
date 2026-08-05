import ZaptimeTheme from "./ZaptimeTheme";
import ZaptimeLocale from "./ZaptimeLocale";

export default interface ZaptimeConfig {
  token: string;
  min?: number;
  max?: number;
  closestBookableDay?: number;
  locale?: ZaptimeLocale;
  theme?: ZaptimeTheme;
  profileImage?: string;
  externalBooking?: boolean;
  compact?: boolean;
  apiBaseUrl?: string;
  redirectAfterBookingUrl?: string;
  hideLocation?: boolean;
  reservationUuid?: string;

  /**
   * Server-issued proof that the current visitor is the reservation's host
   * or team owner. Sent along with a reschedule so the API applies host
   * rules instead of the attendee-facing reschedule policies.
   */
  rescheduleOverrideToken?: string;
}
