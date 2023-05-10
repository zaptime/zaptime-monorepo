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
import { useConfig, useCalendar, useSelectedEvent } from '@zaptime/core';
import defaultConfig from './defaultConfig';
import useCompactSwticher from './composables/useCompactSwitcher';
import useAlphaColors from './composables/useAlphaColors';

import IZapTimeConfig from './types/IZapTimeConfig';
import mergeObjects from './utils/mergeObjects';

const props = withDefaults(
  defineProps<{
    config: IZapTimeConfig;
    calendarId?: string;
  }>(),
  {
    config: () => defaultConfig,
    calendarId: undefined,
  },
);

const emit = defineEmits(['event-changed', 'booking-confirmed']);

provide('calendarId', props.calendarId);

const { setConfig, config } = useConfig(props.calendarId);

const { selectedEvent } = useSelectedEvent(props.calendarId);

setConfig(mergeObjects(defaultConfig, props.config));

const { color, color2 } = useAlphaColors(props.calendarId);
provide('color', color);
provide('color2', color2);

// Automatically switches to compact on mobile
useCompactSwticher(props.calendarId);

const { init: initCalendar } = useCalendar(props.calendarId);

watch(selectedEvent, (newV) => {
  emit('event-changed', newV);
});

// checks for external props change and sets config to core
watch(
  () => props.config,
  () => {
    setConfig({ ...defaultConfig, ...props.config });
  },
);

const borderRadius = computed(() => {
  if (borderRadius.value !== 'full') {
    // @ts-expect-error TODO: add border radius to config
    return config?.value.theme?.borderRadius;
  }

  return '24px';
});

onMounted(async () => {
  await initCalendar();
});
</script>

<style>
#zaptime-calendar {
  --c-zaptime-25: v-bind(config?.theme?.colors?.[ '25'] || '#FCFCFD');
  --c-zaptime-50: v-bind(config?.theme?.colors?.[ '50'] || '#F9FAFB');
  --c-zaptime-100: v-bind(config?.theme?.colors?.[ '100'] || '#F3F4F6');
  --c-zaptime-200: v-bind(config?.theme?.colors?.[ '200'] || '#E5E7EB');
  --c-zaptime-300: v-bind(config?.theme?.colors?.[ '300'] || '#D2D6DB');
  --c-zaptime-400: v-bind(config?.theme?.colors?.[ '400'] || '#9DA4AE');
  --c-zaptime-500: v-bind(config?.theme?.colors?.[ '500'] || '#6C737F');
  --c-zaptime-600: v-bind(config?.theme?.colors?.[ '600'] || '#4D5761');
  --c-zaptime-700: v-bind(config?.theme?.colors?.[ '700'] || '#384250');
  --c-zaptime-800: v-bind(config?.theme?.colors?.[ '800'] || '#1F2A37');
  --c-zaptime-900: v-bind(config?.theme?.colors?.[ '900'] || '#111927');

  --c-zaptime-accent--1: v-bind(config?.theme?.colors?.[ 'accent--1'] || '#2ED3B7');
  --c-zaptime-accent-0: v-bind(config?.theme?.colors?.[ 'accent-0'] || '#15B79E');
  --c-zaptime-accent-1: v-bind(config?.theme?.colors?.[ 'accent-1'] || '#0E9384');

  --radius-zaptime: v-bind(borderRadius);
}
</style>
