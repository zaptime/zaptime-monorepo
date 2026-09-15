<script setup lang="ts">
import { ref } from "vue";
import { ZaptimeCalendar, type ZaptimeConfig } from "@zaptime/vue3";
import "@zaptime/vue3/style.css";
const route = useRoute();
const config: ZaptimeConfig = {
  token: String(route.query.token ?? "fixture-token"),
  apiBaseUrl: String(route.query.api ?? "https://booking.example.test/"),
  locale: { preset: "en" },
  compact: "compact" in route.query,
  theme: { mode: "dark" in route.query ? "dark" : "light" },
};
const shown = ref(true);
</script>
<template>
  <main style="padding: 24px; max-width: 1200px; margin: auto">
    <h1>Zaptime Vue examples</h1>
    <nav><NuxtLink to="/headless">Custom calendar</NuxtLink> <NuxtLink to="/multiple-calendars">Independent calendars</NuxtLink></nav>
    <button @click="shown = !shown">{{ shown ? "Close calendar" : "Open calendar" }}</button>
    <div v-if="shown" data-testid="complete-calendar"><ZaptimeCalendar :config="config" /></div>
    <div v-if="'multiple' in route.query" data-testid="second-complete-calendar"><ZaptimeCalendar :config="config" /></div>
  </main>
</template>
