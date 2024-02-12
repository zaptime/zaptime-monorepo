<template>
  <div>
    <div
      v-if="config.profileImage"
      class="cal-mb-3 cal-flex cal-w-full cal-justify-center cal-pt-3"
    >
      <img
        class="cal-h-[108px] cal-w-[108px] cal-rounded-full cal-object-cover cal-object-top"
        :src="config.profileImage"
        loading="lazy"
        alt="Profile image"
      />
    </div>
    <p
      v-if="config.locale?.texts?.introduction"
      class="cal-w-full cal-text-center cal-font-medium cal-text-theme-600 dark:cal-text-theme-200"
      :class="[config.profileImage ? '' : 'cal-py-12']"
    >
      {{ config.locale?.texts?.introduction }}
    </p>
  </div>
  <div class="cal-flex cal-justify-between cal-py-4">
    <p class="cal-ml-3 cal-text-base cal-font-medium cal-text-theme-900 dark:cal-text-theme-200">{{ monthName }} {{ currentYear }}</p>
    <div class="cal-mr-1 cal-flex">
      <button
        v-if="!prevDisabled"
        :disabled="prevDisabled"
        :class="{ 'cal-cursor-not-allowed': prevDisabled }"
        class="cal-flex cal-items-center cal-justify-center"
        @click.prevent="prev"
      >
        <svg
          class="cal-h-6 cal-w-6 cal-rotate-180 cal-text-accent-1 hover:cal-text-accent-0"
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
        class="cal-flex cal-items-center cal-justify-center"
        @click.prevent="next"
      >
        <svg
          class="cal-h-6 cal-w-6 cal-text-accent-1 hover:cal-text-accent-0"
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
