<template>
  <div
    id="zaptime-calendar"
    class="cal-antialiased"
  >
    <div :class="[config.theme?.mode === 'light' ? '' : 'cal-dark']">
      <Calendar></Calendar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, watch, computed } from 'vue';

import Calendar from './components/Calendar.vue';
import { useConfig, useSelectedEvent } from '@zaptime/core';
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

const emit = defineEmits(['event-changed']);

provide('calendarId', props.calendarId);

const { setConfig, config } = useConfig(props.calendarId);

const { selectedEvent } = useSelectedEvent(props.calendarId);

setConfig(mergeObjects(defaultConfig, props.config));

const { color, color2 } = useAlphaColors(props.calendarId);
provide('color', color);
provide('color2', color2);

// Automatically switches to compact on mobile
useCompactSwticher(props.calendarId);

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
</script>

<style>
#zaptime-calendar {
  --c-zaptime-25: v-bind(config?.theme?.colors?.[ '25']);
  --c-zaptime-50: v-bind(config?.theme?.colors?.[ '50']);
  --c-zaptime-100: v-bind(config?.theme?.colors?.[ '100']);
  --c-zaptime-200: v-bind(config?.theme?.colors?.[ '200']);
  --c-zaptime-300: v-bind(config?.theme?.colors?.[ '300']);
  --c-zaptime-400: v-bind(config?.theme?.colors?.[ '400']);
  --c-zaptime-500: v-bind(config?.theme?.colors?.[ '500']);
  --c-zaptime-600: v-bind(config?.theme?.colors?.[ '600']);
  --c-zaptime-700: v-bind(config?.theme?.colors?.[ '700']);
  --c-zaptime-800: v-bind(config?.theme?.colors?.[ '800']);
  --c-zaptime-900: v-bind(config?.theme?.colors?.[ '900']);

  --c-zaptime-accent--1: v-bind(config?.theme?.colors?.[ 'accent--1']);
  --c-zaptime-accent-0: v-bind(config?.theme?.colors?.[ 'accent-0']);
  --c-zaptime-accent-1: v-bind(config?.theme?.colors?.[ 'accent-1']);

  --radius-zaptime: v-bind(borderRadius);
}
</style>
