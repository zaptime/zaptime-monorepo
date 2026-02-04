import type TimeSlot from "../types/TimeSlot";
import type Status from "../types/Status";
import type {
  AvailableTimeSlotResponse,
  ReservationResponse,
} from "../types/ApiResponses";
import { Ok, Err, Result } from "ts-results-es";
import {
  InitData,
  Success,
  Errors,
  Location,
  CustomFieldCollected,
} from "../types/InitData";
const defaultBaseUrl = "https://api.zaptime.app/";

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
   * Guest emails to invite
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

export const book = async (options: IOptions): Promise<ReservationResponse> => {
  const {
    email,
    token,
    timeSlot,
    firstName,
    lastName,
    seats = 1,
    baseUrl = defaultBaseUrl,
    phone,
    location,
    timezone,
    guests,
  } = options;
  try {
    const data = await fetch(getBookUrl(baseUrl), {
      method: "POST",
      body: JSON.stringify({
        start: timeSlot.start,
        end: timeSlot.end,
        email: email,
        seats: seats,
        firstname: firstName,
        lastname: lastName,
        phone: phone,
        location: location,
        timezone: timezone,
        customFields: options.customFields,
        guests: guests,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error("Booking time slot failed!");
  }
};

export const reschedule = async ({
  start,
  end,
  uuid,
  timezone,
  token,
  baseUrl = defaultBaseUrl,
}: {
  start: string;
  end: string;
  uuid: string;
  token: string;
  timezone: string;
  baseUrl?: string;
}): Promise<ReservationResponse> => {
  try {
    const data = await fetch(getRescheduleUrl(baseUrl, uuid), {
      method: "PUT",
      body: JSON.stringify({
        start: start,
        end: end,
        timezone: timezone,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error("Booking time slot failed!");
  }
};

export const reserve = async (
  options: IOptions,
): Promise<ReservationResponse> => {
  const {
    email,
    token,
    timeSlot,
    firstName,
    lastName,
    seats = 1,
    baseUrl = defaultBaseUrl,
    phone,
    location,
    timezone,
    guests,
  } = options;

  try {
    const data = await fetch(getReserveUrl(baseUrl), {
      method: "POST",
      body: JSON.stringify({
        start: timeSlot.start,
        end: timeSlot.end,
        email: email,
        seats: seats,
        firstname: firstName,
        lastname: lastName,
        phone: phone,
        location: location,
        timezone: timezone,
        customFields: options.customFields,
        guests: guests,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error("Reserving time slot failed!");
  }
};

export const confirm = async (
  options: IConfirmationOptions,
): Promise<ReservationResponse> => {
  const {
    baseUrl = defaultBaseUrl,
    status,
    token,
    firstName,
    lastName,
    customFields,
    phone,
  } = options;
  try {
    const data = await fetch(getConfirmUrl(baseUrl, status.uuid), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        firstname: firstName,
        lastname: lastName,
        customFields: customFields,
        phone: phone,
      }),
    }).then((response) => response.json());

    return data;
  } catch (err) {
    throw new Error("Time slot confirmation failed!");
  }
};

export const cancel = async (
  token: string,
  status: Status,
  baseUrl = defaultBaseUrl,
): Promise<boolean> => {
  try {
    const data = await fetch(getCancelUrl(baseUrl, status.uuid), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }).then((resposne) => resposne.json());

    return data.success;
  } catch (err) {
    throw new Error("Reserving time slot failed!");
  }
};

export const refreshReserve = async (
  token: string,
  status: Status,
  baseUrl = defaultBaseUrl,
): Promise<void> => {
  try {
    const data = await fetch(getRefreshReserveUrl(baseUrl, status.uuid), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }).then((response) => response.json());

    if (data.status !== 200) {
      throw new Error("Refreshing reservation slot failed!");
    }

    return data.success;
  } catch (err) {
    throw new Error("Refreshing reservation slot failed!");
  }
};

//token=token&from=from&until=until&group_by_day=group_by_day
export const getAvailableTimeSlots = async (
  token: string,
  from: string,
  until: string,
  baseUrl = defaultBaseUrl,
): Promise<TimeSlot[]> => {
  try {
    const res = await fetch(
      getAvailableTimeSlotsUrl(baseUrl) +
        "?" +
        new URLSearchParams({
          from: from,
          until: until,
        }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      },
    );

    if (res.status === 403) {
      throw new Error("Disabled");
    }

    const data: AvailableTimeSlotResponse = await res.json();

    return data.data;
  } catch (err) {
    if ((err as Error).message === "Disabled") {
      throw new Error("Disabled");
    }
    throw new Error("Getting available time slots failed!");
  }
};

export async function fetchRemoteConfig(
  token: string,
  baseUrl = defaultBaseUrl,
  reservationUuid?: string,
): Promise<Result<Success, Errors>> {
  if (token) {
    type Response = {
      success: boolean;
      data: InitData;
    };

    try {
      const res = await fetch(baseUrl + "event-types/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          reservationUuid: reservationUuid,
        }),
      });

      const data: Response = await res.json();

      if (data.success) {
        return new Ok(data.data);
      }
    } catch (e) {
      return new Err("invalidToken");
    }
  }
  return new Err("invalidToken");
}

function getBookUrl(baseUrl: string) {
  return baseUrl + "reservations";
}

function getRescheduleUrl(baseUrl: string, uuid: string) {
  return baseUrl + "reservations/" + uuid;
}

function getReserveUrl(baseUrl: string) {
  return baseUrl + "reservations/prepare";
}

function getConfirmUrl(baseUrl: string, uuid: string) {
  return baseUrl + "reservations/" + uuid + "/confirm";
}

function getCancelUrl(baseUrl: string, uuid: string) {
  return baseUrl + "reservations/" + uuid;
}

function getAvailableTimeSlotsUrl(baseUrl: string) {
  return baseUrl + "time-slots";
}

function getRefreshReserveUrl(baseUrl: string, uuid: string) {
  return baseUrl + "reservations/" + uuid + "/refresh";
}
