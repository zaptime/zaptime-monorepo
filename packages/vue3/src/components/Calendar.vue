<template>
  <div class="cal-h-full cal-min-h-[360px]">
    <div class="cal-h-full" v-if="view === 'calendar'">
      <div class="cal-h-full cal-w-[330px] sm:cal-w-[400px] cal-bg-white"
        :class="[config.compact ? 'cal-rounded-xl' : '']" v-if="config.compact === true">
        <div :key="calendarView" v-if="config.compact === undefined || calendarView === 'pickingDate'"
          class="cal-w-full cal-h-full cal-rounded-l-xl cal-px-3 sm:cal-px-[48px] cal-bg-theme-50"
          :class="[config.compact ? 'cal-rounded-r-xl' : '']" :style="{ backgroundColor: color }">
          <Navbar />

          <div class="cal-grid cal-grid-cols-7 cal-mt-1 cal-mb-3">
            <Header />
          </div>

          <div class="cal-mb-14">
            <DaysGrid />
          </div>

          <div class="cal-flex cal-items-center cal-justify-center">
            <Loader v-if="state.loading" />
          </div>
        </div>
        <div v-if="config.compact === undefined || calendarView === 'pickingTime'"
          class="cal-bg-white cal-rounded-r-xl cal-h-full" :class="[config.compact ? 'cal-rounded-l-xl' : '']"
          :style="{ backgroundColor: color2 }">
          <TimeSelection v-if="!state.loading" />
        </div>
      </div>

      <div class="cal-flex cal-h-full cal-w-[841px] cal-bg-white"
        :class="[config.compact ? 'cal-rounded-l-xl' : 'cal-rounded-xl']" v-else>
        <div :key="calendarView" class="cal-w-[330px] sm:cal-w-[400px]  cal-px-[48px]"
          :style="{ backgroundColor: color }">
          <Navbar />

          <div class="cal-grid cal-grid-cols-7 cal-mt-1 cal-mb-3">
            <Header />
          </div>

          <div class="cal-mb-14 cal-w-full">
            <DaysGrid />
          </div>

          <div class="cal-flex cal-items-center cal-justify-center">
            <Loader v-if="state.loading" />
          </div>
        </div>
        <div class=" cal-border-l cal-border-gray-200" :style="{ backgroundColor: color2 }">
          <TimeSelection v-if="!state.loading" />
        </div>
      </div>
    </div>

    <ConfirmForm v-if="view === 'form'" @goBack="() => setView('calendar')"
      @booking-confirmed="() => setView('success')" />

    <SuccessMessage v-if="view === 'success'"></SuccessMessage>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";

import ConfirmForm from "./ConfirmForm.vue";
import Navbar from "./DefaultCalendar/Navbar.vue";
import Header from "./DefaultCalendar/Header.vue";
import Loader from "./DefaultCalendar/Loader.vue";
import TimeSelection from "./DefaultCalendar/TimeSelection.vue";
import DaysGrid from "./DefaultCalendar/DaysGrid.vue";
import SuccessMessage from "./DefaultCalendar/SuccessMessage.vue";

import useCalendarViewState from "../composables/useCalendarViewState";

import { useCalendar, useConfig } from "@zaptime/core";

defineProps({
  bgClass: {
    type: String,
    default: null,
  },
  value: {
    type: Date,
  },
});

const { view, calendarView, setView } = useCalendarViewState(
  inject("calendarId")
);

const { state } = useCalendar(inject("calendarId"));
const { config } = useConfig(inject("calendarId"));

const color = inject<string>("color");
const color2 = inject<string>("color2");
</script>
