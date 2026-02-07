import useReservationStatus from "./useReservationStatus";
import useSelectedTimeSlot from "./useSelectedTimeSlot";
import useLocations from "./useLocations";
import useConfig from "./useConfig";
import { Success, Errors, Location } from "../types/InitData";
import {
  book as bookApi,
  reserve as reserveApi,
  confirm as confirmApi,
  cancel as cancelApi,
  fetchRemoteConfig,
  reschedule as rescheduleApi,
  refreshReserve as refreshReserveApi,
} from "../api/api";
import { ReservationResponse } from "../types/ApiResponses";
import { Result } from "ts-results-es";
import useCurrentTimezone from "./useCurrentTimezone";
import { CustomFieldCollected } from "../types/InitData";
import useReservationReschedule from "./useReservationReschedule";

let reservationIntervalId: NodeJS.Timeout | null = null;

export interface IBookingOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  seats?: number;
  phone?: string;
  location?: Location;
  customFields?: CustomFieldCollected[];
}

export type IConfirmationOptions = Omit<
  IBookingOptions,
  "email" | "location" | "seats"
>;

export const useBookingActions = () => {
  const { selectedTimeSlot } = useSelectedTimeSlot();
  const { config } = useConfig();
  const { timezone } = useCurrentTimezone();
  const { locations: internalLocations } = useLocations();
  const { reservationStatus, setReservationStatus } = useReservationStatus();
  const { reservation } = useReservationReschedule();

  const book = async (
    options: IBookingOptions,
  ): Promise<ReservationResponse> => {
    const {
      email,
      firstName,
      lastName,
      seats = 1,
      phone,
      location,
      customFields,
    } = options;

    if (selectedTimeSlot.value !== undefined && config.value !== undefined) {
      try {
        const res = await bookApi({
          email,
          token: config.value.token,
          timeSlot: selectedTimeSlot.value,
          firstName,
          lastName,
          seats,
          baseUrl: config.value.apiBaseUrl,
          phone,
          location: location ?? internalLocations.value[0],
          timezone: timezone.value,
          customFields,
        });

        if (config.value.redirectAfterBookingUrl !== undefined) {
          window.location.href = config.value.redirectAfterBookingUrl;
        }

        return res;
      } catch {
        throw new Error(
          "Booking a time slot failed because time slot was not selected!",
        );
      }
    }

    throw new Error(
      "Booking a time slot failed because time slot was not selected!",
    );
  };

  const confirm = async (
    options?: IConfirmationOptions,
  ): Promise<ReservationResponse> => {
    if (reservationStatus.value !== undefined) {
      const res = await confirmApi({
        token: config.value.token,
        status: reservationStatus.value,
        baseUrl: config.value.apiBaseUrl,
        firstName: options?.firstName,
        lastName: options?.lastName,
        phone: options?.phone,
        customFields: options?.customFields,
      });
      stopReservationRefresh();
      return res;
    }

    throw new Error(
      "Confirming a time slot failed because time slot was not reserved!",
    );
  };

  const cancel = async (): Promise<boolean> => {
    if (reservationStatus.value !== undefined) {
      const res = await cancelApi(
        config.value.token,
        reservationStatus.value,
        config.value.apiBaseUrl,
      );
      stopReservationRefresh();
      return res;
    }

    return false;
  };

  const reschedule = async (): Promise<ReservationResponse> => {
    if (
      reservation.value !== undefined &&
      selectedTimeSlot.value !== undefined
    ) {
      return await rescheduleApi({
        start: selectedTimeSlot.value.start,
        end: selectedTimeSlot.value.end,
        token: config.value.token,
        uuid: reservation.value?.uuid,
        baseUrl: config.value.apiBaseUrl,
        timezone: timezone.value,
      });
    }

    throw new Error(
      "Rescheduling a time slot failed because time slot was not selected!",
    );
  };

  async function initReservation(options: IBookingOptions) {
    const {
      email,
      firstName,
      lastName,
      seats = 1,
      location,
      phone,
      customFields,
    } = options;

    if (selectedTimeSlot.value !== undefined && config.value !== undefined) {
      const data = await reserveApi({
        email,
        token: config.value.token,
        timeSlot: selectedTimeSlot.value,
        firstName,
        lastName,
        seats,
        baseUrl: config.value.apiBaseUrl,
        phone,
        location: location ?? internalLocations.value[0],
        timezone: timezone.value,
        customFields,
      });

      setReservationStatus(data.data);

      return data;
    }

    throw new Error(
      "Booking a time slot failed because time slot was not selected!",
    );
  }

  async function refreshReservation() {
    if (reservationStatus.value === undefined) {
      throw new Error("Reservation refresh failed because status was missing.");
    }

    await refreshReserveApi(
      config.value.token,
      reservationStatus.value,
      config.value.apiBaseUrl,
    );
  }

  const reserve = async (
    options: IBookingOptions,
  ): Promise<ReservationResponse> => {
    return await startReservationInterval(
      options,
      initReservation,
      refreshReservation,
    );
  };

  return {
    book,
    reserve,
    confirm,
    cancel,
    reschedule,
  };
};

export const book = async (
  options: IBookingOptions,
): Promise<ReservationResponse> => {
  return await useBookingActions().book(options);
};

export const reserve = async (
  options: IBookingOptions,
): Promise<ReservationResponse> => {
  return await useBookingActions().reserve(options);
};

export const confirm = async (
  options?: IConfirmationOptions,
): Promise<ReservationResponse> => {
  return await useBookingActions().confirm(options);
};

export const cancel = async (): Promise<boolean> => {
  return await useBookingActions().cancel();
};

export const reschedule = async (): Promise<ReservationResponse> => {
  return await useBookingActions().reschedule();
};

export const fetchRemoteConfiguration = async (
  token: string,
  apiBaseUrl?: string,
  reservationUuid?: string,
): Promise<Result<Success, Errors>> => {
  return await fetchRemoteConfig(token, apiBaseUrl, reservationUuid);
};

const startReservationInterval = async (
  options: IBookingOptions,
  initReservation: (options: IBookingOptions) => Promise<ReservationResponse>,
  refreshReservation: () => Promise<void>,
) => {
  if (reservationIntervalId) {
    clearInterval(reservationIntervalId);
  }

  const res = await initReservation(options);

  reservationIntervalId = setInterval(() => {
    refreshReservation().catch(() => {
      stopReservationRefresh();
    });
  }, 15 * 60 * 1000);

  return res;
};

export const stopReservationRefresh = () => {
  if (reservationIntervalId) {
    clearInterval(reservationIntervalId);
    reservationIntervalId = null;
  }
};
