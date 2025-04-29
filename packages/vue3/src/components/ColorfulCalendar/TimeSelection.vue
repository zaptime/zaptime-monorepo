<template>
  <PrimaryButton v-if="config.compact === true" class="cal-ml-4 cal-mt-5" @click="goPickingDates">
    {{ config.locale?.confirmationForm?.buttons?.goBack }}
  </PrimaryButton>

  <div class="cal-mx-auto cal-px-[50px] sm:cal-mx-0" :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[440px]']">
    <div v-if="!state.loading">
      <div v-if="state.timeSlots && state.timeSlots.length > 0 && !state.loading">
        <div :class="[config.compact ? '' : 'cal-pt-[54px]']">
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

        <div class="cal-mt-2 cal-h-64 cal-overflow-y-auto cal-px-1">
          <button
            v-for="(timeSlot, i) in state.timeSlots"
            :key="i"
            class="cal-group cal-relative cal-my-2 cal-flex cal-w-full cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-border cal-border-theme-100 cal-bg-theme-100 cal-pb-[14px] cal-pt-[16px] cal-outline-none cal-transition-all cal-duration-150 focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 dark:cal-border-theme-600 dark:cal-bg-theme-800 hover:dark:cal-bg-theme-600"
            @click.prevent="select(timeSlot)"
          >
            <span
              class="cal-leading-4"
              :class="{
                'py-4 cal-text-theme-700 dark:cal-text-white': isSelected(timeSlot),
                'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(timeSlot),
              }"
            >
              {{ getFormattedTime(timeSlot.start) }} -
              {{ getFormattedTime(timeSlot.end) }}
            </span>
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
            <div class="cal-flex cal-h-40 cal-w-40 cal-items-center cal-justify-center cal-rounded-2xl cal-px-5 dark:cal-text-theme-50">
              <p v-if="config.locale && config.locale.texts?.noTimeSlotAvailable" class="dark:cal-text-theme-theme cal-text-center" v-html="config.locale.texts?.noTimeSlotAvailable"></p>
            </div>
          </div>
        </div>
        <div v-else class="cal-flex cal-flex-col cal-items-center cal-justify-center">
          <div class="cal-mt-48 cal-flex cal-h-full cal-items-center cal-justify-center">
            <div class="cal-flex cal-w-40 cal-flex-col cal-items-center cal-justify-center cal-rounded-2xl cal-px-7 cal-py-5 dark:cal-text-theme-200">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.5 9.58332V7.33332C16.5 5.93319 16.5 5.23313 16.2275 4.69835C15.9878 4.22794 15.6054 3.84549 15.135 3.60581C14.6002 3.33332 13.9001 3.33332 12.5 3.33332H5.5C4.09987 3.33332 3.3998 3.33332 2.86502 3.60581C2.39462 3.84549 2.01217 4.22794 1.77248 4.69835C1.5 5.23313 1.5 5.93319 1.5 7.33332V14.3333C1.5 15.7335 1.5 16.4335 1.77248 16.9683C2.01217 17.4387 2.39462 17.8212 2.86502 18.0608C3.3998 18.3333 4.09987 18.3333 5.5 18.3333H9.41667M16.5 8.33332H1.5M12.3333 1.66666V4.99999M5.66667 1.66666V4.99999M14 17.5V12.5M11.5 15H16.5"
                  stroke="#3F3F46"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <p v-if="config.locale && config.locale.texts?.chooseDate" class="cal-mt-2 cal-w-40 cal-text-center dark:cal-text-theme-200" v-html="config.locale.texts?.chooseDate"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendar, useConfig, useDateFormatters } from "@zaptime/core";
import useCalendarViewState from "../../composables/useCalendarViewState";
import PrimaryButton from "../atomic/PrimaryButton.vue";
import { inject } from "vue";
import { TimeSlot } from "@zaptime/core";

const { setView, setCalendarView } = useCalendarViewState(inject("calendarId"));

const { selectTimeSlot, isSelected, state } = useCalendar(inject("calendarId"));

const { config } = useConfig(inject("calendarId"));

const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useDateFormatters();

const select = (timeSlot: TimeSlot) => {
  selectTimeSlot(timeSlot);

  if (config.value.externalBooking !== true) {
    setView("form");
  }
};

const goPickingDates = () => {
  setView("calendar");
  setCalendarView("pickingDate");
};
</script>
