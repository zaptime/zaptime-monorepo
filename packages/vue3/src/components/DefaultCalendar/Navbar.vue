<template>
  <div>
    <div
      v-if="config.profileImage"
      class="cal-w-full cal-mb-3 cal-pt-3 cal-flex cal-justify-center"
    >
      <img
        class="cal-w-[108px] cal-h-[108px] cal-object-cover cal-object-top cal-rounded-full"
        :src="config.profileImage"
        loading="lazy"
        alt="Profile image"
      />
    </div>
    <p
      v-if="config.locale?.texts?.introduction"
      class="cal-text-center cal-text-2xl cal-w-full cal-font-medium dark:cal-text-theme-200 cal-text-gray-600"
      :class="[config.profileImage ? '' : 'cal-py-12']"
    >
      {{ config.locale?.texts?.introduction }}
    </p>
  </div>
  <div class="cal-flex cal-justify-between cal-py-4">
    <p class="cal-ml-3 cal-font-medium dark:cal-text-theme-200 cal-text-gray-900 cal-text-base">{{ monthName }} {{ currentYear }}</p>
    <div class="cal-flex cal-mr-1">
      <button
        v-if="!prevDisabled"
        :disabled="prevDisabled"
        :class="{ 'cal-cursor-not-allowed': prevDisabled }"
        class="cal-flex cal-justify-center cal-items-center"
        @click.prevent="prev"
      >
        <svg
          class="cal-w-6 cal-rotate-180 cal-h-6 cal-text-accent-1"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-if="!nextDisabled"
        :disabled="nextDisabled"
        :class="{ 'cal-cursor-not-allowed': nextDisabled }"
        class="cal-flex cal-justify-center cal-items-center"
        @click.prevent="next"
      >
        <svg
          class="cal-w-6 cal-h-6 cal-text-accent-1"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useCalendar, useConfig } from '@zaptime/core';

const { monthName, currentYear, prev, prevDisabled, next, nextDisabled } = useCalendar(inject('calendarId') as string);

const { config } = useConfig(inject('calendarId'));
</script>
