<template>
  <div
      class="sm:cal-px-6 cal-pt-24 cal-bg-white cal-px-0 cal-h-full cal-rounded-xl cal-justify-center"
      :class="[
      config.compact
        ? 'cal-w-[330px] sm:cal-w-[400px]'
        : 'cal-w-[330px] sm:cal-w-[840px]',
    ]"

  >
    <div class="cal-flex cal-justify-center">
      <svg class="cal-w-16 cal-h-16 cal-text-accent-0" fill="currentColor" viewBox="0 0 20 20"
           xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd">
        </path>
      </svg>

    </div>

    <h1
        class="dark:cal-text-theme-300 cal-text-center cal-text-gray-700 cal-text-2xl cal-mt-4 cal-font-semibold"
    >
      Congratulations!
    </h1>


    <h2
        class="dark:cal-text-theme-200 cal-text-center cal-text-gray-500 cal-mt-2 cal-font-medium cal-text-2xl "
    >
      Your seat has been successfully booked.
    </h2>
  </div>
</template>

<script lang="ts" setup>
import {inject} from "vue";
import {useConfig} from "@zaptime/core";

const {config} = useConfig(inject("calendarId"));

</script>