<template>
  <label class="cal-relative cal-flex cal-items-start">
    <div class="cal-flex cal-h-6 cal-items-center">
      <input
        :name="uuid"
        type="checkbox"
        :checked="value === true"
        class="cal-form-checkbox cal-h-5 cal-w-5 cal-rounded-md cal-border cal-border-theme-400 cal-ring-opacity-25 checked:cal-border-none checked:cal-bg-accent-base focus:cal-ring-1 focus:cal-ring-accent-light dark:cal-border-theme-300"
        @change="onChange"
      />
    </div>
    <div class="cal-ml-3 cal-text-sm cal-leading-6">
      <span class="zaptime-checkbox-label cal-text-theme-700 dark:cal-text-theme-400" v-html="label"></span>
    </div>
  </label>
</template>

<script lang="ts" setup>
import type { CustomField } from "@zaptime/core";
import { useBookingForm } from "@zaptime/vue-headless";
import { inject } from "vue";
type Props = CustomField;
const props = defineProps<Props>();

const { setCustomFieldValue } = useBookingForm(inject("calendarId"));

function onChange(e: Event) {
  if (e.target instanceof HTMLInputElement) {
    setCustomFieldValue(props.uuid, e.target.checked);
  }
}
</script>

<style>
.zaptime-checkbox-label a {
  text-decoration: underline !important;
}
</style>
