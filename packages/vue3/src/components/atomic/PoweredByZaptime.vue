<template>
  <div v-if="!isSubscribed" class="cal-flex cal-w-full cal-items-center cal-justify-center cal-gap-1 cal-pb-6 cal-text-xs cal-font-medium cal-tracking-tight cal-text-theme-800 dark:cal-text-theme-100">
    <a :href="linkUrl" target="_blank" class="cal-flex cal-items-center cal-gap-1">
      {{ text }}
      <ZapLogo />
    </a>
  </div>
</template>

<script setup lang="ts">
import { useIsSubscribed } from "../../composables/useIsSubscribed";
import { useConfig } from "@zaptime/core";
import ZapLogo from "./ZapLogo.vue";
import { computed } from "vue";

const { isSubscribed } = useIsSubscribed();
const { config } = useConfig();

const linkUrl = computed(() => {
  return config.value.locale?.preset === "cs" ? "https://zaptime.cz" : "https://zaptime.app";
});

const text = computed(() => {
  return config.value.locale?.preset === "cs" ? "Vytvořeno službou" : "Powered by";
});
</script>
