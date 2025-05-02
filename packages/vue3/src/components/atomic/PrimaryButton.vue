<template>
  <button
    :disabled="disabled || loading"
    class="cal-inline-flex cal-items-center cal-rounded-md cal-bg-accent-base cal-px-4 cal-py-3 cal-font-medium cal-text-white cal-transition-all cal-duration-75 cal-ease-out hover:cal-bg-accent-dark disabled:cal-cursor-not-allowed disabled:cal-opacity-80 disabled:hover:cal-bg-accent-base dark:cal-bg-accent-base dark:cal-text-theme-900 hover:dark:cal-bg-accent-dark hover:dark:cal-text-theme-900 sm:cal-px-6 sm:cal-py-3.5"
    @click="$emit('click')"
  >
    <svg
      class="cal-mr-3 cal-h-5 cal-w-5 cal-animate-spin cal-text-white cal-ease-in"
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

defineEmits(["click"]);
</script>
