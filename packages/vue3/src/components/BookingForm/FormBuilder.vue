<template>
  <div>
    <div v-for="element of bookingForm" :key="element.uuid">
      <div
        v-if="
          element.type === 'phone' ||
          element.type === 'text' ||
          element.type === 'email'
        "
        class="cal-mt-4"
      >
        <TextInput v-bind="element" />
      </div>

      <div v-if="element.type === 'checkbox'" class="cal-mt-4">
        <Checkbox v-bind="element" />
      </div>

      <div v-if="element.type === 'textarea'" class="cal-mt-4">
        <Textarea v-bind="element" />
      </div>

      <div v-if="element.type === 'select'" class="cal-mt-4">
        <Select v-bind="element" />
      </div>

      <div v-if="element.type === 'multiselect'" class="cal-mt-4">
        <Multiselect v-bind="element" />
      </div>

      <div v-if="element.type === 'radio'" class="cal-mt-4">
        <Radio v-bind="element" />
      </div>
    </div>

    <div v-if="isGuestsEnabled" class="cal-mt-4">
      <GuestsInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import TextInput from "./components/TextInput.vue";
import Checkbox from "./components/Checkbox.vue";
import Textarea from "./components/Textarea.vue";
import Select from "./components/Select.vue";
import Multiselect from "./components/Multiselect.vue";
import Radio from "./components/Radio.vue";
import GuestsInput from "./components/GuestsInput.vue";

import { inject } from "vue";
import { useBookingForm, useGuests } from "@zaptime/core";

const { bookingForm } = useBookingForm(inject("calendarId"));
const { isEnabled: isGuestsEnabled } = useGuests(inject("calendarId"));
</script>
