<template>
  <button
    class="cal-mr-2 cal-rounded-md cal-bg-theme-100 cal-px-4 cal-py-2 cal-font-medium cal-text-accent-base cal-transition-all cal-duration-75 cal-ease-out hover:cal-bg-theme-200 hover:cal-text-accent-dark dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-text-white hover:dark:cal-bg-theme-700 hover:dark:cal-text-accent-base sm:cal-px-6 sm:cal-py-3.5"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
