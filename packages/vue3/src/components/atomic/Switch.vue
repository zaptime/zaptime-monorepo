<template>
  <SwitchGroup as="div" class="cal-flex cal-items-center">
    <SwitchLabel class="cal-mr-1 cal-text-xs cal-text-theme-700 dark:cal-text-theme-200">
      <slot name="before"></slot>
    </SwitchLabel>
    <Switch
      :model-value="modelValue"
      :class="modelValue ? 'cal-bg-theme-200 dark:cal-bg-theme-700' : 'cal-bg-theme-200 dark:cal-bg-theme-700'"
      class="cal-relative cal-inline-flex cal-h-[24px] cal-w-[44px] cal-shrink-0 cal-cursor-pointer cal-rounded-full cal-border-2 cal-border-transparent cal-transition-colors cal-duration-200 cal-ease-in-out focus:cal-outline-none focus-visible:cal-ring-2 focus-visible:cal-ring-white focus-visible:cal-ring-opacity-75"
      @update:model-value="emit('update:modelValue')"
    >
      <span class="cal-sr-only">Use setting</span>
      <span
        aria-hidden="true"
        :class="modelValue ? 'cal-translate-x-5' : 'cal-translate-x-0'"
        class="cal-pointer-events-none cal-inline-block cal-h-[20px] cal-w-[20px] cal-transform cal-rounded-full cal-bg-white cal-shadow-lg cal-ring-0 cal-transition cal-duration-200 cal-ease-in-out dark:cal-bg-theme-100"
      />
    </Switch>
    <SwitchLabel class="cal-ml-1 cal-text-xs cal-text-theme-700 dark:cal-text-theme-200">
      <slot name="after"></slot>
    </SwitchLabel>
  </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchLabel, SwitchGroup } from "@headlessui/vue";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>
