<template>
    <div class="cal-flex cal-justify-center dark:cal-text-theme-300 cal-font-medium cal-text-theme-700 cal-text-[11px]"
        v-for="header in state.headers" :key="header">
        {{ header }}
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useCalendar } from "@zaptime/core";
const { state } = useCalendar(inject('calendarId'));
</script>
