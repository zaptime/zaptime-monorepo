<template>
  <div>
    <label class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200">
      {{ label }}
    </label>
    <div
      v-for="(option, i) in options"
      :key="uuid + '_' + i"
      class="cal-relative cal-my-2 cal-flex cal-items-center"
    >
      <div class="cal-flex cal-h-6 cal-items-center">
        <input
          :id="uuid + '_' + i"
          :name="uuid"
          type="checkbox"
          class="cal-form-checkbox cal-h-5 cal-w-5 cal-rounded-md cal-border cal-border-theme-400 cal-ring-opacity-25 checked:cal-border-none checked:cal-bg-accent-base focus:cal-ring-1 focus:cal-ring-accent-light dark:cal-border-theme-300"
          @change="onChange(i)"
        />
      </div>
      <div class="cal-ml-3 cal-text-sm cal-leading-6">
        <label
          :for="uuid + '_' + i"
          class="cal-block cal-text-sm cal-text-theme-500 dark:cal-text-theme-200"
          v-html="option"
        ></label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomField } from '@zaptime/core';
import { useBookingForm } from '@zaptime/core';
import { ref, inject } from 'vue';

type Props = CustomField;
const props = defineProps<Props>();

const { setCustomFieldValue } = useBookingForm(inject('calendarId'));

const selectedValue = ref<string[]>([]);

function onChange(i: number) {
  if (props.options === undefined) {
    return;
  }

  const option = props.options[i];

  selectedValue.value = selectedValue.value.includes(option) ? selectedValue.value.filter((value) => value !== option) : [...selectedValue.value, option];

  setCustomFieldValue(props.uuid, selectedValue.value);
}
</script>
