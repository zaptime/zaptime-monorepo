<template>
  <div id="zaptime-calendar" class="cal-antialiased">
    <div class="" :class="[config.theme?.mode === 'light' ? '' : 'cal-dark']">
      <template v-if="isEnabled">
        <Calendar v-show="loaded" :classes="$attrs['class'] ? String($attrs['class']) : ''" @booking-confirmed="(reservationConfirmedData) => emit('booking-confirmed', reservationConfirmedData)"></Calendar>
      </template>
      <div v-if="!loaded" class="cal-flex cal-min-h-[360px] cal-w-[820px] cal-items-center cal-justify-center">
        <svg class="-cal-ml-1 cal-mr-3 cal-h-10 cal-w-10 cal-animate-spin cal-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="cal-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="cal-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-if="!isEnabled && initLoaded">
        <CalendarDisabled />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, watch, computed, onMounted, ref } from "vue";

import Calendar from "./components/Calendar.vue";
import { useConfig, ZaptimeConfig, useSelectedTimeSlot } from "@zaptime/core";
import useCompactSwticher from "./composables/useCompactSwitcher";
import useAlphaColors from "./composables/useAlphaColors";
import { useInitialization } from "./composables/useInitialization";
import CalendarDisabled from "./components/CalendarDisabled.vue";
import { mergeConfigs } from "./utils/mergeConfigs";
import type { TimeSlot, ReservationResponse } from "@zaptime/core";

const loaded = ref(false);

const props = withDefaults(
  defineProps<{
    config: ZaptimeConfig;
    calendarId?: string;
  }>(),
  {
    config: undefined,
    calendarId: undefined,
  }
);

const emit = defineEmits<{
  (e: "booking-confirmed", reservation: ReservationResponse): void;
  (e: "time-slot-changed", timeSlot?: TimeSlot): void;
  (e: "calendar-loaded"): void;
}>();

provide("calendarId", props.calendarId);

const { init, initLoaded, isEnabled } = useInitialization(props.config, props.calendarId);

const { setConfig, config } = useConfig(props.calendarId);

const { selectedTimeSlot } = useSelectedTimeSlot(props.calendarId);

const { color, color2 } = useAlphaColors(props.calendarId);
provide("color", color);
provide("color2", color2);

// Automatically switches to compact on mobile
useCompactSwticher(props.calendarId);

watch(selectedTimeSlot, (newV) => {
  emit("time-slot-changed", newV);
});

// checks for external props change and sets config to core
watch(
  () => props.config,
  (newValue) => {
    setConfig(mergeConfigs(config.value, newValue));
  }
);

const borderRadius = computed(() => {
  if (config?.value.theme?.borderRadius !== "full") {
    return config?.value.theme?.borderRadius;
  }

  return "24px";
});

onMounted(async () => {
  await init();
  loaded.value = true;
  emit("calendar-loaded");
});
</script>

<style>
#zaptime-calendar {
  --c-zaptime-25: v-bind(config?.theme?.colors?.[ "25"] || "#f8fafc");
  --c-zaptime-50: v-bind(config?.theme?.colors?.[ "50"] || "#f8fafc");
  --c-zaptime-100: v-bind(config?.theme?.colors?.[ "100"] || "#f1f5f9");
  --c-zaptime-200: v-bind(config?.theme?.colors?.[ "200"] || "#e2e8f0");
  --c-zaptime-300: v-bind(config?.theme?.colors?.[ "300"] || "#cbd5e1");
  --c-zaptime-400: v-bind(config?.theme?.colors?.[ "400"] || "#64748b");
  --c-zaptime-500: v-bind(config?.theme?.colors?.[ "500"] || "#475569");
  --c-zaptime-600: v-bind(config?.theme?.colors?.[ "600"] || "#334155");
  --c-zaptime-700: v-bind(config?.theme?.colors?.[ "700"] || "#384250");
  --c-zaptime-800: v-bind(config?.theme?.colors?.[ "800"] || "#1e293b");
  --c-zaptime-900: v-bind(config?.theme?.colors?.[ "900"] || "#020617");

  --c-zaptime-accent-light: v-bind(config?.theme?.colors?.accentLight || "#2ED3B7");
  --c-zaptime-accent-base: v-bind(config?.theme?.colors?.accentBase || "#15B79E");
  --c-zaptime-accent-dark: v-bind(config?.theme?.colors?.accentDark || "#0E9384");

  --radius-zaptime: v-bind(borderRadius);
}
</style>
