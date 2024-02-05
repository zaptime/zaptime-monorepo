<script setup lang="ts">
import type { ZaptimeConfig, TimeSlot } from '@zaptime/core';
import EventType from './components/EventType.vue';
import EventTypeGroup from './components/EventTypesGroup.vue';
import type { EventTypeGroup as IEventTypeGroup } from './components/EventTypesGroup.vue';

const type = window.xprops.type ? window.xprops.type : 'single';
const config = window.xprops.config;

const onTimeSlotChanged = (timeSlot: TimeSlot) => {
  if (window.xprops.onTimeSlotChanged) {
    window.xprops.onTimeSlotChanged(timeSlot);
  }
};

function isSingleConfig(_config: ZaptimeConfig | IEventTypeGroup, type: 'single' | 'multiple'): _config is ZaptimeConfig {
  return type === 'single';
}
</script>

<template>
  <div
    id="iframe-app"
    :class="[config.theme?.mode === 'dark' ? 'dark' : '']"
  >
    <div v-if="isSingleConfig(config, type)">
      <EventType
        :config="config"
        @time-slot-changed="onTimeSlotChanged"
      >
      </EventType>
    </div>

    <div v-else>
      <EventTypeGroup :config="config" />
    </div>
  </div>
</template>

<style>
#iframe-app {
  --c-gray-25: v-bind(config?.theme?.colors?.[ '25'] || '#FCFCFD');
  --c-gray-50: v-bind(config?.theme?.colors?.[ '50'] || '#F9FAFB');
  --c-gray-100: v-bind(config?.theme?.colors?.[ '100'] || '#F3F4F6');
  --c-gray-200: v-bind(config?.theme?.colors?.[ '200'] || '#E5E7EB');
  --c-gray-300: v-bind(config?.theme?.colors?.[ '300'] || '#D2D6DB');
  --c-gray-400: v-bind(config?.theme?.colors?.[ '400'] || '#9DA4AE');
  --c-gray-500: v-bind(config?.theme?.colors?.[ '500'] || '#6C737F');
  --c-gray-600: v-bind(config?.theme?.colors?.[ '600'] || '#4D5761');
  --c-gray-700: v-bind(config?.theme?.colors?.[ '700'] || '#384250');
  --c-gray-800: v-bind(config?.theme?.colors?.[ '800'] || '#1F2A37');
  --c-gray-900: v-bind(config?.theme?.colors?.[ '900'] || '#111927');

  --c-accent--1: v-bind(config?.theme?.colors?.[ 'accent--1'] || '#2ED3B7');
  --c-accent-0: v-bind(config?.theme?.colors?.[ 'accent-0'] || '#15B79E');
  --c-accent-1: v-bind(config?.theme?.colors?.[ 'accent-1'] || '#0E9384');

  --radius: v-bind(config.theme?.borderRadius || '6px');
}
</style>
