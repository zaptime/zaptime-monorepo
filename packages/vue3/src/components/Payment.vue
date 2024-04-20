<template>
  <Teleport to="head">
    <component
      :is="'script'"
      src="https://js.stripe.com/v3/"
      async
    />
  </Teleport>

  <div class="cal-mt-6">
    <div class="cal-mt-3">
      <p class="cal-text-xl cal-font-semibold cal-leading-[36px] cal-text-theme-800 dark:cal-text-theme-300">{{ config.locale.confirmationForm.payments.price }}</p>
      <p class="cal-text-lg cal-font-medium cal-leading-[24px] cal-text-theme-700 dark:cal-text-theme-100">{{ stripeConfig.price / 100 }} {{ stripeConfig.currency }}</p>
    </div>

    <div class="cal-mt-4">
      <label
        for="card-number"
        class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
      >
        {{ config.locale.confirmationForm.payments.cardNumber }}
      </label>
      <div
        id="card-number"
        class="cal-mt-2 cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
      >
        <!-- A Stripe Element will be inserted here. -->
      </div>
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
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useStripeConfig } from '@zaptime/core';
import { useConfig } from '@zaptime/core';

const { stripeConfig } = useStripeConfig(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));
</script>

<style scoped>
.focused {
  border: 1px solid var(--c-zaptime-400) !important;
  outline: none;
}
</style>
