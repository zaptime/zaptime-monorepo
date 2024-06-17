<template>
  <div class="cal-h-full cal-min-h-[360px]">
    <div
      v-if="view === 'calendar'"
      class="cal-h-full"
    >
      <div
        v-if="config.compact === true"
        class="cal-h-full cal-w-[330px] cal-bg-white dark:cal-bg-theme-900 sm:cal-w-[400px]"
        :class="[config.compact ? 'cal-rounded-xl' : '']"
      >
        <div
          v-if="config.compact === undefined || calendarView === 'pickingDate'"
          :key="calendarView"
          class="cal-h-full cal-w-full cal-rounded-l-xl cal-bg-theme-50 cal-px-3 cal-pb-1 dark:cal-bg-theme-900 sm:cal-px-[48px]"
          :class="[config.compact ? 'cal-rounded-r-xl' : '']"
          :style="{ backgroundColor: color }"
        >
          <Navbar />

          <div class="cal-mb-3 cal-mt-1 cal-grid cal-grid-cols-7">
            <Header />
          </div>

          <div class="cal-mb-14">
            <DaysGrid />
          </div>
        </div>
        <div
          v-if="config.compact === undefined || calendarView === 'pickingTime'"
          class="cal-h-full cal-rounded-r-xl cal-bg-white"
          :class="[config.compact ? 'cal-rounded-l-xl' : '']"
          :style="{ backgroundColor: color2 }"
        >
          <TimeSelection />
        </div>
      </div>

      <div
        v-else
        class="cal-flex cal-h-full cal-w-[841px] cal-rounded-l-xl cal-bg-white dark:cal-bg-theme-900"
        :class="['cal-rounded-xl', classes]"
      >
        <div
          :key="calendarView"
          class="cal-w-[330px] cal-rounded-l-xl cal-px-[48px] sm:cal-w-[400px]"
          :style="{ backgroundColor: color }"
        >
          <Navbar />

          <div class="cal-mb-3 cal-mt-1 cal-grid cal-grid-cols-7">
            <Header />
          </div>

          <div class="cal-mb-14 cal-w-full">
            <DaysGrid />
          </div>
        </div>
        <div
          class="cal-rounded-r-xl cal-border-l cal-border-theme-200 dark:cal-border-theme-700"
          :style="{ backgroundColor: color2 }"
        >
          <TimeSelection />
        </div>
      </div>
    </div>

    <Transition
      name="slide-fade"
      mode="out-in"
    >
      <ConfirmForm
        v-if="view === 'form'"
        :class="[classes]"
        @go-back="() => setView('calendar')"
        @booking-confirmed="onBookingConfirmed"
      />
    </Transition>

    <SuccessMessage
      v-if="view === 'success'"
      :class="[classes]"
    ></SuccessMessage>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import ConfirmForm from './ConfirmForm.vue';
import Navbar from './DefaultCalendar/Navbar.vue';
import Header from './DefaultCalendar/Header.vue';
import TimeSelection from './DefaultCalendar/TimeSelection.vue';
import DaysGrid from './DefaultCalendar/DaysGrid.vue';
import SuccessMessage from './DefaultCalendar/SuccessMessage.vue';

import type { ReservationResponse } from '@zaptime/core';

import useCalendarViewState from '../composables/useCalendarViewState';

import { useConfig } from '@zaptime/core';

defineProps({
  bgClass: {
    type: String,
    default: null,
  },
  classes: {
    type: String,
    default: '',
  },
  value: {
    type: Date,
  },
});

const emit = defineEmits<{
  (e: 'booking-confirmed', reservation: ReservationResponse): void;
}>();

const { view, calendarView, setView } = useCalendarViewState(inject('calendarId'));

const { config } = useConfig(inject('calendarId'));

const color = inject<string>('color');
const color2 = inject<string>('color2');

function onBookingConfirmed(reservationData: ReservationResponse) {
  setView('success');
  emit('booking-confirmed', reservationData);
}
</script>

<style>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 150ms ease-out;
}

.slide-fade-leave-active {
  transition: all 0;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
