<template>
  <div
    v-if="!state.loading"
    class="cal-grid cal-grid-cols-7 cal-gap-y-1 cal-w-[304px]"
  >
    <div
      class="cal-flex mt-2 cal-justify-center"
      v-for="(day, i) in state.days"
      :key="i"
    >
      <div class="cal-flex cal-items-center cal-justify-center">
        <button
          :disabled="!dayHasEvent(day) || (day.isPast && !day.isCurrentMonth)"
          :class="{
            'focus:cal-outline-none dark:cal-text-theme-100  cal-text-gray-700 dark:hover:cal-text-theme-300 dark:cal-bg-theme-600 cal-bg-gray-100 focus:cal-ring-2 cal-ring-theme-200':
              dayHasEvent(day) && !day.isPast && !isSelectedDay(day),
            'dark:cal-text-gray-500 cal-cursor-not-allowed':
              day.isPast && !day.isCurrentMonth,
            'dark:cal-text-gray-500 cal-cursor-not-allowed':
              !dayHasEvent(day) && day.isCurrentMonth,
            'dark:cal-text-theme-700 dark:hover:cal-text-theme-600 dark:cal-bg-theme-25 cal-bg-accent-0  cal-text-white cal-font-semibold':
              isSelectedDay(day),
            'cal-transition-color cal-duration-100 dark:cal-text-theme-100 cal-bg-gray-100 hover:cal-bg-gray-200 hover:cal-text-accent-0 cal-text-gray-700':
              !isSelectedDay(day) && dayHasEvent(day) && !day.isPast,
            'dark:cal-text-gray-500 cal-text-gray-500 cal-pointer-events-none':
              day.isPast,
          }"
          class="cal-w-10 cal-h-10 cal-text-sm cal-rounded-md"
          @click.prevent="dayClickedLocalProxy(day)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { useCalendar } from "@zaptime/core";
import { IDay } from "@zaptime/core";

import useCalendarViewState from "../../composables/useCalendarViewState";

const { setCalendarView } = useCalendarViewState(inject("calendarId"));

const { dayHasEvent, isSelectedDay, dayClicked, state } = useCalendar(
  inject("calendarId") as string
);

const dayClickedLocalProxy = (day: IDay) => {
  dayClicked(day);
  setCalendarView("pickingTime");
};
</script>
