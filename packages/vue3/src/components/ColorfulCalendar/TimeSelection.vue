<template>
  <PrimaryButton
    v-if="config.compact === true"
    class="cal-ml-4 cal-mt-5"
    @click="goPickingDates"
  >
    {{ config.locale?.confirmationForm?.buttons?.goBack }}
  </PrimaryButton>

  <div
    class="cal-mx-auto cal-px-[50px] sm:cal-mx-0"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[440px]']"
  >
    <div v-if="!state.loading">
      <div v-if="state.events && state.events.length > 0 && !state.loading">
        <div class="cal-pt-[54px]">
          <p class="cal-text-[32px] cal-font-semibold cal-tracking-tighter cal-text-theme-600 dark:cal-text-theme-300">
            {{ getFormattedDay(state.events[0].start) }},
            {{ getFormattedDayInMonth(state.events[0].start) }}
          </p>
        </div>
        <div class="cal-pb-0.5 cal-pt-6">
          <p
            v-if="config.locale && config.locale.texts?.choosePreferredTime"
            class="cal-text-xl cal-font-medium cal-tracking-tighter cal-text-theme-700 dark:cal-text-theme-200"
          >
            {{ config.locale.texts?.choosePreferredTime }}
          </p>
        </div>

        <div class="cal-mt-2 cal-h-64 cal-overflow-y-auto cal-px-1">
          <button
            v-for="(event, i) in state.events"
            :key="i"
            class="cal-group cal-relative cal-my-2 cal-flex cal-w-full cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-border cal-border-theme-100 cal-bg-theme-100 cal-pb-[14px] cal-pt-[16px] cal-outline-none cal-transition-all cal-duration-150 focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 dark:cal-border-theme-600 dark:cal-bg-theme-800 hover:dark:cal-bg-theme-600"
            @click.prevent="select(event)"
          >
            <span
              class="cal-leading-4"
              :class="{
                'py-4 cal-text-theme-700 dark:cal-text-white': isSelected(event),
                'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(event),
              }"
            >
              {{ getFormattedTime(event.start) }} -
              {{ getFormattedTime(event.end) }}
            </span>
            <svg
              v-if="isSelected(event)"
              class="cal-absolute cal-right-2 cal-top-[13px] cal-h-5 cal-w-5 cal-text-theme-700 dark:cal-text-white"
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
          class="cal-flex cal-h-full cal-flex-col cal-items-center cal-justify-center"
        >
          <div class="cal-mt-24 cal-flex cal-h-full cal-items-center cal-justify-center">
            <div class="cal-flex cal-h-40 cal-w-40 cal-items-center cal-justify-center cal-rounded-2xl cal-px-5 dark:cal-text-theme-50">
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
