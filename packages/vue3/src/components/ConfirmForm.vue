<template>
  <div
    class="cal-flex cal-h-full cal-min-h-[524px] cal-justify-center cal-rounded-xl cal-bg-white cal-px-[20px] cal-pb-10 dark:cal-bg-theme-900 sm:cal-px-6"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[840px]']"
    :style="{ backgroundColor: color2 }"
  >
    <form
      v-if="selectedTimeSlot !== undefined"
      class="cal-mt-12 cal-flex-col sm:cal-w-[370px]"
      :class="[selectedTimeSlot.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']"
      @submit.prevent="onSubmit"
    >
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

      <div v-if="paymentError">Payment has failed</div>

      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton @click="$emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton
          :loading="disabled"
          type="submit"
        >
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, reactive } from 'vue';
import { useSelectedTimeSlot, book, reserve, confirm, useConfig, useDateFormatters, useLocations, useStripeConfig, useBookingForm, useBillingAddress } from '@zaptime/core';
import PrimaryButton from './atomic/PrimaryButton.vue';
import SecondaryButton from './atomic/SecondaryButton.vue';
import { getAnalytics } from '../analytics';
import Payment from './Payment.vue';
import FormBuilder from './BookingForm/FormBuilder.vue';
import { useStripe } from '../composables/useStripe';

const emits = defineEmits(['booking-confirmed', 'go-back']);

const { selectedTimeSlot } = useSelectedTimeSlot(inject('calendarId'));
const { getFormattedTime, getFormattedDayInMonth } = useDateFormatters(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));
const { locations } = useLocations(inject('calendarId'));
const { stripeConfig } = useStripeConfig(inject('calendarId'));
const { collectFormValues } = useBookingForm(inject('calendarId'));
const { billingAddress } = useBillingAddress(inject('calendarId'));

const { initGateway, handleSubmit: handleStripePayment } = useStripe();

const color2 = inject<string>('color2');
const calendarId = inject<string>('calendarId');
const seats = ref(1);
const disabled = ref(false);
const analytics = getAnalytics();

const paymentError = ref(false);

const locale = computed(() => {
  if (config === undefined) {
    return;
  }
  return config.value.locale;
});

async function handleSubmittionWithPayment() {
  await reserve({
    ...collectFormValues(),
    seats: seats.value,
    calendarId,
    location: locations.value[0],
  });

  await handleStripePayment({ billingAddress: billingAddress.value });

  await confirm({ calendarId: calendarId });
}

async function onSubmit() {
  disabled.value = true;

  try {
    if (stripeConfig.value) {
      await handleSubmittionWithPayment();
    } else {
      await book({
        seats: seats.value,
        calendarId,
        location: locations.value[0],
        ...collectFormValues(),
      });
    }

    analytics?.track('booking_confirmed', {
      timeSlot: selectedTimeSlot.value ? selectedTimeSlot.value.start : undefined,
    });

    emits('booking-confirmed');

    disabled.value = false;
  } catch (err) {
    paymentError.value = true;
    console.log(err);
  } finally {
    disabled.value = false;
  }
}

onMounted(async () => {
  if (stripeConfig.value) {
    await initGateway();
  }
});
</script>
