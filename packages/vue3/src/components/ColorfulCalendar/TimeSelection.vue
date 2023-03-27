<template>
  <PrimaryButton
    v-if="config.compact === true"
    class="cal-ml-4 cal-mt-5"
    @click="goPickingDates"
  >
    {{ config.locale?.confirmationForm?.buttons?.goBack }}
  </PrimaryButton>

  <div
    class="cal-px-[50px] cal-mx-auto sm:cal-mx-0"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[440px]']"
  >
    <div v-if="!state.loading">
      <div v-if="state.events && state.events.length > 0 && !state.loading">
        <div class="cal-pt-[54px]">
          <p class="cal-text-[32px] dark:cal-text-theme-300 cal-text-theme-600 cal-font-semibold cal-tracking-tighter">
            {{ getFormattedDay(state.events[0].start) }},
            {{ getFormattedDayInMonth(state.events[0].start) }}
          </p>
        </div>
        <div class="cal-pt-6 cal-pb-0.5">
          <p
            v-if="config.locale && config.locale.texts?.choosePreferredTime"
            class="cal-tracking-tighter cal-text-xl cal-font-medium dark:cal-text-theme-200 cal-text-theme-700"
          >
            {{ config.locale.texts?.choosePreferredTime }}
          </p>
        </div>

        <div class="cal-mt-2 cal-px-1 cal-overflow-y-auto cal-h-64">
          <button
            v-for="(event, i) in state.events"
            :key="i"
            class="cal-relative dark:cal-bg-theme-800 cal-transition-all cal-duration-150 hover:dark:cal-bg-theme-600 cal-bg-theme-100 cal-border cal-border-theme-100 cal-flex cal-justify-center cal-items-center cal-w-full cal-pt-[16px] cal-pb-[14px] cal-my-2 dark:cal-border-theme-600 cal-cursor-pointer focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 focus:cal-outline-none cal-outline-none cal-rounded-md cal-group"
            @click.prevent="select(event)"
          >
            <span
              class="cal-leading-4"
              :class="{
                'dark:cal-text-white py-4 cal-text-theme-700': isSelected(event),
                'dark:cal-text-theme-100 cal-text-theme-800': !isSelected(event),
              }"
            >
              {{ getFormattedTime(event.start) }} -
              {{ getFormattedTime(event.end) }}
            </span>
            <svg
              v-if="isSelected(event)"
              class="cal-absolute cal-w-5 cal-h-5 cal-text-theme-700 dark:cal-text-white cal-top-[13px] cal-right-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        v-else
        class="cal-w-full"
      >
        <div
          v-if="!state.monthHasEvents"
          class="cal-flex cal-justify-center cal-h-full cal-flex-col cal-items-center"
        >
          <div class="cal-flex cal-items-center cal-justify-center cal-h-full cal-mt-24">
            <div class="cal-px-5 cal-flex cal-items-center cal-justify-center cal-w-40 cal-h-40 dark:cal-text-theme-50 cal-rounded-2xl">
              <p
                v-if="config.locale && config.locale.texts?.noEventAvailable"
                class="dark:cal-text-theme-gray cal-text-center"
                v-html="config.locale.texts?.noEventAvailable"
              ></p>
            </div>
          </div>
        </div>
        <div
          v-else
          class="cal-flex cal-justify-center cal-flex-col cal-items-center"
        >
          <div class="cal-flex cal-items-center cal-justify-center cal-h-full cal-mt-48">
            <div class="cal-py-5 cal-flex cal-flex-col cal-items-center cal-justify-center cal-px-7 cal-w-40 dark:cal-text-theme-200 cal-rounded-2xl">
              <svg
                class="cal-w-12 cal-h-12 dark:cal-text-theme-primary"
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
                class="cal-mt-2 dark:cal-text-theme-200 cal-w-40 cal-text-center"
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
import { useCalendar, useConfig } from '@zaptime/core';
import { useFormatters } from '../../utils/dateFormatters';
import useCalendarViewState from '../../composables/useCalendarViewState';
import PrimaryButton from '../atomic/PrimaryButton.vue';
import { inject } from 'vue';
import { IEvent } from '@zaptime/core';

const { setView, setCalendarView } = useCalendarViewState(inject('calendarId'));

const { selectEvent, isSelected, state } = useCalendar(inject('calendarId'));

const { config } = useConfig(inject('calendarId'));

const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useFormatters(inject('calendarId'));

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
