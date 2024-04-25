<template>
  <Teleport to="head">
    <component
      :is="'script'"
      src="https://js.stripe.com/v3/"
      async
    />
  </Teleport>

  <div
    v-if="stripeConfig"
    class="cal-mt-6"
  >
    <div class="cal-mt-3">
      <p
        v-if="config.locale?.confirmationForm?.payments"
        class="cal-text-xl cal-font-semibold cal-leading-[36px] cal-text-theme-800 dark:cal-text-theme-300"
      >
        {{ config.locale.confirmationForm.payments.price }}
      </p>
      <p class="cal-text-lg cal-font-medium cal-leading-[24px] cal-text-theme-700 dark:cal-text-theme-100">{{ stripeConfig.price }} {{ stripeConfig.currency }}</p>
    </div>

    <button
      v-if="!showAllBillingDetails"
      class="cal-mt-5 cal-rounded-md cal-bg-theme-100 cal-px-2 cal-py-1 cal-text-sm cal-font-medium cal-text-theme-600 dark:cal-bg-theme-600 dark:cal-text-theme-300"
      type="button"
      @click="showAllBillingDetails = true"
    >
      Vyplnit fakturační údaje
    </button>

    <Transition>
      <div v-if="showAllBillingDetails">
        <div class="">
          <TextInput
            v-model="billingAddress.name"
            class="cal-mt-4"
            placeholder="Name"
            label="Name"
            name="name"
            type="text"
            autocomplete="name"
            required
          />

          <TextInput
            v-model="billingAddress.email"
            class="cal-mt-4"
            placeholder="Email"
            label="Email"
            name="email"
            type="text"
            autocomplete="email"
            required
          />
        </div>

        <TextInput
          v-model="billingAddress.company"
          class="cal-mt-4"
          placeholder="Company"
          label="Company"
          name="company"
          type="text"
          autocomplete="organization"
          required
        />

        <div class="cal-mt-4 cal-flex cal-w-full cal-gap-3">
          <TextInput
            v-model="billingAddress.address"
            class="cal-w-1/2"
            placeholder="Adress"
            label="Adress"
            name="address"
            type="text"
            autocomplete="address-line1"
            required
          />

          <CountrySelectInput
            class="cal-w-1/2"
            default-country="CZ"
          />
        </div>

        <div class="cal-flex cal-gap-3">
          <TextInput
            v-model="billingAddress.city"
            class="cal-mt-4"
            placeholder="City"
            label="City"
            name="city"
            type="text"
            autocomplete="address-level2"
            required
          />

          <TextInput
            v-model="billingAddress.postalCode"
            class="cal-mt-4"
            placeholder="Postal code"
            label="Postal code"
            name="postalCode"
            type="text"
            autocomplete="postal-code"
            required
          />
        </div>

        <div class="cal-flex cal-gap-3">
          <TextInput
            v-model="billingAddress.vatId"
            class="cal-mt-4"
            placeholder="Vat ID"
            label="Vat Id"
            name="vatID"
            type="text"
            autocomplete="vat-id"
            :required="false"
          />

          <TextInput
            v-model="billingAddress.vatId"
            class="cal-mt-4"
            placeholder="Crn"
            label="CRN"
            name="crn"
            type="text"
            autocomplete="crn"
            :required="false"
          />
        </div>
      </div>
    </Transition>

    <div class="cal-mt-12">
      <label
        v-if="config.locale?.confirmationForm?.payments"
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

<script lang="ts" setup>
import { inject, ref, watch } from 'vue';
import { useStripeConfig } from '@zaptime/core';
import { useConfig } from '@zaptime/core';
import { useBillingAddress, useBookingForm } from '@zaptime/core';
import TextInput from '../components/atomic/TextInput.vue';
import CountrySelectInput from '../components/atomic/CountrySelectInput.vue';

const showAllBillingDetails = ref(false);

const { stripeConfig } = useStripeConfig(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));
const { billingAddress } = useBillingAddress(inject('calendarId'));
const { collectFormValues } = useBookingForm(inject('calendarId'));

// prefill billing address with user data provided in booking form
watch(showAllBillingDetails, () => {
  const values = collectFormValues();

  if (billingAddress.value.name === '' && values.firstName !== undefined && values.lastName !== undefined) {
    console.log(values.firstName);

    billingAddress.value.name = values.firstName + ' ' + values.lastName;
  }

  if (billingAddress.value.email === '' && values.email !== undefined) {
    billingAddress.value.email = values.email;
  }
});
</script>

<style scoped>
.focused {
  border: 1px solid var(--c-zaptime-400) !important;
  outline: none;
}
</style>
