<template>
  <div
    class="cal-flex cal-h-full cal-justify-center cal-rounded-xl cal-px-0 sm:cal-px-6"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[840px]']"
    :style="{ backgroundColor: color2 }"
  >
    <form
      v-if="selectedTimeSlot !== undefined"
      class="cal-mt-8 sm:cal-w-[370px]"
      :class="[selectedTimeSlot.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']"
      @submit.prevent="onSubmit"
    >
      <h1 class="cal-text-2xl cal-text-theme-700 dark:cal-text-theme-200">
        {{ locale?.confirmationForm?.confirmBooking }}
      </h1>
      <h2 class="cal-mt-[15px] cal-text-[32px] cal-font-semibold cal-text-theme-600 dark:cal-text-theme-300">
        {{ getFormattedDay(selectedTimeSlot.start) }}
        {{ getFormattedDayInMonth(selectedTimeSlot.start) }}
      </h2>
      <h3 class="cal-text-[32px] cal-font-semibold cal-leading-[48px] cal-text-theme-400 dark:cal-text-theme-400">
        {{ getFormattedTime(selectedTimeSlot.start) }} -
        {{ getFormattedTime(selectedTimeSlot.end) }}
      </h3>

      <div class="cal-mt-6 cal-max-w-[370px]">
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium cal-text-theme-700 dark:cal-text-theme-200"
          >{{ locale?.confirmationForm?.name?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="name"
            type="text"
            autocomplete="name"
            name="name"
            class="dark:cal-bg-theme-150 cal-block cal-w-full cal-rounded-md cal-border-2 cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-300 focus:cal-border-theme-500 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-800 sm:cal-text-sm"
            :placeholder="locale?.confirmationForm?.name?.placeholder"
          />
        </div>
      </div>

      <div class="cal-mt-6 cal-max-w-[370px]">
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium cal-text-theme-700 dark:cal-text-theme-200"
        >
          {{ locale?.confirmationForm?.email?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="email"
            required
            type="email"
            name="email"
            autocomplete="email"
            class="dark:cal-bg-theme-150 cal-block cal-w-full cal-rounded-md cal-border-2 cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-300 focus:cal-border-theme-500 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-800 sm:cal-text-sm"
            :placeholder="locale?.confirmationForm?.email?.placeholder"
          />
        </div>
      </div>

      <div
        v-if="selectedTimeSlot.seats > 1"
        class="cal-mt-6 cal-max-w-[370px]"
      >
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium cal-text-theme-700 dark:cal-text-theme-200"
        >
          {{ locale?.confirmationForm?.seats?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="seats"
            type="number"
            :min="1"
            :max="selectedTimeSlot.seats"
            name="seats"
            autocomplete="off"
            class="dark:cal-bg-theme-150 cal-block cal-w-full cal-rounded-md cal-border-2 cal-border-theme-800 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-100 cal-placeholder-theme-800 focus:cal-border-theme-500 focus:cal-outline-none focus:cal-ring-theme-500 sm:cal-text-sm"
            :placeholder="locale?.confirmationForm?.seats?.placeholder"
          />
        </div>
      </div>

      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton @click="$emit('goBack')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          @click="$emit('confirmBooking')"
        >
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useSelectedTimeSlot, book, useConfig, useDateFormatters } from '@zaptime/core';
import PrimaryButton from './atomic/PrimaryButton.vue';
import SecondaryButton from './atomic/SecondaryButton.vue';

const { selectedTimeSlot } = useSelectedTimeSlot(inject('calendarId'));
const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useDateFormatters(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));
const color2 = inject<string>('color2');

defineEmits(['confirmBooking', 'goBack']);

const email = ref('');
const name = ref('');
const seats = ref(1);

const locale = computed(() => {
  if (config === undefined) {
    return;
  }
  return config.value.locale;
});

const splitName = (name: string) => {
  let firstName = '';
  let lastName = '';

  if (name !== '') {
    const splitName = name.split(' ');

    if (splitName.length > 1) {
      firstName = splitName[0];
      lastName = splitName[1];
    }
  }

  return {
    firstName,
    lastName,
  };
};

const onSubmit = async () => {
  const { firstName, lastName } = splitName(name.value);

  await book({
    email: email.value,
    firstName,
    lastName,
    seats: seats.value,
  });
};
</script>
