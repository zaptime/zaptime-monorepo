<template>
  <label v-if="options">
    <span class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200">
      {{ label }}
    </span>
    <select
      v-model="selected"
      :name="name"
      :required="required"
      class="cal-form-select cal-mt-2 cal-block cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 dark:focus:cal-border-theme-400 sm:cal-text-sm"
    >
      <option v-for="(option, i) of options" :key="i" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>
<script setup lang="ts">
import { fieldProps } from "../fieldProps";
import { useBookingForm } from "@zaptime/vue-headless";
import { computed, inject } from "vue";

const props = defineProps(fieldProps);

const { setCustomFieldValue } = useBookingForm(inject("calendarId"));
const selected = computed({ get: () => (typeof props.value === "string" ? props.value : ""), set: (value) => setCustomFieldValue(props.uuid, value) });
</script>
