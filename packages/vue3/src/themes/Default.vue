<template>
  <div>
    <Calendar class="basic-theme cal-h-full">
      <template #nav>
        <div v-if="config.profileImage">
          <div class="cal-w-full cal-mb-3 cal-pt-3 cal-flex cal-justify-center">
            <img
              class="cal-w-[108px] cal-h-[108px] cal-object-cover cal-object-top cal-rounded-full"
              :src="config.profileImage"
              alt="Profile image"
            />
          </div>
          <p class="cal-text-center cal-text-2xl cal-w-full cal-font-medium dark:cal-text-theme-200 cal-text-theme-700">
            {{ config.locale?.texts?.introduction }}
          </p>
        </div>
        <div
          :class="{ 'cal-mt-24': !config.profileImage }"
          class="cal-flex cal-justify-between cal-py-4"
        >
          <p class="cal-ml-3 cal-font-semibold dark:cal-text-theme-200 cal-text-theme-700 cal-text-xl">{{ monthName }} {{ currentYear }}</p>
          <div class="cal-flex cal-mr-1">
            <button
              v-if="!prevDisabled"
              :disabled="prevDisabled"
              :class="{ 'cal-cursor-not-allowed': prevDisabled }"
              class="cal-flex cal-justify-center cal-items-center"
              @click.prevent="prev"
            >
              <svg
                class="cal-rotate-180 dark:cal-text-theme-500 cal-text-theme-500"
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
              class="cal-flex cal-justify-center cal-items-center"
              @click.prevent="next"
            >
              <svg
                class="dark:cal-text-theme-500 cal-text-theme-500"
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

      <template #header>
        <div
          v-for="header in state.headers"
          :key="header"
          class="cal-flex cal-justify-center dark:cal-text-theme-300 cal-font-medium cal-text-theme-700 cal-text-[11px]"
        >
          {{ header }}
        </div>
      </template>

      <template #days>
        <div
          v-if="!state.loading"
          class="cal-grid cal-grid-cols-7 cal-gap-y-1"
        >
          <div
            v-for="(day, i) in state.days"
            :key="i"
            class="cal-flex mt-2 cal-justify-center"
          >
            <div class="cal-flex cal-items-center cal-justify-center">
              <button
                :disabled="!dayHasEvent(day) || (day.isPast && !day.isCurrentMonth)"
                :class="{
                  'focus:cal-outline-none dark:cal-text-theme-100 dark:hover:cal-text-theme-300 dark:cal-bg-theme-600 cal-bg-theme-200 focus:cal-ring-2 cal-ring-theme-200':
                    dayHasEvent(day) && !day.isPast && !isSelectedDay(day),
                  'dark:cal-text-theme-400 cal-cursor-not-allowed': (day.isPast && !day.isCurrentMonth) || (!dayHasEvent(day) && day.isCurrentMonth),
                  'dark:cal-text-theme-700 dark:hover:cal-text-theme-600 dark:cal-bg-theme-25 cal-bg-theme-500 cal-text-theme-50 cal-font-semibold': isSelectedDay(day),
                  'cal-transition-color cal-duration-100 dark:cal-text-theme-100': !isSelectedDay(day) && dayHasEvent(day) && !day.isPast,
                  'dark:cal-text-theme-400 cal-text-theme-400 cal-pointer-events-none': day.isPast,
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

      <template #loading>
        <svg
          v-if="state.loading"
          class="cal-w-5 cal-h-5 cal-text-indigo-200 cal-animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="cal-opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="cal-opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </template>

      <template #default>
        <button
          class="cal-py-3.5 cal-ml-4 cal-mt-5 cal-px-6 cal-bg-theme-700 cal-text-theme-100 cal-rounded-md"
          @click="goPickingDates"
        >
          {{ config.locale?.confirmationForm?.buttons?.goBack }}
        </button>
        <div
          class="cal-px-[50px] cal-mx-auto sm:cal-mx-0 cal-h-full"
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

              <div class="cal-mt-2 cal-px-1 cal-overflow-y-auto cal-h-40">
                <button
                  v-for="(event, i) in state.events"
                  :key="i"
                  class="cal-relative dark:cal-bg-theme-800 cal-transition-all cal-duration-150 hover:dark:cal-bg-theme-600 cal-bg-theme-100 cal-border cal-border-theme-100 cal-flex cal-justify-center cal-items-center cal-w-full cal-pt-[16px] cal-pb-[14px] cal-my-2 dark:cal-border-theme-600 cal-cursor-pointer focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 focus:cal-outline-none cal-outline-none cal-rounded-md cal-group"
                  @click.prevent="select(event)"
                >
                  <p
                    class="cal-leading-4"
                    :class="{
                      'dark:cal-text-white cal-text-theme-700': isSelected(event),
                      'dark:cal-text-theme-100 cal-text-theme-800': !isSelected(event),
                    }"
                  >
                    {{ getFormattedTime(event.start) }} -
                    {{ getFormattedTime(event.end) }}
                  </p>
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
                  <div class="cal-px-5 cal-flex cal-items-center cal-justify-center cal-w-40 cal-h-40 dark:cal-text-themered-50 cal-rounded-2xl">
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

      <template #loader="{}"></template>
    </Calendar>
  </div>
</template>

<script lang="ts" setup>
import Calendar from '../components/Calendar.vue';
import { useCalendar } from '@zaptime/core';
import { useFormatters } from '../utils/dateFormatters';
import useCalendarViewState from '../composables/useCalendarViewState';

import { inject } from 'vue';
import IZapTimeConfig from '../types/IZapTimeConfig';
import { IDay, IEvent } from '@zaptime/core';

const { setView, setCalendarView } = useCalendarViewState(inject('calendarId'));

const { monthName, currentYear, dayClicked, dayHasEvent, prev, prevDisabled, next, selectEvent, isSelected, isSelectedDay, nextDisabled, state } = useCalendar(inject('calendarId'));

const config = inject('config') as IZapTimeConfig;

const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useFormatters(inject('calendarId'));

const select = (event: IEvent) => {
  selectEvent(event);

  if (config.externalBooking !== true) {
    setView('form');
  }
};

const dayClickedLocalProxy = (day: IDay) => {
  dayClicked(day);
  setCalendarView('pickingTime');
};

const goPickingDates = () => {
  setCalendarView('pickingDate');
  setView('calendar');
};
</script>
