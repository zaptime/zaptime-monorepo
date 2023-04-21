<template>
  <div
    v-for="header in state.headers"
    :key="header"
    class="cal-flex cal-justify-center cal-text-[11px] cal-font-medium cal-text-theme-700 dark:cal-text-theme-300"
  >
    {{ header }}
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useCalendar } from '@zaptime/core';
const { state } = useCalendar(inject('calendarId'));
</script>
