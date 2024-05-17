<template>
  <div>
    <div
      v-if="!config.externalBooking"
      ref="target"
      class="w-full cal-flex cal-items-center cal-space-x-2"
    >
      <button
        class="cal-group cal-my-2 cal-inline-flex cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-bg-theme-100 cal-font-medium cal-outline-none cal-transition-all cal-duration-150 cal-ease-out focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 dark:cal-border-theme-600 dark:cal-bg-theme-800"
        :class="[
          isSelected(timeSlot) ? 'cal-bg-accent-base cal-text-white' : 'cal-bg-theme-100 cal-text-theme-700 hover:cal-bg-theme-200 hover:cal-text-accent-base hover:dark:cal-bg-theme-600',
          confirmationState ? ' cal-w-1/2' : 'cal-w-full',
        ]"
        @click.prevent="confirmationState = true"
      >
        <span
          class="cal-flex cal-items-center cal-py-4 cal-leading-4"
          :class="{
            'cal-text-theme-700 dark:cal-text-white ': isSelected(timeSlot),
            'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(timeSlot),
          }"
        >
          {{ getFormattedTime(timeSlot.start) }} -
          {{ getFormattedTime(timeSlot.end) }}
        </span>
      </button>

      <PrimaryButton
        v-show="confirmationState"
        class="cal-inline-flex cal-h-12 cal-w-1/2 cal-justify-center"
        @click="emit('selectTimeSlot')"
      >
        {{ config.locale && config.locale.texts?.pickTime }}
      </PrimaryButton>
    </div>
    <div
      v-else
      class="w-full cal-flex cal-items-center cal-space-x-2"
    >
      <button
        class="cal-group cal-relative cal-my-2 cal-inline-flex cal-w-full cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-font-medium cal-outline-none cal-ring-offset-2 cal-transition-all cal-duration-150 cal-ease-out focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-accent-base dark:cal-ring-offset-theme-700"
        :class="[isSelected(timeSlot) ? 'cal-bg-accent-base cal-text-white' : 'cal-bg-theme-100 cal-text-theme-700 hover:cal-bg-theme-200 hover:cal-text-accent-base dark:cal-bg-theme-800 hover:dark:cal-bg-theme-600']"
        @click.prevent="emit('selectTimeSlot')"
      >
        <span
          class="cal-flex cal-items-center cal-py-4 cal-leading-4"
          :class="{
            'cal-text-white ': isSelected(timeSlot),
            'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(timeSlot),
          }"
        >
          {{ getFormattedTime(timeSlot.start) }} -
          {{ getFormattedTime(timeSlot.end) }}
        </span>
        <svg
          v-if="isSelected(timeSlot)"
          class="cal-absolute cal-right-5 cal-h-6 cal-w-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot } from '@zaptime/core';
import { useCalendar, useDateFormatters, useConfig } from '@zaptime/core';
import { ref, inject } from 'vue';
import { onClickOutside } from '@vueuse/core';
import PrimaryButton from '../atomic/PrimaryButton.vue';

const { getFormattedTime } = useDateFormatters();
const { isSelected } = useCalendar(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));

const target = ref();
const confirmationState = ref(false);

defineProps<{
  timeSlot: TimeSlot;
}>();

const emit = defineEmits(['selectTimeSlot']);

onClickOutside(target, () => {
  confirmationState.value = false;
});
</script>
