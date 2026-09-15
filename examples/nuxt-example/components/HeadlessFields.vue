<script setup lang="ts">
import { useBillingAddress, useBookingForm } from "@zaptime/vue-headless";
const { bookingForm, setCustomFieldValue } = useBookingForm();
const { billingAddress } = useBillingAddress();
</script>
<template>
  <label v-for="field in bookingForm.filter((field) => ['text', 'email'].includes(field.type))" :key="field.uuid">
    {{ field.label }}<input :type="field.type" :value="String(field.value ?? '')" @input="setCustomFieldValue(field.uuid, ($event.target as HTMLInputElement).value)" />
  </label>
  <label>Billing email<input v-model="billingAddress.email" /></label>
</template>
