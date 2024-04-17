<template>
  <Teleport to="head">
    <component
      :is="'script'"
      src="https://js.stripe.com/v3/"
      async
    />
  </Teleport>

  <div
    v-if="!result && !errors"
    class="mx-auto mt-24 w-1/2"
  >
    <form
      class="cal-mt-6"
      @submit.prevent="handleSubmit"
    >
      <label
        for="card-number"
        class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
      >
        Card Number
      </label>
      <div
        id="card-number"
        class="cal-mt-2 cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
      >
        <!-- A Stripe Element will be inserted here. -->
      </div>

      <div class="cal-mt-3 cal-grid cal-grid-cols-2 cal-gap-3">
        <div>
          <div
            id="card-expiry"
            class="cal-mt-2 cal-block cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
          >
            <!-- A Stripe Element will be inserted here. -->
          </div>
        </div>

        <div>
          <div
            id="card-cvc"
            class="cal-mt-2 cal-block cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
          >
            <!-- A Stripe Element will be inserted here. -->
          </div>
        </div>
      </div>

      <button type="submit">Pay via Stripe</button>
    </form>
  </div>

  <div v-else>
    <p v-if="result">Payment successful</p>
    <p v-if="errors">{{ errors }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

import { useStripe } from '../composables/useStripe';

const { initGateway, handleSubmit, result, errors } = useStripe();

onMounted(async () => {
  await initGateway();
});
</script>

<style scoped>
.focused {
  border: 1px solid var(--c-zaptime-400) !important;
  outline: none;
}
</style>
