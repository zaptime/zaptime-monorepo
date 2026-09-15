<template>
  <div v-if="stripeConfig" class="cal-mt-6">
    <p v-if="mountError" role="alert" class="cal-text-red-500">{{ mountError }}</p>
    <div class="cal-mt-3">
      <p v-if="config.locale?.confirmationForm?.payments" class="cal-text-xl cal-font-semibold cal-leading-[36px] cal-text-theme-800 dark:cal-text-theme-300">
        {{ config.locale.confirmationForm.payments.price }}
      </p>
      <p class="cal-text-lg cal-font-medium cal-leading-[24px] cal-text-theme-700 dark:cal-text-theme-100">
        {{ priceCurrency }}
      </p>
    </div>

    <button
      v-if="!showAllBillingDetails"
      class="cal-mt-5 cal-rounded-md cal-bg-theme-100 cal-px-2 cal-py-1 cal-text-sm cal-font-medium cal-text-theme-600 dark:cal-bg-theme-600 dark:cal-text-theme-300"
      type="button"
      @click="showAllBillingDetails = true"
    >
      {{ config.locale?.confirmationForm?.payments?.showBillingDetails }}
    </button>

    <Transition>
      <div v-if="showAllBillingDetails && config.locale?.confirmationForm?.payments">
        <div class="">
          <TextInput v-model="billingAddress.name" class="cal-mt-4" :label="config.locale.confirmationForm.payments.name" name="name" type="text" autocomplete="name" />

          <TextInput v-model="billingAddress.email" class="cal-mt-4" :label="config.locale.confirmationForm.payments.email" name="email" type="text" autocomplete="email" />
        </div>

        <TextInput v-model="billingAddress.company" class="cal-mt-4" :label="config.locale.confirmationForm.payments.company" name="company" type="text" autocomplete="organization" />

        <div class="cal-mt-4 cal-flex cal-w-full cal-gap-3">
          <TextInput v-model="billingAddress.address" class="cal-w-1/2" :label="config.locale.confirmationForm.payments.address" name="address" type="text" autocomplete="address-line1" />

          <CountrySelectInput v-model="billingAddress.country" :label="config.locale.confirmationForm.payments.country" class="cal-w-1/2" />
        </div>

        <div class="cal-flex cal-gap-3">
          <TextInput v-model="billingAddress.city" class="cal-mt-4" :label="config.locale.confirmationForm.payments.city" name="city" type="text" autocomplete="address-level2" />

          <TextInput v-model="billingAddress.postalCode" class="cal-mt-4" :label="config.locale.confirmationForm.payments.zip" name="postalCode" type="text" autocomplete="postal-code" />
        </div>

        <div class="cal-flex cal-gap-3">
          <TextInput v-model="billingAddress.vatId" class="cal-mt-4" :label="config.locale.confirmationForm.payments.vatId" name="vatID" type="text" autocomplete="vat-id" />

          <TextInput v-model="billingAddress.crn" class="cal-mt-4" :label="config.locale.confirmationForm.payments.crn" name="crn" type="text" autocomplete="crn" />
        </div>
      </div>
    </Transition>

    <div class="cal-mt-12">
      <label v-if="config.locale?.confirmationForm?.payments" class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200">
        {{ config.locale.confirmationForm.payments.cardNumber }}
      </label>
      <div
        ref="cardNumber"
        class="cal- cal-mt-2 cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
      >
        <!-- A Stripe Element will be inserted here. -->
      </div>
    </div>

    <div class="cal-mt-3 cal-grid cal-grid-cols-2 cal-gap-3">
      <div>
        <div
          ref="cardExpiry"
          class="cal-mt-2 cal-block cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
        >
          <!-- A Stripe Element will be inserted here. -->
        </div>
      </div>

      <div>
        <div
          ref="cardCvc"
          class="cal-mt-2 cal-block cal-h-[50px] cal-w-full cal-rounded-md cal-border cal-border-theme-300 cal-bg-theme-50 cal-px-5 cal-py-4 cal-text-base cal-font-medium cal-text-theme-900 cal-placeholder-theme-400 focus:cal-border-theme-400 focus:cal-outline-none focus:cal-ring-theme-500 dark:cal-border-theme-600 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
        >
          <!-- A Stripe Element will be inserted here. -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, watch, onMounted, onUnmounted } from "vue";
import { createStripePaymentDriver, type StripePaymentDriver } from "@zaptime/browser";
import { calendarMessages } from "../generated/messages";
import { useUiCalendar } from "../composables/useUiCalendar";
import { useStripeConfig } from "@zaptime/vue-headless";
import { useConfig } from "@zaptime/vue-headless";
import { useBillingAddress, useBookingForm } from "@zaptime/vue-headless";
import TextInput from "../components/atomic/TextInput.vue";
import CountrySelectInput from "../components/atomic/CountrySelectInput.vue";
import { useLocalisedPriceCurrency } from "../composables/useLocalisedPriceCurrency";

const showAllBillingDetails = ref(false);
const cardNumber = ref<HTMLElement>();
const cardExpiry = ref<HTMLElement>();
const cardCvc = ref<HTMLElement>();
const mountError = ref("");
const { setPayment } = useUiCalendar();
let driver: StripePaymentDriver | undefined;
onMounted(async () => {
  if (!cardNumber.value || !cardExpiry.value || !cardCvc.value) return;
  const theme = config.value.theme;
  const dark = theme?.mode !== "light";
  driver = createStripePaymentDriver({
    publishableKey: config.value.stripePublishableKey ?? import.meta.env.VITE_STRIPE_CLIENT_KEY,
    accountId: stripeConfig.value?.stripeAccountId,
    elements: { cardNumber: cardNumber.value, cardExpiry: cardExpiry.value, cardCvc: cardCvc.value },
    style: {
      base: {
        color: dark ? (theme?.colors?.[100] ?? "#f1f5f9") : (theme?.colors?.[900] ?? "#020617"),
        fontWeight: 600,
        fontFamily: '"Basier Circle", system-ui, sans-serif',
        fontSize: "14px",
        "::placeholder": { color: theme?.colors?.[400] ?? "#64748b" },
      },
      invalid: { color: "#E25950" },
    },
  });
  setPayment(driver);
  try {
    await driver.mount();
  } catch {
    mountError.value = calendarMessages(config.value.locale?.preset).gatewayFailed;
  }
});
onUnmounted(() => {
  const released = driver;
  setPayment(undefined);
  void released?.dispose();
});

const { stripeConfig } = useStripeConfig(inject("calendarId"));
const { config } = useConfig(inject("calendarId"));
const { billingAddress } = useBillingAddress(inject("calendarId"));
const { collectFormValues } = useBookingForm(inject("calendarId"));

const { priceCurrency } = useLocalisedPriceCurrency({
  price: () => stripeConfig.value?.price || 0,
  currency: () => stripeConfig.value?.currency || "",
  calendarId: inject("calendarId"),
});

// prefill billing address with user data provided in booking form
watch(showAllBillingDetails, () => {
  const values = collectFormValues();

  if (billingAddress.value.name === "" && values.firstName !== undefined && values.lastName !== undefined) {
    billingAddress.value.name = values.firstName + " " + values.lastName;
  }

  if (billingAddress.value.email === "") {
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
