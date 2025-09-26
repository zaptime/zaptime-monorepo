<template>
  <div
    class="relative inline-block ring-[3px] ring-[#f4f4f5] gap-2 pl-3 pr-5 py-2 rounded-full"
  >
    <motion.button
      :initial="{ opacity: 1 }"
      :while-hover="{ opacity: 0 }"
      class="flex gap-2"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <img
        class="w-10 h-10 rounded-full"
        width="40"
        height="40"
        src="https://framerusercontent.com/images/hfneFL6CHBi5BnNvCeOaqU9HqE4.png?scale-down-to=512"
        alt=""
      />

      <div class="flex text-left flex-col">
        <p class="font-medium text-sm">Rezervace tréninku</p>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <p class="text-xs text-[#989898] font-medium tracking-tight">
            Volný termín zítra
          </p>
        </div>
      </div>
    </motion.button>

    <motion.div
      :initial="{ y: 30, opacity: 1, filter: 'blur(8px)' }"
      :animate="
        isHovered
          ? {
              y: 30,
              opacity: 1,
              filter: 'blur(0px)',
              transition: {
                type: 'spring',
                damping: 25,
                stiffness: 600,
                duration: 0.06,
              },
            }
          : {
              y: 0,
              opacity: 0,
              filter: 'blur(12px)',
              transition: {
                duration: 0.1,
              },
            }
      "
      class="absolute top-[-28px] left-2 rounded-full bg-white flex w-[calc(100%-8px)] h-[calc(100%-8px)] items-center justify-center pointer-events-none z-10"
    >
      <span class="text-black font-semibold text-sm">Zobrazit kalendář</span>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { motion } from "motion-v";
import { ref } from "vue";

const isHovered = ref(false);
</script>

<style></style>
