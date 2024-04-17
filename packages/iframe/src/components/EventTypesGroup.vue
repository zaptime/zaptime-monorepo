<template>
  <div class="relative max-w-[840px] bg-white dark:bg-gray-900 mx-auto flex flex-col items-center justify-center">
    <div
      v-show="!selectedEventTypeToken"
      class="p-10"
    >
      <div class="flex justify-center flex-col items-center">
        <img
          class="w-24 h-24 rounded-full object-cover"
          :src="config.avatar"
          alt="avatar"
        />
        <p class="mt-4 text-xl text-gray-900 dark:text-gray-100 font-semibold">
          {{ config.title }}
        </p>
        <p
          class="text-center max-w-xl text-gray-700 dark:text-gray-200 mt-2"
          v-html="config.description"
        ></p>
      </div>

      <div class="mt-8 grid sm:grid-cols-2 gap-4">
        <EventTypeCard
          v-for="eventType in config.event_types"
          :key="eventType.token"
          :config="eventType"
          @card-clicked="selectEventTypeToken"
        />
      </div>
    </div>
    <div
      v-if="selectedEventTypeToken"
      class="min-h-[618px]"
    >
      <button
        class="text-white mt-4 sm:absolute top-4 left-4"
        @click="goBack"
      >
        <svg
          class="w-5 h-5 stroke-2"
          :style="{ color: config.theme?.colors?.[400] }"
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
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          ></path>
        </svg>
      </button>
      <EventType :config="{ token: selectedEventTypeToken }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EventTypeCard from './EventTypeCard.vue';
import { ZaptimeConfig } from '@zaptime/vue3';
import { ref } from 'vue';
import EventType from './EventType.vue';

export type EventTypeGroup = {
  title: string;
  token: string;
  description?: string;
  avatar?: string;
  theme: ZaptimeConfig['theme'];
  event_types: EventTypeConfig[];
};

export type EventTypeConfig = {
  token: string;
  name: string;
  description?: string;
  duration?: number;
};

defineProps<{
  config: EventTypeGroup;
}>();

const selectedEventTypeToken = ref();

function selectEventTypeToken(token: string) {
  selectedEventTypeToken.value = token;
}

function goBack() {
  selectedEventTypeToken.value = null;
}
</script>
