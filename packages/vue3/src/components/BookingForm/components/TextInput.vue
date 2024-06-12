<template>
  <div>
    <label
      :for="uuid"
      class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
    >
      {{ label }}
    </label>
    <div class="cal-mt-2">
      <input
        :required="required"
        :type="type"
        :name="uuid"
        autocomplete="off"
        class="cal-block cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 dark:focus:cal-border-theme-400 sm:cal-text-sm"
        :placeholder="placeholder"
        @input="onChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingForm } from '@zaptime/core';
import type { CustomField } from '@zaptime/core';
import { inject } from 'vue';

type Props = CustomField;

const props = defineProps<Props>();

const { setCustomFieldValue } = useBookingForm(inject('calendarId'));

function onChange(e: Event) {
  if (e.target instanceof HTMLInputElement) {
    setCustomFieldValue(props.uuid, e.target.value);
  }
}
</script>
