<template>
  <label
    for="email"
    class="cal-block cal-text-sm cal-font-medium dark:cal-text-theme-200 cal-text-gray-500"
  >
    {{ label }}
  </label>
  <div class="cal-mt-2">
    <input
      :value="modelValue"
      required
      :type="type"
      :name="name"
      :autocomplete="autocomplete"
      class="cal-bg-gray-50 dark:cal-bg-theme-150 cal-text-base cal-font-medium dark:cal-text-theme-100 cal-text-theme-900 cal-border-2 cal-py-3.5 cal-px-5 dark:cal-placeholder-theme-800 cal-placeholder-gray-400 dark:cal-border-theme-800 cal-border-gray-300 focus:cal-ring-theme-500 focus:cal-border-gray-400 focus:cal-outline-none cal-block cal-w-full sm:cal-text-sm cal-rounded-md"
      :placeholder="placeholder"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  placeholder: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
});

function onChange(e: any) {
  emit('update:modelValue', e.target.value);
}
</script>
