<template>
  <div v-if="!state.loading" class="cal-grid cal-grid-cols-7 cal-gap-y-1">
    <div v-for="(day, i) in state.days" :key="i" class="mt-2 cal-flex cal-justify-center">
      <div class="cal-flex cal-items-center cal-justify-center">
        <button
          :disabled="!dayHasTimeSlot(day) || (day.isPast && !day.isCurrentMonth)"
          :class="{
            'cal-bg-theme-200 cal-ring-theme-200 focus:cal-outline-none focus:cal-ring-2 dark:cal-bg-theme-600 dark:cal-text-theme-100 dark:hover:cal-text-theme-300':
              dayHasTimeSlot(day) && !day.isPast && !isSelectedDay(day),
            'cal-cursor-not-allowed dark:cal-text-theme-400': (day.isPast && !day.isCurrentMonth) || (!dayHasTimeSlot(day) && day.isCurrentMonth),
            'cal-bg-theme-500 cal-font-semibold cal-text-theme-50 dark:cal-bg-theme-25 dark:cal-text-theme-700 dark:hover:cal-text-theme-600': isSelectedDay(day),
            'cal-transition-color cal-duration-100 dark:cal-text-theme-100': !isSelectedDay(day) && dayHasTimeSlot(day) && !day.isPast,
            'cal-pointer-events-none cal-text-theme-400 dark:cal-text-theme-400': day.isPast,
          }"
          class="cal-h-10 cal-w-10 cal-rounded-md cal-text-sm"
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
import { Day } from "@zaptime/core";

import useCalendarViewState from "../../composables/useCalendarViewState";

const { setCalendarView } = useCalendarViewState(inject("calendarId"));

const { dayHasTimeSlot, isSelectedDay, dayClicked, state } = useCalendar(inject("calendarId") as string);

const dayClickedLocalProxy = (day: Day) => {
  dayClicked(day);
  setCalendarView("pickingTime");
};
</script>
