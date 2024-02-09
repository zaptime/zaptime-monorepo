<template>
  <div class="relative max-w-[840px] bg-white dark:bg-gray-900 mx-auto flex flex-col items-center justify-center">
    <button
      v-if="selectedEventTypeToken"
      class="text-white absolute top-4 left-4"
      @click="goBack"
    >
      <svg
        class="w-5 h-5 text-white stroke-2"
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
    <div
      v-show="!selectedEventTypeToken"
      class="p-10"
    >
      <div class="flex justify-center flex-col items-center">
        <img
          class="w-16 h-16 rounded-full"
          :src="props.config.avatar"
          alt="avatar"
        />
        <p class="mt-4 text-gray-900 dark:text-gray-100 font-semibold">
          {{ props.config.title }}
        </p>
        <p class="text-center max-w-lg text-gray-700 dark:text-gray-200 mt-2">
          {{ props.config.description }}
        </p>
      </div>

      <div class="mt-8 grid grid-cols-2 gap-4">
        <EventTypeCard
          v-for="eventType in props.config.eventTypes"
          :key="eventType.token"
          :config="eventType"
          @card-clicked="selectEventTypeToken"
        />
      </div>
    </div>
    <div
      v-if="selectedEventTypeToken"
      class="h-[524px]"
    >
      <EventType :config="{ token: selectedEventTypeToken }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EventTypeCard from './EventTypeCard.vue';
import { ZaptimeConfig } from '@zaptime/vue3';
import { onMounted, ref } from 'vue';
import EventType from './EventType.vue';
import { fetchRemoteGroupConfig } from '../buildConfigFromRequest';

export type EventTypeGroup = {
  title: string;
  description?: string;
  avatar?: string;
  theme: ZaptimeConfig['theme'];
  eventTypes: EventTypeConfig[];
};

export type EventTypeConfig = {
  token: string;
  title: string;
  description?: string;
  duration?: number;
};

const props = defineProps<{
  token: string;
}>();

const config = ref<EventTypeGroup>();

const selectedEventTypeToken = ref();

function selectEventTypeToken(token: string) {
  selectedEventTypeToken.value = token;
}

function goBack() {
  selectedEventTypeToken.value = null;
}

onMounted(async () => {
  config.value = await fetchRemoteGroupConfig('mVlRIHzRWmI0ZYHDETlfDQsnRV9X4hZF');
});
</script>

<style></style>
