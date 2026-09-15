<template>
  <div class="zaptime-calendar cal-antialiased">
    <div class="" :class="[config.theme?.mode === 'light' ? '' : 'cal-dark']">
      <template v-if="isEnabled && loaded">
        <Calendar :classes="$attrs['class'] ? String($attrs['class']) : ''"></Calendar>
      </template>
      <div v-if="!initLoaded && !snapshot.error" class="cal-flex cal-min-h-[360px] cal-w-full cal-items-center cal-justify-center">
        <svg class="-cal-ml-1 cal-mr-3 cal-h-10 cal-w-10 cal-animate-spin cal-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="cal-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="cal-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-if="snapshot.error && !loaded" role="alert" class="cal-p-6 cal-text-red-500">{{ snapshot.error.message }}</div>
      <div v-if="!isEnabled && initLoaded">
        <CalendarDisabled />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, watch, computed, onMounted, onUnmounted, shallowRef } from "vue";
import { useCalendarInstance, useConfig } from "@zaptime/vue-headless";
import { attachBrowserEffects } from "@zaptime/browser";
import type { StripePaymentDriver } from "@zaptime/browser";
import { CalendarError, type ZaptimeConfig, type TimeSlot, type ReservationResponse, type RecoveryContext } from "@zaptime/core";
import Calendar from "./components/Calendar.vue";
import CalendarDisabled from "./components/CalendarDisabled.vue";
import useCompactSwitcher from "./composables/useCompactSwitcher";
import useAlphaColors from "./composables/useAlphaColors";
import { uiCalendarKey } from "./composables/useUiCalendar";
const props = defineProps<{ config: ZaptimeConfig; calendarId?: string }>();
const emit = defineEmits<{
  (e: "booking-confirmed", reservation: ReservationResponse): void;
  (e: "time-slot-changed", timeSlot?: TimeSlot): void;
  (e: "calendar-loaded"): void;
  (e: "error", error: CalendarError): void;
  (e: "recovery-required", context: RecoveryContext): void;
}>();
let payment: StripePaymentDriver | undefined;
const calendar = useCalendarInstance({
  config: props.config,
  calendarId: props.calendarId,
  payment: {
    confirm(input) {
      return payment ? payment.confirm(input) : Promise.resolve({ status: "failed", error: new CalendarError("payment-failed", "Payment fields are unavailable.") });
    },
  },
});
const snapshot = shallowRef(calendar.getSnapshot());
const unsubscribe = calendar.subscribe(() => {
  snapshot.value = calendar.getSnapshot();
});
provide(uiCalendarKey, {
  calendar,
  snapshot,
  setPayment(driver) {
    payment = driver;
  },
});
provide("calendarId", props.calendarId);
const unlisten = calendar.onEvent((event) => {
  switch (event.type) {
    case "calendar-loaded":
      emit(event.type);
      break;
    case "booking-confirmed":
      emit(event.type, event.payload);
      break;
    case "time-slot-changed":
      emit(event.type, event.payload);
      break;
    case "error":
      emit(event.type, event.payload);
      break;
    case "recovery-required":
      emit(event.type, event.payload);
      break;
  }
});
let detachEffects = () => {};
onMounted(() => {
  detachEffects = attachBrowserEffects(calendar);
});
onUnmounted(() => {
  unsubscribe();
  unlisten();
  detachEffects();
});
const { config, setConfig } = useConfig(calendar);
const { color, color2 } = useAlphaColors(calendar);
provide("color", color);
provide("color2", color2);
useCompactSwitcher(calendar);
watch(
  () => props.config,
  (value) => setConfig(value),
  { deep: true },
);
const loaded = computed(() => snapshot.value.calendar.initLoaded);
const initLoaded = computed(() => snapshot.value.phase === "disabled" || loaded.value);
const isEnabled = computed(() => snapshot.value.phase !== "disabled");
const borderRadius = computed(() => (config.value.theme?.borderRadius === "full" ? "24px" : config.value.theme?.borderRadius));
</script>

<style>
.zaptime-calendar {
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
