<template>
  <div>
    <div
      v-if="!state.loading"
      class="cal:grid cal:grid-cols-7 cal:gap-y-1"
    >
      <div
        v-for="(day, i) in state.days"
        :key="i"
        class="cal:mt-2 cal:flex cal:justify-center"
      >
        <div class="cal:flex cal:items-center cal:justify-center">
          <button
            :disabled="!dayHasTimeSlot(day) || (day.isPast && !day.isCurrentMonth)"
            :class="{
              'cal:bg-theme-100 cal:font-medium  cal:text-theme-700 cal:ring-theme-200 cal:focus:outline-hidden cal:focus:ring-2 cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:hover:text-theme-300':
                dayHasTimeSlot(day) && !day.isPast && !isSelectedDay(day),
              'cal:cursor-default cal:text-theme-500 cal:dark:text-theme-300': (day.isPast && !day.isCurrentMonth) || (!dayHasTimeSlot(day) && day.isCurrentMonth),
              'cal:bg-accent-base cal:font-semibold cal:text-white  cal:dark:bg-accent-base cal:dark:text-white': isSelectedDay(day),
              'cal:transition-color cal:bg-theme-100 cal:text-theme-700 cal:duration-100 cal:hover:bg-theme-200 cal:hover:text-accent-base cal:dark:hover:bg-theme-700 cal:dark:hover:text-accent-base':
                !isSelectedDay(day) && dayHasTimeSlot(day) && !day.isPast,
              'cal:pointer-events-none cal:text-theme-500 cal:dark:text-theme-300': day.isPast,
            }"
            class="cal:h-10 cal:w-10 cal:rounded-md cal:text-sm"
            @click.prevent="dayClickedLocalProxy(day)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <DaysGridLoadingSkeleton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useCalendar } from '@zaptime/core';
import { Day } from '@zaptime/core';

import useCalendarViewState from '../../composables/useCalendarViewState';
import DaysGridLoadingSkeleton from './DaysGridLoadingSkeleton.vue';

const { setCalendarView } = useCalendarViewState(inject('calendarId'));

const { dayHasTimeSlot, isSelectedDay, dayClicked, state } = useCalendar(inject('calendarId'));

const dayClickedLocalProxy = (day: Day) => {
  dayClicked(day);
  setCalendarView('pickingTime');
};
</script>
