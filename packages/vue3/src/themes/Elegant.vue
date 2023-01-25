<!-- <template>
  <Calendar class="elegant-theme" style="min-height: 290px">
    <template v-slot:day="{ day, dayClicked, dayHasEvent }">
      <div class="cal-flex cal-items-center cal-justify-center">
        <button
          :class="{
            'cal-text-white cal-bg-black cal-cursor-pointer cal-font-bold cal-focus:ring cal-focus:ring-gray-700': dayHasEvent(
              day
            ),
          }"
          :disabled="!dayHasEvent(day)"
          class="cal-w-8 cal-h-8 cal-text-gray-800 cal-text-xs cal-font-light cal-capitalize cal-rounded-full"
          @click="dayClicked(day)"
        >
          {{ day.label }}
        </button>
      </div>
    </template>

    <template v-slot:header="{ monthName, currentYear, movePrev, moveNext }">
      <div class="cal-flex cal-justify-between cal-pt-2">
        <p class="cal-ml-6 cal-font-serif cal-text-2xl cal-capitalize">
          {{ monthName }} {{ currentYear }}
        </p>
        <div class="cal-mr-3 cal-space-x-1">
          <button @click="movePrev">
            <svg
              class="cal-w-4 cal-h-4 cal-text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <button @click="moveNext">
            <svg
              class="cal-w-4 cal-h-4 cal-text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <template v-slot:default="{ events, isSelected, selectEvent, locales }">
      <div class="cal-w-72">
        <div v-if="events.length > 0">
          <div class="cal-px-4 cal-pt-4">
            <p
              class="cal-font-serif cal-leading-4 cal-tracking-tighter cal-text-center cal-text-gray-900"
            >
              {{ getFormattedDay(events[0].start) }},
              {{ getFormattedDayInMonth(events[0].start) }}
            </p>
          </div>

          <div class="cal-h-56 cal-px-6 cal-mt-2 cal-overflow-y-scroll">
            <button
              @click="selectEvent(event)"
              class="cal-relative cal-flex cal-justify-center cal-w-full cal-py-1 cal-my-2 cal-font-normal cal-text-gray-900 cal-border cal-border-gray-400 cal-cursor-pointer focus:cal-ring-1 focus:cal-ring-gray-900 focus:cal-outline-none cal-group"
              :class="{ 'cal-bg-gray-900': isSelected(event) }"
              v-for="(event, i) in events"
              :key="i"
            >
              <p
                class="cal-text-sm cal-font-semibold"
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
        <div class="cal-flex cal-items-center cal-h-full" v-else>
          <p class="cal-ml-5 cal-mr-2 cal-font-serif">
            {{ locales.chooseDate }}
          </p>

          <div
            class="cal-flex cal-items-center cal-justify-center cal-w-8 cal-h-8 cal-bg-black cal-rounded-sm"
          >
            <svg
              class="cal-w-6 cal-h-6 cal-text-white"
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
.elegant-theme {
  --c-50: #f9fafb;
  --c-100: #f3f4f6;
  --c-200: #e5e7eb;
  --c-300: #d1d5db;
  --c-400: #9ca3af;
  --c-500: #6b7280;
  --c-600: #4b5563;
  --c-700: #374151;
  --c-800: #1f2937;
  --c-900: #111827;
}
</style> -->
