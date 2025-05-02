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
      class="cal-w-full cal-text-center cal-text-2xl cal-font-medium cal-text-theme-700 dark:cal-text-theme-200"
      :class="[config.profileImage ? '' : 'cal-py-12']"
      v-html="config.locale?.texts?.introduction"
    ></p>
  </div>
  <div
    :class="{
      'cal-mt-24':
        !config.profileImage &&
        config.locale?.texts?.introduction === undefined,
    }"
    class="cal-flex cal-justify-between cal-py-4"
  >
    <p
      class="cal-ml-3 cal-text-xl cal-font-semibold cal-text-theme-700 dark:cal-text-theme-200"
    >
      {{ monthName }} {{ currentYear }}
    </p>
    <div class="cal-mr-1 cal-flex">
      <button
        v-if="!prevDisabled"
        :disabled="prevDisabled"
        :class="{ 'cal-cursor-not-allowed': prevDisabled }"
        class="cal-flex cal-items-center cal-justify-center"
        @click.prevent="prev"
      >
        <svg
          class="cal-rotate-180 cal-text-theme-500 dark:cal-text-theme-500"
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
        class="cal-flex cal-items-center cal-justify-center"
        @click.prevent="next"
      >
        <svg
          class="cal-text-theme-500 dark:cal-text-theme-500"
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
import { inject } from "vue";
import { useCalendar, useConfig } from "@zaptime/core";

const { monthName, currentYear, prev, prevDisabled, next, nextDisabled } =
  useCalendar(inject("calendarId") as string);

const { config } = useConfig(inject("calendarId"));
</script>
