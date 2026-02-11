<script setup lang="ts">
import { ZaptimeCalendar } from "@zaptime/vue3";
import type { ZaptimeConfig } from "@zaptime/vue3";
import type { TimeSlot } from "@zaptime/core";

defineProps<{
  config: ZaptimeConfig;
}>();

const emit = defineEmits<{
  (event: "time-slot-changed", timeSlot: TimeSlot): void;
}>();

const onTimeSlotChanged = (timeSlot: TimeSlot | undefined) => {
  if (timeSlot === undefined) {
    return;
  }

  emit("time-slot-changed", timeSlot);
};
</script>

<template>
  <div>
    <ZaptimeCalendar
      :config="config"
      @time-slot-changed="onTimeSlotChanged"
    ></ZaptimeCalendar>
  </div>
</template>
