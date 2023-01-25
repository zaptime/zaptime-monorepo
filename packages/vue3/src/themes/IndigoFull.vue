<!-- <template>
  <Calendar
    style="min-height: 290px"
    bg-class="cal-bg-theme-700 cal-rounded-l-md"
    class="playful-theme"
  >
    <template v-slot:headers="{ dayHeaders }">
      <div
        class="cal-flex cal-justify-center cal-text-theme-100"
        v-for="(header, i) in dayHeaders"
        :key="i"
      >
        {{ header }}
      </div>
    </template>

    <template v-slot:header="{ monthName, currentYear, movePrev, moveNext }">
      <div class="cal-flex cal-justify-between cal-pt-2">
        <p class="cal-ml-6 cal-font-semibold cal-capitalize cal-text-theme-50">
          {{ monthName }} {{ currentYear }}
        </p>
        <div class="cal-mr-3 cal-space-x-1">
          <button class="focus:cal-outline-none" @click="movePrev">
            <svg
              class="cal-w-6 cal-h-6 cal-text-theme-200 focus:cal-ring-2 cal-ring-theme-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <button class="focus:cal-outline-none" @click="moveNext">
            <svg
              class="cal-w-6 cal-h-6 cal-text-theme-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <template v-slot:day="{ day, dayClicked, dayHasEvent }">
      <div class="cal-relative cal-flex cal-items-center cal-justify-center">
        <button
          :class="{
            'cal-text-pink-50 cal-bg-gradient-to-l cal-font-semibold cal-from-pink-500 cal-to-pink-600 focus:cal-ring-2 cal-ring-pink-600': dayHasEvent(
              day
            ),
            'cal-text-theme-400': day.isPast && !day.isCurrentMonth,
            'cal-text-theme-200': !day.isPast || day.isCurrentMonth,
          }"
          class="cal-w-8 cal-h-8 cal-rounded-full cal-focus:ring-2 cal-ring-theme-200 cal-focus:outline-none"
          @click="dayClicked(day)"
        >
          {{ day.label }}
        </button>
        <div
          v-if="day.isToday"
          class="cal-absolute cal-bottom-0.5 cal-left-3.5"
        >
          <div class="cal-w-1 cal-h-1 cal-bg-pink-500 cal-rounded-full"></div>
        </div>
      </div>
    </template>

    <template v-slot:default="{ events, isSelected, selectEvent, locales }">
      <div class="cal-w-64 cal-rounded-r cal-bg-theme-800">
        <div v-if="events.length > 0">
          <div
            class="cal-px-4 cal-py-3 cal-pt-4 cal-bg-theme-900 cal-rounded-r-md"
          >
            <p
              class="cal-text-sm cal-font-semibold cal-leading-4 cal-tracking-tighter cal-text-center cal-text-theme-50"
            >
              {{ getFormattedDay(events[0].start) }},
              {{ getFormattedDayInMonth(events[0].start) }}
            </p>
          </div>

          <div class="cal-h-48 cal-px-6 cal-mt-2 cal-overflow-y-scroll">
            <button
              @click="selectEvent(event)"
              class="cal-relative cal-flex cal-justify-center cal-w-full cal-py-1 cal-my-2.5 cal-bg-white cal-cursor-pointer focus:cal-ring-2 focus:cal-ring-pink-600 focus:cal-ring-opacity-50 focus:cal-outline-none cal-rounded-xl"
              :class="{
                'cal-text-white cal-bg-gradient-to-r cal-from-pink-500 cal-to-pink-600': isSelected(
                  event
                ),
              }"
              v-for="(event, i) in events"
              :key="i"
            >
              <p
                class="cal-text-sm"
                :class="{ 'cal-text-white': isSelected(event) }"
              >
                {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
              </p>
              <svg
                v-if="isSelected(event)"
                class="cal-absolute cal-w-5 cal-h-5 cal-text-white cal-top-1 cal-right-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="cal-h-full" v-else>
          <div class="cal-px-4 cal-py-3 cal-pt-4 cal-bg-theme-900">
            <p
              class="cal-text-sm cal-font-semibold cal-leading-4 cal-text-center cal-text-theme-50"
            >
              {{ locales.chooseDate }}
            </p>
          </div>

          <div class="cal-flex cal-items-center cal-justify-center cal-pt-12">
            <div
              class="cal-flex cal-items-center cal-justify-center cal-w-32 cal-h-32 cal-bg-theme-700 cal-rounded-2xl"
            >
              <svg
                class="cal-w-20 cal-h-20 cal-text-theme-200"
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
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Calendar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";

import Calendar from "../components/Calendar.vue";

export default defineComponent({
  components: {
    Calendar,
  },

  methods: {
    formatTime(date: string) {
      return format(parseISO(date), "kk:mm", { locale: cs });
    },

    //e.g. Thursday
    getFormattedDay(date: string) {
      return format(parseISO(date), "EEEE", { locale: cs });
    },

    //e. g. November 21
    getFormattedDayInMonth(date: string) {
      return format(parseISO(date), "d. MMMM", { locale: cs });
    },
  },
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");

.playful-theme {
  font-family: "Poppins", sans-serif !important;

  --c-50: #eef2ff;
  --c-100: #e0e7ff;
  --c-200: #c7d2fe;
  --c-300: #a5b4fc;
  --c-400: #818cf8;
  --c-500: #6366f1;
  --c-600: #4f46e5;
  --c-700: #4338ca;
  --c-800: #3730a3;
  --c-900: #312e81;
}
</style> -->
