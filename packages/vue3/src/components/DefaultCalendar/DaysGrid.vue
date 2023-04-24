<template>
  <div
    v-if="!state.loading"
    class="cal-grid cal-grid-cols-7 cal-gap-y-1"
  >
    <div
      v-for="(day, i) in state.days"
      :key="i"
      class="cal-mt-2 cal-flex cal-justify-center"
    >
      <div class="cal-flex cal-items-center cal-justify-center">
        <button
          :disabled="!dayHasEvent(day) || (day.isPast && !day.isCurrentMonth)"
          :class="{
            'cal-bg-theme-100 cal-font-medium  cal-text-theme-700 cal-ring-theme-200 focus:cal-outline-none focus:cal-ring-2 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:hover:cal-text-theme-300':
              dayHasEvent(day) && !day.isPast && !isSelectedDay(day),
            'cal-cursor-default cal-text-theme-500 dark:cal-text-theme-300': (day.isPast && !day.isCurrentMonth) || (!dayHasEvent(day) && day.isCurrentMonth),
            'cal-bg-accent-0 cal-font-semibold cal-text-white  dark:cal-bg-accent-0 dark:cal-text-white': isSelectedDay(day),
            'cal-transition-color cal-bg-theme-100 cal-text-theme-700 cal-duration-100 hover:cal-bg-theme-200 hover:cal-text-accent-0 hover:dark:cal-bg-theme-700 hover:dark:cal-text-accent-0':
              !isSelectedDay(day) && dayHasEvent(day) && !day.isPast,
            'cal-pointer-events-none cal-text-theme-500 dark:cal-text-theme-300': day.isPast,
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
import { inject } from 'vue';
import { useCalendar } from '@zaptime/core';
import { IDay } from '@zaptime/core';

import useCalendarViewState from '../../composables/useCalendarViewState';

const { setCalendarView } = useCalendarViewState(inject('calendarId'));

const { dayHasEvent, isSelectedDay, dayClicked, state } = useCalendar(inject('calendarId') as string);

const dayClickedLocalProxy = (day: IDay) => {
  dayClicked(day);
  setCalendarView('pickingTime');
};
</script>
