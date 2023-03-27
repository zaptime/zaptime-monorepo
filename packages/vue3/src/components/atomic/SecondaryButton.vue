<template>
  <button
    class="cal-py-2 sm:cal-py-3.5 cal-mr-2 sm:cal-px-6 cal-px-4 cal-transition-all cal-duration-75 cal-ease-out hover:dark:cal-bg-theme-600 cal-font-medium cal-text-theme-800 cal-bg-gray-100 cal-text-accent-0 hover:cal-bg-gray-200 hover:cal-text-accent-1 dark:cal-bg-theme-700 dark:cal-text-theme-100 cal-rounded-md"
    @click="$emit('goBack')"
  >
    <slot />
  </button>
</template>
