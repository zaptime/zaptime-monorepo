<template>
  <button
    class="cal:mr-2 cal:rounded-md cal:bg-theme-100 cal:px-4 cal:py-2 cal:font-medium cal:text-accent-base cal:transition-all cal:duration-75 cal:ease-out cal:hover:bg-theme-200 cal:hover:text-accent-dark cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:text-white cal:dark:hover:bg-theme-700 cal:dark:hover:text-accent-base cal:sm:px-6 cal:sm:py-3.5"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
