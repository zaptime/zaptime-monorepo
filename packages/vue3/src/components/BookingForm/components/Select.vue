<template>
  <div v-if="options">
    <label
      :for="name"
      class="cal:block cal:text-sm cal:font-medium cal:text-theme-500 cal:dark:text-theme-200"
    >
      {{ label }}
    </label>
    <select
      v-model="value"
      :name="name"
      :required="required"
      class="cal:form-select cal:mt-2 cal:block cal:w-full cal:rounded-md cal:border cal:border-theme-300 cal:bg-theme-50 cal:px-5 cal:py-3.5 cal:text-base cal:font-medium cal:text-theme-900 cal:placeholder-theme-400 cal:focus:border-theme-400 cal:focus:outline-hidden cal:focus:ring-theme-500 cal:dark:border-theme-600 cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:placeholder-theme-500 cal:dark:focus:border-theme-400 cal:sm:text-sm"
    >
      <option
        v-for="(option, i) of options"
        :key="i"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>
<script setup lang="ts">
import type { CustomField } from '@zaptime/core';
import { useBookingForm } from '@zaptime/core';
import { ref, watch, inject } from 'vue';

type Props = CustomField;
const props = defineProps<Props>();

const value = ref<string>(String(props.value));

const { setCustomFieldValue } = useBookingForm(inject('calendarId'));

watch(value, (newValue) => {
  if (newValue === undefined) return;

  setCustomFieldValue(props.uuid, newValue);
});
</script>
