<template>
  <div>
    <label
      class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
    >
      Add guests
    </label>
    <div class="cal-mt-2 cal-flex cal-gap-2">
      <input
        v-model="inputEmail"
        type="email"
        autocomplete="off"
        class="cal-block cal-flex-1 cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 dark:focus:cal-border-theme-400 sm:cal-text-sm"
        placeholder="guest@example.com"
        :disabled="!canAddMore"
        @keydown.enter.prevent="onAdd"
      />
      <button
        type="button"
        class="cal-rounded-md cal-bg-accent-base cal-px-4 cal-py-2 cal-font-medium cal-text-white cal-transition-all cal-duration-75 cal-ease-out hover:cal-bg-accent-dark disabled:cal-cursor-not-allowed disabled:cal-opacity-50 disabled:hover:cal-bg-accent-base dark:cal-bg-accent-base dark:cal-text-theme-900 hover:dark:cal-bg-accent-dark hover:dark:cal-text-theme-900"
        :disabled="!canAddMore || !inputEmail.trim()"
        @click="onAdd"
      >
        Add
      </button>
    </div>

    <p
      v-if="error"
      class="cal-mt-1 cal-text-sm cal-text-red-500 dark:cal-text-red-400"
    >
      {{ error }}
    </p>

    <p
      v-if="!canAddMore"
      class="cal-mt-1 cal-text-sm cal-text-theme-500 dark:cal-text-theme-400"
    >
      Maximum {{ maxGuests }} guests reached
    </p>

    <ul v-if="guests.length > 0" class="cal-mt-3 cal-space-y-2">
      <li
        v-for="guest in guests"
        :key="guest"
        class="cal-flex cal-items-center cal-justify-between cal-rounded-md cal-bg-theme-100 cal-px-3 cal-py-2 dark:cal-bg-theme-800"
      >
        <span
          class="cal-text-sm cal-text-theme-700 dark:cal-text-theme-200"
        >
          {{ guest }}
        </span>
        <button
          type="button"
          class="cal-ml-2 cal-text-theme-400 cal-transition-colors hover:cal-text-red-500 dark:cal-text-theme-500 dark:hover:cal-text-red-400"
          @click="onRemove(guest)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cal-h-4 cal-w-4"
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
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import { useGuests } from "@zaptime/core";

const { guests, maxGuests, canAddMore, addGuest, removeGuest } = useGuests(
  inject("calendarId"),
);

const inputEmail = ref("");
const error = ref("");

function onAdd() {
  error.value = "";
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
