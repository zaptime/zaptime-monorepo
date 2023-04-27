<template>
  <div
    ref="target"
    class="w-full cal-flex cal-items-center cal-space-x-2"
  >
    <button
      class="cal-group cal-my-2 cal-inline-flex cal-cursor-pointer cal-items-center cal-justify-center cal-rounded-md cal-bg-theme-100 cal-font-medium cal-outline-none cal-transition-all cal-duration-150 cal-ease-out focus:cal-outline-none focus:cal-ring-2 focus:cal-ring-theme-800 focus:cal-ring-opacity-50 dark:cal-border-theme-600 dark:cal-bg-theme-800"
      :class="[
        isSelected(event) ? 'cal-bg-accent-0 cal-text-white' : 'cal-bg-theme-100 cal-bg-theme-100 cal-text-theme-700 hover:cal-bg-theme-200 hover:cal-text-accent-0 hover:dark:cal-bg-theme-600',
        confirmationState ? ' cal-w-1/2' : 'cal-w-full',
      ]"
      @click.prevent="confirmationState = true"
    >
      <span
        class="cal-flex cal-items-center cal-py-4 cal-leading-4"
        :class="{
          'cal-text-theme-700 dark:cal-text-white ': isSelected(event),
          'cal-text-theme-800 dark:cal-text-theme-100': !isSelected(event),
        }"
      >
        {{ getFormattedTime(event.start) }} -
        {{ getFormattedTime(event.end) }}
      </span>
    </button>

    <PrimaryButton
      v-show="confirmationState"
      class="cal-inline-flex cal-h-12 cal-w-1/2 cal-justify-center"
      @click="emit('selectEvent')"
    >
      Pick time
    </PrimaryButton>
  </div>
</template>

<script setup lang="ts">
import { IEvent } from '@zaptime/core';
import { useCalendar } from '@zaptime/core';
import { ref, inject } from 'vue';
import { useFormatters } from '../../utils/dateFormatters';
import { onClickOutside } from '@vueuse/core';
import PrimaryButton from '../atomic/PrimaryButton.vue';
const { getFormattedTime } = useFormatters(inject('calendarId'));
const { isSelected } = useCalendar(inject('calendarId'));

const target = ref();
const confirmationState = ref(false);

defineProps<{
  event: IEvent;
}>();

const emit = defineEmits(['selectEvent']);

onClickOutside(target, () => {
  confirmationState.value = false;
});
</script>
