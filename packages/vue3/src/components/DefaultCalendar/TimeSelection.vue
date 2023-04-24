<template>
  <div
    class="cal-mx-auto cal-h-full cal-min-h-[524px] cal-bg-white cal-px-[50px] cal-pt-4 dark:cal-bg-theme-900 sm:cal-mx-0"
    :class="[config.compact ? 'cal-w-[330px] cal-rounded-xl sm:cal-w-[400px]' : 'cal-w-[330px] cal-rounded-r-xl sm:cal-w-[440px]']"
  >
    <PrimaryButton
      v-if="config.compact === true"
      class="cal-mt-5"
      @click="goPickingDates"
    >
      {{ config.locale?.confirmationForm?.buttons?.goBack }}
    </PrimaryButton>
    <div
      v-if="!state.loading"
      class="cal-h-full"
    >
      <div
        v-if="state.events && state.events.length > 0 && !state.loading"
        class="cal-flex cal-h-full cal-flex-col cal-justify-between"
      >
        <div>
          <div :class="[config.locale?.texts?.introduction || config.profileImage ? 'cal-pt-[54px]' : '']">
            <p class="cal-text-2xl cal-font-semibold cal-tracking-tighter cal-text-theme-600 dark:cal-text-theme-300">
              {{ getFormattedDay(state.events[0].start) }},
              {{ getFormattedDayInMonth(state.events[0].start) }}
            </p>
          </div>
          <div class="cal-pb-0.5 cal-pt-6">
            <p
              v-if="config.locale && config.locale.texts?.choosePreferredTime"
              class="cal-text-base cal-font-medium cal-tracking-tighter cal-text-theme-600 dark:cal-text-theme-200"
            >
              {{ config.locale.texts?.choosePreferredTime }}
            </p>
          </div>

          <div class="cal-mt-2 cal-h-40 cal-overflow-y-auto cal-px-1">
            <div
              v-for="(event, i) in state.events"
              :key="i"
              class="w-full"
            >
              <ConfirmationButton
                :event="event"
                @select-event="select(event)"
              ></ConfirmationButton>
            </div>
          </div>
        </div>

        <div class="cal-flex cal-items-center cal-space-x-2 cal-pb-4">
          <TimeZonePicker class="cal-px-1"></TimeZonePicker>
          <Switch
            v-model="hourCycleSwitchValue"
            class="cal-py-3"
          >
            <template #before> am/pm </template>
            <template #after> 24h </template>
          </Switch>
        </div>
      </div>
      <div
        v-else
        class="cal-w-full"
      >
        <div
          v-if="!state.monthHasEvents"
          class="cal-flex cal-h-full cal-flex-col cal-items-center cal-justify-center"
        >
          <div class="cal-mt-24 cal-flex cal-h-full cal-items-center cal-justify-center">
            <div class="dark:cal-text-themered-50 cal-flex cal-h-40 cal-w-40 cal-items-center cal-justify-center cal-rounded-2xl cal-px-5">
              <p
                v-if="config.locale && config.locale.texts?.noEventAvailable"
                class="dark:cal-text-theme-theme cal-text-center"
                v-html="config.locale.texts?.noEventAvailable"
              ></p>
            </div>
          </div>
        </div>
        <div
          v-else
          class="cal-flex cal-flex-col cal-items-center cal-justify-center"
        >
          <div class="cal-mt-48 cal-flex cal-h-full cal-items-center cal-justify-center">
            <div class="cal-flex cal-w-40 cal-flex-col cal-items-center cal-justify-center cal-rounded-2xl cal-px-7 cal-py-5 dark:cal-text-theme-200">
              <svg
                class="dark:cal-text-theme-primary cal-h-12 cal-w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p
                v-if="config.locale && config.locale.texts?.chooseDate"
                class="cal-mt-2 cal-w-40 cal-text-center dark:cal-text-theme-200"
                v-html="config.locale.texts?.chooseDate"
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendar, useConfig, useHourCycle } from '@zaptime/core';
import { useFormatters } from '../../utils/dateFormatters';
import useCalendarViewState from '../../composables/useCalendarViewState';
import PrimaryButton from '../atomic/PrimaryButton.vue';
import { inject, computed } from 'vue';
import { IEvent } from '@zaptime/core';
import ConfirmationButton from './TimeConfirmationButton.vue';
import TimeZonePicker from '../atomic/TimeZonePicker.vue';
import Switch from '../atomic/Switch.vue';

const { hourCycle } = useHourCycle();

const { setView, setCalendarView } = useCalendarViewState(inject('calendarId'));

const { selectEvent, state } = useCalendar(inject('calendarId'));

const { config } = useConfig(inject('calendarId'));

const { getFormattedDay, getFormattedDayInMonth } = useFormatters(inject('calendarId'));

const hourCycleSwitchValue = computed({
  get() {
    return hourCycle.value === 'h23';
  },
  set() {
    if (hourCycle.value === 'h11') {
      hourCycle.value = 'h23';
    } else {
      hourCycle.value = 'h11';
    }
  },
});

const select = (event: IEvent) => {
  selectEvent(event);

  if (config.value.externalBooking !== true) {
    setView('form');
  }
};

const goPickingDates = () => {
  setView('calendar');
  setCalendarView('pickingDate');
};
</script>
