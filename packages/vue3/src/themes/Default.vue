<template>
  <div>
    <Calendar class="basic-theme cal-h-full">
      <template #nav>
        <div v-if="config.profileImage">
          <div class="cal-mb-3 cal-flex cal-w-full cal-justify-center cal-pt-3">
            <img class="cal-h-[108px] cal-w-[108px] cal-rounded-full cal-object-cover cal-object-top" :src="config.profileImage" alt="Profile image" />
          </div>
          <p class="cal-w-full cal-text-center cal-text-2xl cal-font-medium cal-text-theme-700 dark:cal-text-theme-200">
            {{ config.locale?.texts?.introduction }}
          </p>
        </div>
        <div :class="{ 'cal-mt-24': !config.profileImage }" class="cal-flex cal-justify-between cal-py-4">
          <p class="cal-ml-3 cal-text-xl cal-font-semibold cal-text-theme-700 dark:cal-text-theme-200">{{ monthName }} {{ currentYear }}</p>
          <div class="cal-mr-1 cal-flex">
            <button v-if="!prevDisabled" :disabled="prevDisabled" :class="{ 'cal-cursor-not-allowed': prevDisabled }" class="cal-flex cal-items-center cal-justify-center" @click.prevent="prev">
              <svg class="cal-rotate-180 cal-text-theme-500 dark:cal-text-theme-500" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M13 11.2038C13 10.3446 14.0119 9.88543 14.6585 10.4512L20.1399 15.2474C20.5952 15.6458 20.5952 16.3542 20.1399 16.7526L14.6585 21.5488C14.0119 22.1146 13 21.6554 13 20.7962V11.2038Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button v-if="!nextDisabled" :disabled="nextDisabled" :class="{ 'cal-cursor-not-allowed': nextDisabled }" class="cal-flex cal-items-center cal-justify-center" @click.prevent="next">
              <svg class="cal-text-theme-500 dark:cal-text-theme-500" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div v-for="header in state.headers" :key="header" class="cal-flex cal-justify-center cal-text-[11px] cal-font-medium cal-text-theme-700 dark:cal-text-theme-300">
          {{ header }}
        </div>
      </template>

      <template #days>
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

      <template #loading>
        <svg v-if="state.loading" class="cal-h-5 cal-w-5 cal-animate-spin cal-text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="cal-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="cal-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </template>

      <template #default>
        <button class="cal-ml-4 cal-mt-5 cal-rounded-md cal-bg-theme-700 cal-px-6 cal-py-3.5 cal-text-theme-100" @click="goPickingDates">
          {{ config.locale?.confirmationForm?.buttons?.goBack }}
        </button>
        <div class="cal-mx-auto cal-h-full cal-px-[30px] sm:cal-mx-0" :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[440px]']">
          <div v-if="!state.loading">
            <div v-if="state.timeSlots && state.timeSlots.length > 0 && !state.loading">
              <div class="cal-pt-[54px]">
                <p class="cal-text-[32px] cal-font-semibold cal-tracking-tighter cal-text-theme-600 dark:cal-text-theme-300">
                  {{ getFormattedDay(state.timeSlots[0].start) }},
                  {{ getFormattedDayInMonth(state.timeSlots[0].start) }}
                </p>
              </div>
              <div class="cal-pb-0.5 cal-pt-6">
                <p v-if="config.locale && config.locale.texts?.choosePreferredTime" class="cal-text-xl cal-font-medium cal-tracking-tighter cal-text-theme-700 dark:cal-text-theme-200">
                  {{ config.locale.texts?.choosePreferredTime }}
                </p>
              </div>

              <div class="cal-mt-2 cal-h-40 cal-overflow-y-auto cal-px-1">
                <button
                  v-for="(timeSlot, i) in state.timeSlots"
                  :key="i"
                  class="cal-group cal-relative cal-my-2 cal-flex cal-w-full cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-border cal-border-theme-100 cal-bg-theme-100 cal-pb-[14px] cal-pt-[16px] cal-outline-none cal-transition-all cal-duration-150 focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 dark:cal-border-theme-600 dark:cal-bg-theme-800 hover:dark:cal-bg-theme-600"
                  @click.prevent="select(timeSlot)"
                >
                  <p
                    class="cal-leading-4"
                    :class="{
                      'cal-text-theme-700 dark:cal-text-white': isSelected(timeSlot),
                      'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(timeSlot),
                    }"
                  >
                    {{ getFormattedTime(timeSlot.start) }} -
                    {{ getFormattedTime(timeSlot.end) }}
                  </p>
                  <svg
                    v-if="isSelected(timeSlot)"
                    class="cal-absolute cal-right-2 cal-top-[13px] cal-h-5 cal-w-5 cal-text-theme-700 dark:cal-text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-else class="cal-w-full">
              <div v-if="!state.monthHasTimeSlots" class="cal-flex cal-h-full cal-flex-col cal-items-center cal-justify-center">
                <div class="cal-mt-24 cal-flex cal-h-full cal-items-center cal-justify-center">
                  <div class="dark:cal-text-themered-50 cal-flex cal-h-40 cal-w-40 cal-items-center cal-justify-center cal-rounded-2xl cal-px-5">
                    <p v-if="config.locale && config.locale.texts?.noTimeSlotAvailable" class="dark:cal-text-theme-theme cal-text-center" v-html="config.locale.texts?.noTimeSlotAvailable"></p>
                  </div>
                </div>
              </div>
              <div v-else class="cal-flex cal-flex-col cal-items-center cal-justify-center">
                <div class="cal-mt-48 cal-flex cal-h-full cal-items-center cal-justify-center">
                  <div class="cal-flex cal-w-40 cal-flex-col cal-items-center cal-justify-center cal-rounded-2xl cal-px-7 cal-py-5 dark:cal-text-theme-200">
                    <svg class="dark:cal-text-theme-primary cal-h-12 cal-w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p v-if="config.locale && config.locale.texts?.chooseDate" class="cal-mt-2 cal-w-40 cal-text-center dark:cal-text-theme-200" v-html="config.locale.texts?.chooseDate"></p>
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
import Calendar from "../components/Calendar.vue";
import { useCalendar, ZaptimeConfig, useDateFormatters } from "@zaptime/core";
import useCalendarViewState from "../composables/useCalendarViewState";

import { inject } from "vue";
import { Day, TimeSlot } from "@zaptime/core";

const { setView, setCalendarView } = useCalendarViewState(inject("calendarId"));

const { monthName, currentYear, dayClicked, dayHasTimeSlot, prev, prevDisabled, next, selectTimeSlot, isSelected, isSelectedDay, nextDisabled, state } = useCalendar(inject("calendarId"));

const config = inject("config") as ZaptimeConfig;

const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useDateFormatters();

const select = (timeSlot: TimeSlot) => {
  selectTimeSlot(timeSlot);

  if (config.externalBooking !== true) {
    setView("form");
  }
};

const dayClickedLocalProxy = (day: Day) => {
  dayClicked(day);
  setCalendarView("pickingTime");
};

const goPickingDates = () => {
  setCalendarView("pickingDate");
  setView("calendar");
};
</script>
