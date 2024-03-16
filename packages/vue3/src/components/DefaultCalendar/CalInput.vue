<template>
  <label
    for="email"
    class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
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
      class="cal-block cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
      :placeholder="placeholder"
      @blur="emit('blur')"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue', 'blur']);

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
