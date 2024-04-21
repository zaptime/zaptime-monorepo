<template>
  <SwitchGroup
    as="div"
    class="cal-flex cal-items-center"
  >
    <Switch
      v-model="enabled"
      :required="required"
      :class="[
        enabled ? 'cal-bg-accent-base' : 'cal-bg-theme-200 dark:cal-bg-theme-700',
        'cal-focus:outline-none cal-focus:ring-2 cal-focus:ring-indigo-600 cal-focus:ring-offset-2 cal-relative cal-inline-flex cal-h-6 cal-w-11 cal-flex-shrink-0 cal-cursor-pointer cal-rounded-full cal-border-2 cal-border-transparent cal-transition-colors cal-duration-200 cal-ease-in-out',
      ]"
    >
      <span
        aria-hidden="true"
        :class="[
          enabled ? 'cal-translate-x-5' : 'cal-translate-x-0',
          'cal-pointer-events-none cal-inline-block cal-h-5 cal-w-5 cal-rounded-full cal-bg-white cal-shadow cal-ring-0 cal-transition cal-duration-200 cal-ease-in-out',
        ]"
      />
    </Switch>
    <SwitchLabel
      as="span"
      class="cal-ml-3 cal-text-sm"
    >
      <span class="cal-text-theme-400">{{ label }}</span>
    </SwitchLabel>
  </SwitchGroup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import type { BookingForm } from '@zaptime/core';
interface Props extends BookingForm {}

defineProps<Props>();
const enabled = ref(false);
</script>
