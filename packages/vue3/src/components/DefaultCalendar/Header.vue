<template>
  <div
    v-for="header in state.headers"
    :key="header"
    class="tracking-[-0.01em] cal-flex cal-justify-center cal-text-[13px] cal-font-medium cal-text-gray-900 dark:cal-text-theme-300"
  >
    {{ header }}
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useCalendar } from '@zaptime/core';
const { state } = useCalendar(inject('calendarId'));
</script>
