<script setup lang="ts">
import { ZapTimeCalendar } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';
import type { TimeSlot } from '@zaptime/core';
import { ref, onMounted } from 'vue';
import { fetchRemoteConfig } from '../buildConfigFromRequest';
import mergeRecursive from '../utills/mergeObjects';
import { resolve } from 'path';

const props = defineProps<{
  config: ZaptimeConfig;
}>();

const resolvedConfig = ref<ZaptimeConfig>();

const emit = defineEmits<{
  (event: 'time-slot-changed', timeSlot: TimeSlot): void;
}>();

const remoteConfigLoaded = ref(false);

async function mergeWithRemoteConfig() {
  const obtainedConfig = await fetchRemoteConfig(props.config.token);
  console.log(obtainedConfig);

  if (obtainedConfig) {
    resolvedConfig.value = mergeRecursive(obtainedConfig, resolvedConfig.value);
  }

  console.log(resolvedConfig.value);

  remoteConfigLoaded.value = true;
}

onMounted(async () => {
  await mergeWithRemoteConfig();
});

const onTimeSlotChanged = (timeSlot: TimeSlot) => {
  emit('time-slot-changed', timeSlot);
};
</script>

<template>
  <div v-if="remoteConfigLoaded">
    <ZapTimeCalendar
      :config="resolvedConfig"
      @time-slot-changed="onTimeSlotChanged"
    ></ZapTimeCalendar>
  </div>
</template>
