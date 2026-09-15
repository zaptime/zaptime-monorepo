<template>
  <div>
    <!-- Materialize props each render: the editable adapter facade has stable identity. -->
    <div v-for="element of bookingForm" :key="element.uuid">
      <div v-if="element.type === 'phone' || element.type === 'text' || element.type === 'email' || element.type === 'number'" class="cal-mt-4">
        <TextInput v-bind="{ ...element }" />
      </div>

      <div v-if="element.type === 'checkbox'" class="cal-mt-4">
        <Checkbox v-bind="{ ...element }" />
      </div>

      <div v-if="element.type === 'textarea'" class="cal-mt-4">
        <Textarea v-bind="{ ...element }" />
      </div>

      <div v-if="element.type === 'select'" class="cal-mt-4">
        <Select v-bind="{ ...element }" />
      </div>

      <div v-if="element.type === 'multiselect'" class="cal-mt-4">
        <Multiselect v-bind="{ ...element }" />
      </div>

      <div v-if="element.type === 'radio'" class="cal-mt-4">
        <Radio v-bind="{ ...element }" />
      </div>
      <p v-if="fieldError(element.uuid, element.mergeTag)" role="alert" class="cal-text-sm cal-text-red-500">{{ messages.invalidField }}</p>
    </div>

    <div v-for="element of bookingForm.filter((field) => field.type === 'switch')" :key="element.uuid" class="cal-mt-4"><Switch v-bind="{ ...element }" /></div>
    <GuestEmails />
  </div>
</template>

<script setup lang="ts">
import TextInput from "./components/TextInput.vue";
import Switch from "./components/Switch.vue";
import Checkbox from "./components/Checkbox.vue";
import Textarea from "./components/Textarea.vue";
import Select from "./components/Select.vue";
import Multiselect from "./components/Multiselect.vue";
import Radio from "./components/Radio.vue";
import GuestEmails from "./components/GuestEmails.vue";

import { inject, computed } from "vue";
import { FormValidationError } from "@zaptime/core";
import { useUiCalendar } from "../../composables/useUiCalendar";
import { calendarMessages } from "../../generated/messages";
import { useBookingForm } from "@zaptime/vue-headless";

const { bookingForm } = useBookingForm(inject("calendarId"));
const { snapshot } = useUiCalendar();
const messages = computed(() => calendarMessages(snapshot.value.config.locale?.preset));
function fieldError(uuid: string, mergeTag?: string) {
  const error = snapshot.value.error;
  return error instanceof FormValidationError && error.fieldErrors.some((item) => item.field === uuid || (mergeTag === "EMAIL" && item.field === "email"));
}
</script>
