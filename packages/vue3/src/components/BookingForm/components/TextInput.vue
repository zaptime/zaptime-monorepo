<template>
  <div>
    <label
      :for="uuid"
      class="cal:block cal:text-sm cal:font-medium cal:text-theme-500 cal:dark:text-theme-200"
    >
      {{ label }}
    </label>
    <div class="cal:mt-2">
      <input
        :required="required"
        :type="type"
        :name="uuid"
        autocomplete="off"
        class="cal:block cal:w-full cal:rounded-md cal:border cal:border-theme-300 cal:bg-theme-50 cal:px-5 cal:py-3.5 cal:text-base cal:font-medium cal:text-theme-900 cal:placeholder-theme-400 cal:focus:border-theme-400 cal:focus:outline-hidden cal:focus:ring-theme-500 cal:dark:border-theme-600 cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:placeholder-theme-500 cal:dark:focus:border-theme-400 cal:sm:text-sm"
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
