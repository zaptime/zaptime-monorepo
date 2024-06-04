<template>
  <button
    class="ring-1 flex flex-col ring-gray-300 dark:ring-gray-600 group items-center rounded-md px-4 py-4"
    @click="cardClicked"
  >
    <div class="inline-flex justify-between w-full items-center">
      <span class="text-gray-700 dark:text-gray-200 text-left font-medium">
        {{ config.name }}
      </span>

      <svg
        class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-all duration-150 ease-out text-gray-700 dark:text-gray-200"
        data-slot="icon"
        fill="none"
        stroke-width="1.5"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
        ></path>
      </svg>
    </div>

    <div class="text-sm self-start text-left mt-4">
      <span
        v-if="config.description"
        class="text-gray-600 dark:text-gray-300 line-clamp-3"
        v-html="config.description"
      >
      </span>
      <div
        v-if="config.stripeConfig"
        class="mt-2 flex gap-1.5 text-gray-600 dark:text-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-credit-card"
        >
          <rect
            width="20"
            height="14"
            x="2"
            y="5"
            rx="2"
          />
          <line
            x1="2"
            x2="22"
            y1="10"
            y2="10"
          />
        </svg>
        {{ config.stripeConfig.price / 100 }} {{ config.stripeConfig.currency }}
      </div>
      <div
        v-if="config.duration"
        class="bg-gray-100 dark:bg-gray-700 w-fit text-xs px-1.5 py-1 rounded-md mt-3 ring-1 ring-gray-200 dark:ring-gray-500 dark:text-gray-100"
      >
        {{ config.duration }} min
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { EventTypeConfig } from './EventTypesGroup.vue';

const props = defineProps<{
  config: EventTypeConfig;
}>();

const emit = defineEmits<{
  (e: 'cardClicked', token: string): void;
}>();

function cardClicked() {
  emit('cardClicked', props.config.token);
}
</script>
