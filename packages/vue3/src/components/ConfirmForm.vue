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

      <fieldset :disabled="disabled">
        <label v-if="selectedTimeSlot.seats > 1" class="cal-mt-4 cal-block"
          >{{ messages.seats }}<input type="number" min="1" :max="selectedTimeSlot.seats" :value="snapshot.seats" @input="calendar.actions.setSeats(Number(($event.target as HTMLInputElement).value))"
        /></label>
        <label v-if="snapshot.locations.length > 1" class="cal-mt-4 cal-block"
          >{{ messages.location
          }}<select v-model="locationIndex">
            <option v-for="(location, index) in snapshot.locations" :key="index" :value="index">{{ location.value || location.type }}</option>
          </select></label
        >
        <FormBuilder />
      </fieldset>

      <fieldset v-if="stripeConfig" :disabled="disabled">
        <Payment></Payment>
      </fieldset>

      <div v-if="paymentError" class="cal-my-5 cal-text-lg cal-text-red-500">
        {{ messages.paymentFailed }}
      </div>

      <div v-if="slotTakenError" class="cal-my-5 cal-text-lg cal-text-red-500" role="alert">
        {{ slotNoLongerAvailableText(locale) }}
      </div>

      <div v-if="snapshot.recovery" role="alert" class="cal-my-5 cal-text-red-500">
        {{ recoveryMessage }}
        <p v-if="snapshot.recovery.reservationUuid">{{ messages.reference }}: {{ snapshot.recovery.reservationUuid }}</p>
      </div>
      <div v-else-if="snapshot.error && !paymentError && !slotTakenError && !rescheduleNotAllowedError && !rescheduleFailedError" role="alert" class="cal-my-5 cal-text-red-500">{{ snapshot.error.message }}</div>
      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton type="button" :disabled="disabled" @click="emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton :loading="submitting" :disabled="disabled" type="submit">
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>

    <form v-if="reservation && selectedTimeSlot !== undefined" class="cal-mt-20 sm:cal-w-[280px]" @submit.prevent="submitReschedule">
      <h1 class="cal-text-2xl cal-font-medium cal-text-theme-500 dark:cal-text-theme-500">
        {{ locale?.confirmationForm?.reschedulingEvent }}
      </h1>
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

      <div v-if="rescheduleNotAllowedError" class="cal-my-5 cal-text-lg cal-text-red-500" role="alert">
        {{ rescheduleNotAllowedText(locale) }}
      </div>

      <div v-if="rescheduleFailedError" class="cal-my-5 cal-text-lg cal-text-red-500" role="alert">
        {{ messages.bookingFailed }}
      </div>

      <div v-if="snapshot.recovery" role="alert" class="cal-my-5 cal-text-red-500">
        {{ recoveryMessage }}
        <p v-if="snapshot.recovery.reservationUuid">{{ messages.reference }}: {{ snapshot.recovery.reservationUuid }}</p>
      </div>
      <div v-else-if="snapshot.error && !paymentError && !slotTakenError && !rescheduleNotAllowedError && !rescheduleFailedError" role="alert" class="cal-my-5 cal-text-red-500">{{ snapshot.error.message }}</div>
      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton :disabled="disabled" type="button" @click="emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton :loading="submitting" :disabled="disabled" type="submit">
          {{ locale?.confirmationForm?.buttons?.reschedule }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { useSelectedTimeSlot, useConfig, useStripeConfig, useReservationReschedule, useDateFormatters, slotNoLongerAvailableText, rescheduleNotAllowedText } from "@zaptime/vue-headless";
import { calendarMessages } from "../generated/messages";
import { useUiCalendar } from "../composables/useUiCalendar";
import PrimaryButton from "./atomic/PrimaryButton.vue";
import SecondaryButton from "./atomic/SecondaryButton.vue";
import Payment from "./Payment.vue";
import FormBuilder from "./BookingForm/FormBuilder.vue";
const emit = defineEmits<{ (e: "go-back"): void }>();
const { calendar, snapshot } = useUiCalendar();
const { selectedTimeSlot } = useSelectedTimeSlot();
const { getFormattedTime, getFormattedDayInMonth } = useDateFormatters();
const { config } = useConfig();
const { stripeConfig } = useStripeConfig();
const { reservation } = useReservationReschedule();
const color2 = inject<string>("color2");
const locale = computed(() => config.value.locale);
const messages = computed(() => calendarMessages(locale.value?.preset));
const recoveryMessage = computed(() => {
  switch (snapshot.value.recovery?.paymentStatus) {
    case "succeeded":
      return messages.value.confirmationPending;
    case "unknown":
      return messages.value.paymentUnknown;
    case "failed":
      return messages.value.paymentFailed;
    default:
      return messages.value.bookingPending;
  }
});
const locationIndex = ref(0);
const submitting = computed(() => snapshot.value.phase === "submitting" || snapshot.value.phase === "disposing");
const disabled = computed(() => ["submitting", "recovery-required", "disposing"].includes(snapshot.value.phase));
const paymentError = computed(() => snapshot.value.error?.code === "payment-failed");
const slotTakenError = computed(() => snapshot.value.error?.code === "slot-unavailable");
const rescheduleNotAllowedError = computed(() => snapshot.value.error?.code === "reschedule-not-allowed");
const rescheduleFailedError = computed(() => !!reservation.value && !!snapshot.value.error && !rescheduleNotAllowedError.value);
async function onSubmit() {
  try {
    await calendar.actions.submit({ location: snapshot.value.locations[locationIndex.value] });
  } catch {
    /* Owner forwards the typed error and snapshot renders it. */
  }
}
const submitReschedule = onSubmit;
</script>
