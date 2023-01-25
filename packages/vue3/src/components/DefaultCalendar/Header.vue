<template>
  <div
    class="cal-flex cal-justify-center dark:cal-text-theme-300 cal-text-[13px] cal-font-medium cal-text-gray-900 tracking-[-0.01em]"
    v-for="header in state.headers"
    :key="header"
  >
    {{ header }}
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { useCalendar } from "@zaptime/core";
const { state } = useCalendar(inject("calendarId"));
</script>
