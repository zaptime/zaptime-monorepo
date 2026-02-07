<template>
  <div>
    <div
      v-if="!state.loading"
      class="cal-grid cal-relative cal-grid-cols-7 cal-gap-y-1"
    >
      <div
        v-if="!state.monthHasTimeSlots"
        class="md:cal-hidden cal-absolute cal-inset-0"
      >
        <div
          class="dark:cal-text-theme cal-mt-1.5 cal-flex cal-flex-col cal-h-full cal-items-center cal-justify-center cal-rounded-2xl cal-px-5 cal-backdrop-blur-[6px] dark:cal-bg-gray-800/10"
        >
          <p
            v-if="config.locale && config.locale.texts?.noTimeSlotAvailable"
            class="dark:cal-text-theme-200 cal-text-sm cal-text-theme-700 cal-text-center"
            v-html="config.locale.texts?.noTimeSlotAvailable"
          ></p>

          <button
            class="cal-mt-4 cal-rounded-lg cal-bg-accent-base cal-pl-4 cal-pr-2 cal-py-2 cal-text-sm cal-font-medium cal-text-white cal-shadow-sm hover:cal-bg-accent-dark focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-500 focus:cal-ring-offset-2 dark:cal-bg-theme-accent-base dark:hover:cal-bg-theme-accent-dark dark:focus:cal-ring-theme-400 cal-transition-all cal-duration-75 cal-ease-out cal-group"
            @click="next"
          >
            <span
              class="cal-flex cal-gap-1 cal-items-center cal-justify-center"
            >
              {{ config.locale?.texts?.showNextMonth }}
              <ChevronRightIcon
                class="group-hover:cal-translate-x-1 cal-transition-all cal-duration-75 cal-ease-out cal-h-6 cal-w-6"
              />
            </span>
          </button>
        </div>
      </div>

      <div
        v-for="(day, i) in state.days"
        :key="i"
        class="cal-mt-2 cal-flex cal-justify-center"
      >
        <div class="cal-flex cal-items-center cal-justify-center">
          <button
            :disabled="
              !dayHasTimeSlot(day) || (day.isPast && !day.isCurrentMonth)
            "
            :class="{
              'cal-bg-theme-100 cal-font-medium  cal-text-theme-700 cal-ring-theme-200 focus:cal-outline-none focus:cal-ring-2 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:hover:cal-text-theme-300':
                dayHasTimeSlot(day) && !day.isPast && !isSelectedDay(day),
              'cal-cursor-default cal-text-theme-500 dark:cal-text-theme-300':
                (day.isPast && !day.isCurrentMonth) ||
                (!dayHasTimeSlot(day) && day.isCurrentMonth),
              'cal-bg-accent-base cal-font-semibold cal-text-white  dark:cal-bg-accent-base dark:cal-text-white':
                isSelectedDay(day),
              'cal-transition-color cal-bg-theme-100 cal-text-theme-700 cal-duration-100 hover:cal-bg-theme-200 hover:cal-text-accent-base hover:dark:cal-bg-theme-700 hover:dark:cal-text-accent-base':
                !isSelectedDay(day) && dayHasTimeSlot(day) && !day.isPast,
              'cal-pointer-events-none cal-text-theme-500 dark:cal-text-theme-300':
                day.isPast,
            }"
            class="cal-h-10 cal-w-10 cal-rounded-md cal-text-sm"
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
import { useCalendar, useConfig } from "@zaptime/core";
import { Day } from "@zaptime/core";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

import useCalendarViewState from "../../composables/useCalendarViewState";
import DaysGridLoadingSkeleton from "./DaysGridLoadingSkeleton.vue";

const { setCalendarView } = useCalendarViewState();

const { config } = useConfig();

const { dayHasTimeSlot, isSelectedDay, dayClicked, state, next } =
  useCalendar();

const dayClickedLocalProxy = (day: Day) => {
  dayClicked(day);
  setCalendarView("pickingTime");
};
</script>
