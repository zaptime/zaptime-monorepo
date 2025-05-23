<script setup lang="ts">
import { ZaptimeConfig, TimeSlot } from "@zaptime/core";
import EventType from "./components/EventType.vue";
import EventTypeGroup from "./components/EventTypesGroup.vue";
import type { EventTypeGroup as IEventTypeGroup } from "./components/EventTypesGroup.vue";
import { fetchRemoteGroupConfig } from "./buildConfigFromRequest";
import { computed, onMounted, ref } from "vue";
const type = window.xprops.type ? window.xprops.type : "single";
const position = window.xprops.position ? window.xprops.position : "center";
const config = ref(window.xprops.config);
const loaded = ref(false);

function onTimeSlotChanged(timeSlot: TimeSlot | undefined) {
  if (timeSlot === undefined) {
    return;
  }
  if (window.xprops.onTimeSlotChanged) {
    window.xprops.onTimeSlotChanged(timeSlot);
  }
}

function isSingleConfig(
  _config: ZaptimeConfig | IEventTypeGroup,
  type: "single" | "group",
): _config is ZaptimeConfig {
  return type === "single";
}

async function loadConfig() {
  if (type === "group") {
    config.value = await fetchRemoteGroupConfig(config.value.token);
  }
  loaded.value = true;
}

const positionCssClass = computed(() => {
  if (position === "left") {
    return "justify-start";
  }
  if (position === "right") {
    return "justify-end";
  }
  return "justify-center";
});

onMounted(async () => {
  await loadConfig();
});
</script>

<template>
  <div
    id="iframe-app"
    :class="[config.theme?.mode === 'dark' ? 'dark' : '', positionCssClass]"
    class="flex w-full"
  >
    <div v-if="config && loaded">
      <div v-if="isSingleConfig(config, type)">
        <EventType :config="config" @time-slot-changed="onTimeSlotChanged">
        </EventType>
      </div>

      <div v-else>
        <EventTypeGroup :config="config" />
      </div>
    </div>
  </div>
</template>

<style>
#iframe-app {
  --c-gray-25: v-bind(config?.theme?.colors?.[ "25"] || "#FCFCFD");
  --c-gray-50: v-bind(config?.theme?.colors?.[ "50"] || "#F9FAFB");
  --c-gray-100: v-bind(config?.theme?.colors?.[ "100"] || "#F3F4F6");
  --c-gray-200: v-bind(config?.theme?.colors?.[ "200"] || "#E5E7EB");
  --c-gray-300: v-bind(config?.theme?.colors?.[ "300"] || "#D2D6DB");
  --c-gray-400: v-bind(config?.theme?.colors?.[ "400"] || "#9DA4AE");
  --c-gray-500: v-bind(config?.theme?.colors?.[ "500"] || "#6C737F");
  --c-gray-600: v-bind(config?.theme?.colors?.[ "600"] || "#4D5761");
  --c-gray-700: v-bind(config?.theme?.colors?.[ "700"] || "#384250");
  --c-gray-800: v-bind(config?.theme?.colors?.[ "800"] || "#1F2A37");
  --c-gray-900: v-bind(config?.theme?.colors?.[ "900"] || "#111927");

  --c-accent-light: v-bind(config?.theme?.colors?.accentLight || "#2ED3B7");
  --c-accent-base: v-bind(config?.theme?.colors?.accentBase || "#15B79E");
  --c-accent-dark: v-bind(config?.theme?.colors?.accentDark || "#0E9384");

  --radius: v-bind(config.theme?.borderRadius || "6px");
}
</style>
