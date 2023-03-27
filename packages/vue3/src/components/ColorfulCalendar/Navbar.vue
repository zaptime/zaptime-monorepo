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
      class="cal-text-center cal-text-2xl cal-w-full cal-font-medium dark:cal-text-theme-200 cal-text-theme-700"
      :class="[config.profileImage ? '' : 'cal-py-12']"
    >
      {{ config.locale?.texts?.introduction }}
    </p>
  </div>
  <div
    :class="{
      'cal-mt-24': !config.profileImage && config.locale?.texts?.introduction === undefined,
    }"
    class="cal-flex cal-justify-between cal-py-4"
  >
    <p class="cal-ml-3 cal-font-semibold dark:cal-text-theme-200 cal-text-theme-700 cal-text-xl">{{ monthName }} {{ currentYear }}</p>
    <div class="cal-flex cal-mr-1">
      <button
        v-if="!prevDisabled"
        :disabled="prevDisabled"
        :class="{ 'cal-cursor-not-allowed': prevDisabled }"
        class="cal-flex cal-justify-center cal-items-center"
        @click.prevent="prev"
      >
        <svg
          class="cal-rotate-180 dark:cal-text-theme-500 cal-text-theme-500"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13 11.2038C13 10.3446 14.0119 9.88543 14.6585 10.4512L20.1399 15.2474C20.5952 15.6458 20.5952 16.3542 20.1399 16.7526L14.6585 21.5488C14.0119 22.1146 13 21.6554 13 20.7962V11.2038Z"
            fill="currentColor"
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
          class="dark:cal-text-theme-500 cal-text-theme-500"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13 11.2038C13 10.3446 14.0119 9.88543 14.6585 10.4512L20.1399 15.2474C20.5952 15.6458 20.5952 16.3542 20.1399 16.7526L14.6585 21.5488C14.0119 22.1146 13 21.6554 13 20.7962V11.2038Z"
            fill="currentColor"
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
