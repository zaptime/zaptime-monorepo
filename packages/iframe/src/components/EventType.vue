<script setup lang="ts">
import { ZapTimeCalendar } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';
import type { TimeSlot } from '@zaptime/core';
defineProps<{
  config: ZaptimeConfig;
}>();

const emit = defineEmits<{
  (event: 'time-slot-changed', timeSlot: TimeSlot): void;
}>();

const onTimeSlotChanged = (timeSlot: TimeSlot) => {
  emit('time-slot-changed', timeSlot);
};
</script>

<template>
  <div>
    <ZapTimeCalendar
      :config="config"
      @time-slot-changed="onTimeSlotChanged"
    ></ZapTimeCalendar>
  </div>
</template>
