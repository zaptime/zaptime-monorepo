<template>
  <div class="cal:grid cal:grid-cols-7 cal:gap-y-1">
    <div
      v-for="i in start"
      :key="i"
      class="cal:mt-2 cal:h-10 cal:w-10 cal:rounded-md cal:bg-theme-100 cal:dark:bg-theme-800"
    ></div>

    <div
      v-for="i in mid"
      :key="i"
      class="cal:mt-2 cal:h-10 cal:w-10 cal:animate-pulse cal:rounded-md cal:bg-theme-200 cal:dark:bg-theme-700"
    ></div>

    <div
      v-for="i in end"
      :key="i"
      class="cal:mt-2 cal:h-10 cal:w-10 cal:rounded-md cal:bg-theme-100 cal:dark:bg-theme-800"
    ></div>
  </div>
</template>

<script setup lang="ts">
function generateNumberNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const start = generateNumberNumberBetween(1, 10);
const end = generateNumberNumberBetween(1, 10);
const mid = 35 - start - end;
</script>
