<template>
  <div
    class="cal-mx-auto cal-h-full cal-min-h-[524px] cal-bg-white cal-px-[20px] dark:cal-bg-theme-900 sm:cal-mx-0"
    :class="[
      config.compact
        ? 'cal-w-[330px] cal-rounded-xl sm:cal-w-[400px]'
        : 'cal-w-[330px] cal-rounded-r-xl sm:cal-w-[440px]',
      config.profileImage ? 'cal-pt-4' : 'cal-pt-10',
    ]"
  >
    <PrimaryButton
      v-if="config.compact === true"
      class="cal-mb-8 cal-mt-5"
      @click="goPickingDates"
    >
      {{ config.locale?.confirmationForm?.buttons?.goBack }}
    </PrimaryButton>
    <div v-if="!state.loading" class="cal-h-full">
      <Transition
        enter-active-class="cal-duration-100 cal-transition-all cal-ease-out"
        enter-from-class="cal-opacity-0 cal-translate-y-[4px]"
        enter-to-class="cal-opacity-100 cal-translate-x-0"
        leave-active-class="cal-duration-100 cal-ease-out"
        leave-from-class="cal-opacity-100"
        leave-to-class="cal-opacity-0 cal-translate-x-[1px]"
        mode="out-in"
      >
        <div
          v-if="state.timeSlots && state.timeSlots.length > 0 && !state.loading"
          class="cal-flex cal-h-full cal-flex-col cal-justify-between"
        >
          <div>
            <div
              :class="[
                (config.locale?.texts?.introduction || config.profileImage) &&
                !reservation &&
                !config.compact
                  ? 'cal-pt-[54px]'
                  : 'cal-pt-0',
              ]"
            >
              <p
                class="cal-text-2xl cal-font-semibold cal-tracking-tighter cal-text-theme-600 dark:cal-text-theme-300"
              >
                {{ getFormattedDayInMonth(state.timeSlots[0].start) }}
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

            <div
              class="cal-mt-2 cal-overflow-y-auto cal-px-1"
              :class="[
                config.locale?.hideTimePreferences
                  ? 'cal-h-[375px]'
                  : 'cal-h-[345px]',
              ]"
            >
              <div
                v-for="(timeSlot, i) in state.timeSlots"
                :key="i"
                class="w-full"
              >
                <ConfirmationButton
                  :time-slot="timeSlot"
                  @select-time-slot="select(timeSlot)"
                ></ConfirmationButton>
              </div>
            </div>
          </div>

          <div
            v-if="!config.locale?.hideTimePreferences"
            class="cal-mt-5 cal-flex cal-items-center cal-space-x-2 cal-pb-4 sm:cal-mt-0"
          >
            <TimeZonePicker class="cal-px-1"></TimeZonePicker>
            <Switch v-model="hourCycleSwitchValue" class="cal-py-3">
              <template #before> am/pm </template>
              <template #after> 24h </template>
            </Switch>
          </div>
        </div>

        <div v-else class="cal-w-full">
          <div
            v-if="!state.monthHasTimeSlots"
            class="cal-flex cal-h-full cal-flex-col cal-items-center cal-justify-center"
          >
            <div
              class="cal-mt-48 cal-flex cal-h-full cal-items-center cal-justify-center"
            >
              <div
                class="dark:cal-text-theme cal-flex cal-flex-col cal-h-40 cal-items-center cal-justify-center cal-rounded-2xl cal-px-5"
              >
                <p
                  v-if="
                    config.locale && config.locale.texts?.noTimeSlotAvailable
                  "
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
          </div>
          <div
            v-else
            class="cal-flex cal-flex-col cal-items-center cal-justify-center"
          >
            <div
              class="cal-mt-48 cal-flex cal-h-full cal-items-center cal-justify-center"
            >
              <div
                class="cal-flex cal-w-40 cal-flex-col cal-items-center cal-justify-center cal-rounded-2xl cal-px-7 cal-py-5 cal-text-theme-700 dark:cal-text-theme-200"
              >
                <svg
                  width="54"
                  height="60"
                  viewBox="0 0 18 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.5 9.58332V7.33332C16.5 5.93319 16.5 5.23313 16.2275 4.69835C15.9878 4.22794 15.6054 3.84549 15.135 3.60581C14.6002 3.33332 13.9001 3.33332 12.5 3.33332H5.5C4.09987 3.33332 3.3998 3.33332 2.86502 3.60581C2.39462 3.84549 2.01217 4.22794 1.77248 4.69835C1.5 5.23313 1.5 5.93319 1.5 7.33332V14.3333C1.5 15.7335 1.5 16.4335 1.77248 16.9683C2.01217 17.4387 2.39462 17.8212 2.86502 18.0608C3.3998 18.3333 4.09987 18.3333 5.5 18.3333H9.41667M16.5 8.33332H1.5M12.3333 1.66666V4.99999M5.66667 1.66666V4.99999M14 17.5V12.5M11.5 15H16.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <p
                  v-if="config.locale && config.locale.texts?.chooseDate"
                  class="cal-mt-2 cal-w-40 cal-text-center cal-text-theme-900 dark:cal-text-theme-200"
                  v-html="config.locale.texts?.chooseDate"
                ></p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useCalendar,
  useConfig,
  useHourCycle,
  useDateFormatters,
  useReservationReschedule,
} from "@zaptime/core";
import useCalendarViewState from "../../composables/useCalendarViewState";
import PrimaryButton from "../atomic/PrimaryButton.vue";
import { inject, computed } from "vue";
import type { TimeSlot } from "@zaptime/core";
import ConfirmationButton from "./TimeConfirmationButton.vue";
import TimeZonePicker from "../atomic/TimeZonePicker.vue";
import Switch from "../atomic/Switch.vue";
import { getAnalytics } from "../../analytics";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

const { hourCycle } = useHourCycle();
const { setView, setCalendarView } = useCalendarViewState(inject("calendarId"));
const { selectTimeSlot, state, next } = useCalendar(inject("calendarId"));
const { config } = useConfig(inject("calendarId"));
const { getFormattedDayInMonth } = useDateFormatters();
const { reservation } = useReservationReschedule(inject("calendarId"));

const hourCycleSwitchValue = computed({
  get() {
    return hourCycle.value === "h23";
  },
  set() {
    if (hourCycle.value === "h11") {
      hourCycle.value = "h23";
    } else {
      hourCycle.value = "h11";
    }
  },
});

const select = (timeSlot: TimeSlot) => {
  selectTimeSlot(timeSlot);

  if (config.value.externalBooking !== true) {
    getAnalytics()?.track("zaptime:time_slot_selected", {
      timeSlot: timeSlot.start,
    });

    setView("form");
  }
};

const goPickingDates = () => {
  setView("calendar");
  setCalendarView("pickingDate");
};
</script>
