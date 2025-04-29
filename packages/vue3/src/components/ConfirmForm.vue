<template>
  <div
    class="cal-flex cal-h-full cal-min-h-[524px] cal-justify-center cal-rounded-xl cal-bg-white cal-px-[20px] cal-pb-10 dark:cal-bg-theme-900 sm:cal-px-6"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[840px]']"
    :style="{ backgroundColor: color2 }"
  >
    <form v-if="!reservation && selectedTimeSlot !== undefined" class="cal-mt-12 cal-flex-col sm:cal-w-[370px]" :class="[selectedTimeSlot.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']" @submit.prevent="onSubmit">
      <h1 class="cal-text-2xl cal-font-medium cal-text-theme-500 dark:cal-text-theme-500">
        {{ locale?.confirmationForm?.confirmBooking }}
      </h1>
      <h2 class="cal-mt-[24px] cal-text-2xl cal-font-semibold cal-text-theme-700 dark:cal-text-theme-100">
        {{ getFormattedDayInMonth(selectedTimeSlot.start) }}
      </h2>
      <h3 class="cal-text-[24px] cal-font-semibold cal-leading-[36px] cal-text-theme-500 dark:cal-text-theme-300">
        {{ getFormattedTime(selectedTimeSlot.start) }} -
        {{ getFormattedTime(selectedTimeSlot.end) }}
      </h3>

      <FormBuilder class="" />

      <div v-if="stripeConfig">
        <Payment></Payment>
      </div>

      <div v-if="paymentError" class="cal-my-5 cal-text-lg cal-text-red-500">Payment has failed</div>

      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton type="button" :disabled="disabled" @click="emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton :loading="disabled" type="submit">
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>

    <form v-if="reservation && selectedTimeSlot !== undefined" class="cal-mt-20 sm:cal-w-[280px]" @submit.prevent="submitReschedule">
      <h1 class="cal-text-2xl cal-font-medium cal-text-theme-500 dark:cal-text-theme-500">{{ locale?.confirmationForm?.reschedulingEvent }}</h1>
      <p class="cal-mt-5 cal-text-2xl cal-font-medium cal-text-theme-700 dark:cal-text-theme-100">
        {{ getFormattedDayInMonth(reservation.start) }}
      </p>
      <p class="cal-text-[24px] cal-font-medium cal-leading-[36px] cal-text-theme-500 dark:cal-text-theme-300">
        {{ getFormattedTime(reservation.start) }} -
        {{ getFormattedTime(reservation.end) }}
      </p>

      <div class="cal-my-2 cal-flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-arrow-up cal-rotate-180 cal-text-theme-500 dark:cal-text-theme-100"
        >
          <path d="m5 12 7-7 7 7" />
          <path d="M12 19V5" />
        </svg>
      </div>

      <h2 class="cal-text-2xl cal-font-medium cal-text-theme-700 dark:cal-text-theme-100">
        {{ getFormattedDayInMonth(selectedTimeSlot.start) }}
      </h2>
      <h3 class="cal-text-[24px] cal-font-medium cal-leading-[36px] cal-text-theme-500 dark:cal-text-theme-300">
        {{ getFormattedTime(selectedTimeSlot.start) }} -
        {{ getFormattedTime(selectedTimeSlot.end) }}
      </h3>

      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton :disabled="disabled" type="button" @click="emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton :loading="disabled" type="submit">
          {{ locale?.confirmationForm?.buttons?.reschedule }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from "vue";
import { useSelectedTimeSlot, book, reserve, confirm, useConfig, reschedule, useDateFormatters, useLocations, useStripeConfig, useBookingForm, useBillingAddress, useReservationReschedule, cancel } from "@zaptime/core";
import PrimaryButton from "./atomic/PrimaryButton.vue";
import SecondaryButton from "./atomic/SecondaryButton.vue";
import { getAnalytics } from "../analytics";
import Payment from "./Payment.vue";
import FormBuilder from "./BookingForm/FormBuilder.vue";
import { useStripe, PaymentError } from "../composables/useStripe";
import type { ReservationResponse } from "@zaptime/core";

const emit = defineEmits<{
  (e: "booking-confirmed", reservation: ReservationResponse): void;
  (e: "go-back"): void;
}>();

const { selectedTimeSlot } = useSelectedTimeSlot(inject("calendarId"));
const { getFormattedTime, getFormattedDayInMonth } = useDateFormatters();
const { config } = useConfig(inject("calendarId"));
const { locations } = useLocations(inject("calendarId"));
const { stripeConfig } = useStripeConfig(inject("calendarId"));
const { collectFormValues } = useBookingForm(inject("calendarId"));
const { billingAddress } = useBillingAddress(inject("calendarId"));
const { reservation } = useReservationReschedule(inject("calendarId"));

const { initGateway, handleSubmit: handleStripePayment } = useStripe();

const color2 = inject<string>("color2");
const calendarId = inject<string>("calendarId");
const seats = ref(1);
const disabled = ref(false);
const analytics = getAnalytics();

const paymentError = ref(false);

class ValidationError extends Error {
  constructor() {
    super();
    this.name = "ValidationError";
  }
}

const locale = computed(() => {
  if (config === undefined) {
    return;
  }
  return config.value.locale;
});

async function handleSubmittionWithPayment() {
  try {
    const collectedValues = collectFormValues();

    const res = await reserve({
      ...collectedValues,
      seats: seats.value,
      calendarId,
      location: locations.value[0],
    });

    if (billingAddress.value.email === "") {
      billingAddress.value.email = collectedValues.email;
    }

    if (billingAddress.value.name === "") {
      billingAddress.value.name = collectedValues.firstName + " " + collectedValues.lastName;
    }

    if (billingAddress.value.country === "") {
      billingAddress.value.country = "CZ";
    }

    if (!res.success) {
      throw new ValidationError();
    }

    await handleStripePayment({ billingAddress: billingAddress.value, reservationUuid: res.data.uuid });

    const confirmRes = await confirm({ calendarId: calendarId });

    if (!confirmRes.success) {
      throw new Error("Failed to confirm");
    }

    return confirmRes;
  } catch (err) {
    if (err instanceof PaymentError) {
      console.error(err.message);
      await cancel(calendarId);
    }
    throw new Error("Failed to reserve");
  }
}

async function onSubmit() {
  disabled.value = true;

  try {
    let res;

    if (stripeConfig.value) {
      res = await handleSubmittionWithPayment();
    } else {
      res = await book({
        seats: seats.value,
        calendarId,
        location: locations.value[0],
        ...collectFormValues(),
      });

      if (!res.success) {
        throw new ValidationError();
      }
    }

    analytics?.track("booking_confirmed", {
      timeSlot: selectedTimeSlot.value ? selectedTimeSlot.value.start : undefined,
    });

    emit("booking-confirmed", res);

    disabled.value = false;
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error("Booking failed! Please try again or contact support.");
      return;
    }
    paymentError.value = true;
    console.error(err);
  } finally {
    disabled.value = false;
  }
}

async function submitReschedule() {
  disabled.value = true;

  const res = await reschedule(calendarId);
  emit("booking-confirmed", res);

  disabled.value = false;
}

onMounted(async () => {
  if (stripeConfig.value) {
    setTimeout(async () => {
      //@ts-expect-error TS is not aware of chec?
      initGateway(stripeConfig.value.stripeAccountId);
    }, 500);
  }
});
</script>
