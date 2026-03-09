<template>
  <div v-if="guestsEnabled" class="cal-mt-4">
    <!-- Added guest badges -->
    <div v-if="confirmedGuests.length" class="cal-flex cal-flex-wrap cal-gap-2 cal-mb-2">
      <span
        v-for="(guest, index) in confirmedGuests"
        :key="index"
        class="cal-inline-flex cal-items-center cal-gap-1 cal-rounded-full cal-bg-theme-100 cal-px-3 cal-py-1 cal-text-sm cal-font-medium cal-text-theme-700 dark:cal-bg-theme-700 dark:cal-text-theme-200"
      >
        {{ guest }}
        <button
          type="button"
          class="cal-ml-0.5 cal-rounded-full cal-p-0.5 cal-text-theme-400 hover:cal-bg-theme-200 hover:cal-text-theme-600 dark:cal-text-theme-400 dark:hover:cal-bg-theme-600 dark:hover:cal-text-theme-200"
          @click="removeGuest(index)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cal-h-3.5 cal-w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </span>
    </div>

    <!-- Input for new guest -->
    <div v-if="showInput" class="cal-flex cal-items-center cal-gap-1">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="email"
        autocomplete="off"
        class="cal-block cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 dark:focus:cal-border-theme-400 sm:cal-text-sm"
        :placeholder="guestPlaceholder"
        @keydown.enter.prevent="confirmGuest"
      />
      <!-- Confirm button -->
      <button
        type="button"
        class="cal-flex-shrink-0 cal-rounded-md cal-p-2 cal-text-theme-400 hover:cal-text-theme-600 dark:cal-text-theme-500 dark:hover:cal-text-theme-300"
        @click="confirmGuest"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="cal-h-5 cal-w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <!-- Cancel button -->
      <button
        type="button"
        class="cal-flex-shrink-0 cal-rounded-md cal-p-2 cal-text-theme-400 hover:cal-text-theme-600 dark:cal-text-theme-500 dark:hover:cal-text-theme-300"
        @click="cancelInput"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="cal-h-5 cal-w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Add guest button -->
    <button
      v-if="canAddGuest && !showInput"
      type="button"
      class="cal-mt-2 cal-text-sm cal-font-medium cal-text-theme-500 hover:cal-text-theme-700 dark:cal-text-theme-400 dark:hover:cal-text-theme-200"
      @click="openInput"
    >
      + {{ addGuestLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGuests, useConfig } from "@zaptime/core";
import { inject, ref, nextTick, computed } from "vue";

const calendarId = inject<string | undefined>("calendarId");

const { guests, guestsEnabled, canAddGuest, addGuest, removeGuest } =
  useGuests(calendarId);
const { config } = useConfig(calendarId);

const guestPlaceholder = "Email";
const addGuestLabel = computed(
  () => config.value.locale?.confirmationForm?.addGuests ?? "Add guest",
);

const showInput = ref(false);
const inputValue = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const confirmedGuests = computed(() => guests.value.filter((g) => g !== ""));

function openInput() {
  showInput.value = true;
  nextTick(() => inputRef.value?.focus());
}

function confirmGuest() {
  const email = inputValue.value.trim();
  if (!email) return;

  if (!inputRef.value?.checkValidity()) {
    inputRef.value?.reportValidity();
    return;
  }

  addGuest(email);
  inputValue.value = "";
  showInput.value = false;
}

function cancelInput() {
  inputValue.value = "";
  showInput.value = false;
}
</script>
