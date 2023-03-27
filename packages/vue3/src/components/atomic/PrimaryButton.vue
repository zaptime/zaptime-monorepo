<template>
  <button
    :disabled="disabled || loading"
    class="cal-py-2 sm:cal-py-3.5 disabled:cal-opacity-80 disabled:hover:cal-bg-accent-0 cal-inline-flex cal-items-center disabled:cal-cursor-not-allowed sm:cal-px-6 cal-px-4 cal-transition-all cal-duration-75 cal-ease-out hover:dark:cal-bg-theme-200 hover:dark:cal-text-theme-900 cal-font-medium cal-bg-accent-0 cal-text-white hover:cal-bg-accent-1 dark:cal-text-theme-900 dark:cal-bg-theme-300 cal-rounded-md"
    @click="$emit('click')"
  >
    <svg
      class="cal-animate-spin cal-h-5 cal-mr-3 cal-ease-in cal-w-5 cal-text-white"
      :class="[loading ? 'cal-inline-block' : 'cal-hidden']"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="cal-opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits(['click']);
</script>
