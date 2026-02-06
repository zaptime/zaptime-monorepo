<template>
  <div
    class="cal-border-t cal-border-theme-200 cal-pt-4 dark:cal-border-theme-700"
  >
    <label
      class="cal-mb-1.5 cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
    >
      Add guests
    </label>
    <div class="cal-flex cal-items-center cal-gap-1.5">
      <input
        ref="emailInput"
        v-model="inputEmail"
        type="email"
        required
        autocomplete="off"
        class="cal-block cal-min-w-0 cal-flex-1 cal-rounded cal-border cal-border-theme-200 cal-bg-theme-50 cal-px-2.5 cal-py-1.5 cal-text-sm cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 dark:focus:cal-border-theme-400"
        placeholder="guest@example.com"
        :disabled="!canAddMore"
        @keydown.enter.prevent="onAdd"
      />
      <button
        type="button"
        class="cal-flex cal-shrink-0 cal-items-center cal-justify-center cal-rounded cal-bg-accent-base cal-p-1.5 cal-text-white cal-transition-all cal-duration-75 cal-ease-out hover:cal-bg-accent-dark disabled:cal-cursor-not-allowed disabled:cal-opacity-40 disabled:hover:cal-bg-accent-base dark:cal-bg-accent-base dark:cal-text-theme-900 hover:dark:cal-bg-accent-dark"
        :disabled="!canAddMore || !inputEmail.trim()"
        @click="onAdd"
      >
        <!-- Plus icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="cal-h-4 cal-w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <p
      v-if="error"
      class="cal-mt-1 cal-text-xs cal-text-red-500 dark:cal-text-red-400"
    >
      {{ error }}
    </p>

    <div
      v-if="guests.length > 0"
      class="cal-mt-2 cal-flex cal-flex-wrap cal-gap-1.5"
    >
      <span
        v-for="guest in guests"
        :key="guest"
        class="cal-inline-flex cal-items-center cal-gap-1 cal-rounded-full cal-bg-theme-100 cal-py-0.5 cal-pl-2.5 cal-pr-1 cal-text-xs cal-text-theme-700 dark:cal-bg-theme-800 dark:cal-text-theme-200"
      >
        {{ guest }}
        <button
          type="button"
          class="cal-rounded-full cal-p-0.5 cal-text-theme-400 cal-transition-colors hover:cal-bg-theme-200 hover:cal-text-red-500 dark:cal-text-theme-500 dark:hover:cal-bg-theme-700 dark:hover:cal-text-red-400"
          @click="onRemove(guest)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cal-h-3 cal-w-3"
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
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import { useGuests } from "@zaptime/core";

const { guests, canAddMore, addGuest, removeGuest } = useGuests(
  inject("calendarId"),
);

const emailInput = ref<HTMLInputElement | null>(null);
const inputEmail = ref("");
const error = ref("");

function onAdd() {
  error.value = "";
  emailInput.value?.setCustomValidity("");

  if (!emailInput.value?.checkValidity()) {
    emailInput.value?.reportValidity();
    return;
  }

  const result = addGuest(inputEmail.value);
  if (result.success) {
    inputEmail.value = "";
  } else {
    error.value = result.error || "Failed to add guest";
  }
}

function onRemove(email: string) {
  removeGuest(email);
}
</script>
