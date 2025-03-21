<template>
  <div class="cal:relative cal:flex cal:items-start">
    <div class="cal:flex cal:h-6 cal:items-center">
      <input
        :id="uuid"
        :name="uuid"
        type="checkbox"
        :required="required"
        class="cal:form-checkbox cal:h-5 cal:w-5 cal:rounded-md cal:border cal:border-theme-400 cal:ring-opacity-25 cal:checked:border-none cal:checked:bg-accent-base cal:focus:ring-1 cal:focus:ring-accent-light cal:dark:border-theme-300"
        @change="onChange"
      />
    </div>
    <div class="cal:ml-3 cal:text-sm cal:leading-6">
      <label
        :for="uuid"
        class="zaptime-checkbox-label cal:text-theme-700 cal:dark:text-theme-400"
        v-html="label"
      ></label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CustomField } from '@zaptime/core';
import { useBookingForm } from '@zaptime/core';
import { inject } from 'vue';
type Props = CustomField;
const props = defineProps<Props>();

const { setCustomFieldValue } = useBookingForm(inject('calendarId'));

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
