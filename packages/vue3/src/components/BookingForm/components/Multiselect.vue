<template>
  <div>
    <label class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200">
      {{ label }}
    </label>
    <label v-for="(option, i) in options" :key="uuid + '_' + i" class="cal-relative cal-my-2 cal-flex cal-items-center">
      <div class="cal-flex cal-h-6 cal-items-center">
        <input
          :checked="Array.isArray(value) && value.includes(option)"
          :name="uuid"
          type="checkbox"
          class="cal-form-checkbox cal-h-5 cal-w-5 cal-rounded-md cal-border cal-border-theme-400 cal-ring-opacity-25 checked:cal-border-none checked:cal-bg-accent-base focus:cal-ring-1 focus:cal-ring-accent-light dark:cal-border-theme-300"
          @change="onChange(i)"
        />
      </div>
      <div class="cal-ml-3 cal-text-sm cal-leading-6">
        <span class="cal-block cal-text-sm cal-text-theme-500 dark:cal-text-theme-200" v-html="option"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { CustomField } from "@zaptime/core";
import { useBookingForm } from "@zaptime/vue-headless";
import { inject } from "vue";

type Props = CustomField;
const props = defineProps<Props>();

const { setCustomFieldValue } = useBookingForm(inject("calendarId"));

function onChange(i: number) {
  if (props.options === undefined) {
    return;
  }

  const option = props.options[i];

  const previous = Array.isArray(props.value) ? props.value : [];
  setCustomFieldValue(props.uuid, previous.includes(option) ? previous.filter((value) => value !== option) : [...previous, option]);
}
</script>
