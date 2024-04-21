<template>
  <div class="cal-relative cal-flex cal-items-start">
    <div class="cal-flex cal-h-6 cal-items-center">
      <input
        :id="uuid"
        :name="uuid"
        type="checkbox"
        :required="required"
        class="cal-h-5 cal-w-5 cal-rounded-md cal-border cal-border-theme-300 cal-ring-opacity-25 checked:cal-border-none checked:cal-bg-accent-base focus:cal-ring-1 focus:cal-ring-accent-light"
      />
    </div>
    <div class="cal-ml-3 cal-text-sm cal-leading-6">
      <label
        :for="uuid"
        class="zaptime-checkbox-label cal-text-theme-400"
        v-html="label"
      ></label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { BookingForm } from '@zaptime/core';
interface Props extends BookingForm {}

defineProps<Props>();
</script>

<style>
.zaptime-checkbox-label a {
  text-decoration: underline !important;
}
</style>
