<template>
  <div
    id="zaptime-calendar"
    class="cal-antialiased"
  >
    <div :class="[config.theme?.mode === 'light' ? '' : 'cal-dark']">
      <Calendar @booking-confirmed="emit('booking-confirmed')"></Calendar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, watch, computed, onMounted } from 'vue';

import Calendar from './components/Calendar.vue';
import { useConfig, useCalendar, ZaptimeConfig, useSelectedTimeSlot } from '@zaptime/core';
import useCompactSwticher from './composables/useCompactSwitcher';
import useAlphaColors from './composables/useAlphaColors';
import { getAnalytics, buildConfig } from './analytics';

const props = withDefaults(
  defineProps<{
    config: ZaptimeConfig;
    calendarId?: string;
  }>(),
  {
    config: undefined,
    calendarId: undefined,
  },
);

const emit = defineEmits(['time-slot-changed', 'booking-confirmed']);

provide('calendarId', props.calendarId);

const { setConfig, config } = useConfig(props.calendarId);

const { selectedTimeSlot } = useSelectedTimeSlot(props.calendarId);

setConfig(props.config);

const { color, color2 } = useAlphaColors(props.calendarId);
provide('color', color);
provide('color2', color2);

// Automatically switches to compact on mobile
useCompactSwticher(props.calendarId);

const { init: initCalendar } = useCalendar(props.calendarId);

watch(selectedTimeSlot, (newV) => {
  emit('time-slot-changed', newV);
});

// checks for external props change and sets config to core
watch(
  () => props.config,
  () => {
    setConfig(props.config);
  },
);

const borderRadius = computed(() => {
  if (config?.value.theme?.borderRadius !== 'full') {
    return config?.value.theme?.borderRadius;
  }

  return '24px';
});

onMounted(async () => {
  // perepared entry for backend
  const analytics = getAnalytics(buildConfig([]));

  if (props.config === undefined || props.config.token === undefined) {
    analytics?.track('calendar-error-invalid-token');

    console.error(
      "Zaptime error: Token is required, please enter your acquired token into the configuration. See more in the documentation: https://docs.zaptime.app/guide/vue-installation.html. If you don't have a token, you can acquire one at https://zaptime.app.",
    );
  } else {
    analytics?.track('calendar-opened');

    await initCalendar();
  }
});
</script>

<style>
#zaptime-calendar {
  --c-zaptime-25: v-bind(config?.theme?.colors?.[ '25'] || '#f8fafc');
  --c-zaptime-50: v-bind(config?.theme?.colors?.[ '50'] || '#f8fafc');
  --c-zaptime-100: v-bind(config?.theme?.colors?.[ '100'] || '#f1f5f9');
  --c-zaptime-200: v-bind(config?.theme?.colors?.[ '200'] || '#e2e8f0');
  --c-zaptime-300: v-bind(config?.theme?.colors?.[ '300'] || '#cbd5e1');
  --c-zaptime-400: v-bind(config?.theme?.colors?.[ '400'] || '#64748b');
  --c-zaptime-500: v-bind(config?.theme?.colors?.[ '500'] || '#475569');
  --c-zaptime-600: v-bind(config?.theme?.colors?.[ '600'] || '#334155');
  --c-zaptime-700: v-bind(config?.theme?.colors?.[ '700'] || '#384250');
  --c-zaptime-800: v-bind(config?.theme?.colors?.[ '800'] || '#1e293b');
  --c-zaptime-900: v-bind(config?.theme?.colors?.[ '900'] || '#020617');

  --c-zaptime-accent--1: v-bind(config?.theme?.colors?.[ 'accent--1'] || '#2ED3B7');
  --c-zaptime-accent-0: v-bind(config?.theme?.colors?.[ 'accent-0'] || '#15B79E');
  --c-zaptime-accent-1: v-bind(config?.theme?.colors?.[ 'accent-1'] || '#0E9384');

  --radius-zaptime: v-bind(borderRadius);
}
</style>
