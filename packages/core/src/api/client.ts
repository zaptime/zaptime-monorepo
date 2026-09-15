import type { IOptions, IConfirmationOptions } from "./api";
import type Status from "../types/Status";
import type TimeSlot from "../types/TimeSlot";
import type { InitData } from "../types/InitData";
import type { BillingAddress } from "../types/BillingAddress";
import type { ReservationResponse } from "../types/ApiResponses";
import { CalendarError, MutationOutcomeUnknownError, RescheduleNotAllowedError, SlotNoLongerAvailableError } from "./errors";

const defaultBaseUrl = "https://api.zaptime.app/";
type RescheduleOptions = { start: string; end: string; uuid: string; token: string; timezone: string; baseUrl?: string; overrideToken?: string };
export interface PaymentResponse {
  clientSecret: string;
  paymentIntentId?: string;
  stripeAccountId?: string;
  amount?: number;
}
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const reservation = (body: Record<string, unknown>) => record(body.data) && typeof body.data.uuid === "string" && body.data.uuid.length > 0;

/** Private Zaptime wire client. Construction has no effects. */
export function createZaptimeClient({ fetch: transport }: { fetch: typeof globalThis.fetch }) {
  async function request<T>(
    path: string,
    token: string,
    method: string | undefined,
    body: unknown,
    message: string,
    mutation: boolean,
    validate: (body: Record<string, unknown>) => boolean,
    baseUrl = defaultBaseUrl,
    signal?: AbortSignal,
    kind?: "slot" | "reschedule" | "availability",
  ): Promise<T> {
    const controller = mutation ? undefined : new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let rejectAbort: ((cause: unknown) => void) | undefined;
    const abort = () => {
      controller?.abort(signal?.reason);
      rejectAbort?.(signal?.reason ?? new Error("Read aborted"));
    };
    const failed = (cause: unknown, code: "api" | "network") => (mutation ? new MutationOutcomeUnknownError(message, { cause }) : new CalendarError(code, message, { cause }));
    try {
      const interrupted = controller
        ? new Promise<never>((_, reject) => {
            rejectAbort = reject;
            timeout = setTimeout(() => {
              controller.abort();
              reject(new Error("Read timed out"));
            }, 30_000);
            signal?.addEventListener("abort", abort, { once: true });
          })
        : undefined;
      // Do not create an unhandled rejected interruption promise for pre-aborted reads.
      if (signal?.aborted) throw new CalendarError("network", message, { cause: signal.reason });
      const perform = async () => {
        let response: Response;
        try {
          response = await transport(baseUrl + path, {
            ...(method ? { method } : {}),
            headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Bearer " + token },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            ...(controller ? { signal: controller.signal } : {}),
          });
        } catch (cause) {
          throw failed(cause, "network");
        }
        if (response.status === 409 && kind === "slot") throw new SlotNoLongerAvailableError({ cause: response });
        if (response.status === 403 && kind === "reschedule") throw new RescheduleNotAllowedError({ cause: response });
        if (response.status === 403 && kind === "availability") throw new CalendarError("disabled", "Disabled", { cause: response });
        if (!response.ok) throw new CalendarError("api", message, { cause: response });
        let data: unknown;
        try {
          data = await response.json();
        } catch (cause) {
          throw failed(cause, "api");
        }
        if (record(data) && data.success === false) throw new CalendarError("api", message, { cause: data });
        if (!record(data) || data.success !== true || !validate(data)) throw failed(new Error("Invalid API response"), "api");
        return data as T;
      };
      return await (interrupted ? Promise.race([perform(), interrupted]) : perform());
    } catch (cause) {
      if (cause instanceof CalendarError) throw cause;
      throw failed(cause, "network");
    } finally {
      if (timeout !== undefined) clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }
  const booking = (options: IOptions, prepare: boolean) =>
    request<ReservationResponse>(
      prepare ? "reservations/prepare" : "reservations",
      options.token,
      "POST",
      {
        start: options.timeSlot.start,
        end: options.timeSlot.end,
        email: options.email,
        seats: options.seats ?? 1,
        firstname: options.firstName,
        lastname: options.lastName,
        phone: options.phone,
        location: options.location,
        timezone: options.timezone,
        customFields: options.customFields,
        guests: options.guests,
      },
      prepare ? "Reserving time slot failed!" : "Booking time slot failed!",
      true,
      reservation,
      options.baseUrl,
      undefined,
      "slot",
    );
  return {
    book: (options: IOptions) => booking(options, false),
    reserve: (options: IOptions) => booking(options, true),
    confirm: (options: IConfirmationOptions) =>
      request<ReservationResponse>(
        `reservations/${options.status.uuid}/confirm`,
        options.token,
        "POST",
        {
          firstname: options.firstName,
          lastname: options.lastName,
          customFields: options.customFields,
          phone: options.phone,
          guests: options.guests,
        },
        "Time slot confirmation failed!",
        true,
        reservation,
        options.baseUrl,
      ),
    reschedule: (options: RescheduleOptions) =>
      request<ReservationResponse>(
        `reservations/${options.uuid}`,
        options.token,
        "PUT",
        {
          start: options.start,
          end: options.end,
          timezone: options.timezone,
          overrideToken: options.overrideToken,
        },
        "Rescheduling time slot failed!",
        true,
        reservation,
        options.baseUrl,
        undefined,
        "reschedule",
      ),
    async cancel(token: string, status: Status, baseUrl = defaultBaseUrl): Promise<boolean> {
      await request(`reservations/${status.uuid}`, token, "DELETE", undefined, "Reserving time slot failed!", true, () => true, baseUrl);
      return true;
    },
    async refreshReserve(token: string, status: Status, baseUrl = defaultBaseUrl): Promise<void> {
      await request(`reservations/${status.uuid}/refresh`, token, "POST", undefined, "Refreshing reservation slot failed!", true, () => true, baseUrl);
    },
    async getAvailableTimeSlots(token: string, from: string, until: string, baseUrl = defaultBaseUrl, signal?: AbortSignal): Promise<TimeSlot[]> {
      const result = await request<{ data: TimeSlot[] }>(
        "time-slots?" + new URLSearchParams({ from, until }),
        token,
        undefined,
        undefined,
        "Getting available time slots failed!",
        false,
        (body) => Array.isArray(body.data),
        baseUrl,
        signal,
        "availability",
      );
      return result.data;
    },
    async fetchRemoteConfig(token: string, baseUrl = defaultBaseUrl, reservationUuid?: string, signal?: AbortSignal): Promise<InitData> {
      if (!token) throw new CalendarError("invalid-config", "Calendar token is required.");
      const result = await request<{ data: InitData }>("event-types/init", token, "POST", { reservationUuid }, "Getting calendar configuration failed!", false, (body) => record(body.data), baseUrl, signal);
      return result.data;
    },
    async createPayment({
      token,
      baseUrl = defaultBaseUrl,
      reservationUuid,
      billingAddress: billing,
    }: {
      token: string;
      baseUrl?: string;
      reservationUuid: string;
      billingAddress: BillingAddress;
    }): Promise<PaymentResponse> {
      const result = await request<{ data: PaymentResponse }>(
        `api/reservations/${reservationUuid}/payments`,
        token,
        "POST",
        {
          email: billing.email,
          name: billing.name,
          company: billing.company || undefined,
          street: billing.address || undefined,
          city: billing.city || undefined,
          postalCode: billing.postalCode || undefined,
          country: billing.country,
          taxId: billing.vatId || undefined,
          crn: billing.crn || undefined,
        },
        "Zaptime Payment Confirmation API Failed.",
        true,
        (body) => record(body.data) && typeof body.data.clientSecret === "string" && body.data.clientSecret.length > 0,
        baseUrl,
      );
      return result.data;
    },
  };
}
