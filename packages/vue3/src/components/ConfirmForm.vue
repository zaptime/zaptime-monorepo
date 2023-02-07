<template>
  <div
    class="sm:cal-px-6 cal-bg-white cal-min-h-[524px] cal-px-0 cal-pb-10 cal-h-full cal-items-end cal-flex cal-rounded-xl cal-justify-center"
    :class="[
      config.compact
        ? 'cal-w-[330px] sm:cal-w-[400px]'
        : 'cal-w-[330px] sm:cal-w-[840px]',
    ]"
    :style="{ backgroundColor: color2 }"
  >
    <form
      @submit.prevent="onSubmit"
      v-if="selectedEvent !== undefined"
      class="sm:cal-w-[370px] cal-mt-6"
      :class="[selectedEvent.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']"
    >
      <h1
        class="dark:cal-text-theme-200 cal-text-gray-500 cal-font-medium cal-text-2xl"
      >
        {{ locale?.confirmationForm?.confirmBooking }}
      </h1>
      <h2
        class="dark:cal-text-theme-300 cal-text-gray-700 cal-text-2xl cal-mt-[24px] cal-font-semibold"
      >
        {{ getFormattedDay(selectedEvent.start) }}
        {{ getFormattedDayInMonth(selectedEvent.start) }}
      </h2>
      <h3
        class="cal-text-gray-500 dark:cal-text-theme-400 cal-font-semibold cal-leading-[36px] cal-text-[24px]"
      >
        {{ getFormattedTime(selectedEvent.start) }} -
        {{ getFormattedTime(selectedEvent.end) }}
      </h3>

      <div class="cal-max-w-[370px] cal-mt-6">
        <CalInput
          v-model="name"
          :label="locale?.confirmationForm?.name?.label"
          :placeholder="locale?.confirmationForm?.name?.placeholder"
          type="text"
          name="name"
          autocomplete="name"
        ></CalInput>
      </div>

      <div class="cal-max-w-[370px] cal-mt-6">
        <CalInput
          v-model="email"
          :label="locale?.confirmationForm?.email?.label"
          :placeholder="locale?.confirmationForm?.email?.placeholder"
          type="email"
          name="email"
          autocomplete="email"
        ></CalInput>
      </div>

      <div v-if="selectedEvent.seats > 1" class="cal-max-w-[370px] cal-mt-6">
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium dark:cal-text-theme-200 cal-text-theme-700"
        >
          {{ locale?.confirmationForm?.seats?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="seats"
            type="number"
            :min="1"
            :max="selectedEvent.seats"
            name="seats"
            autocomplete="off"
            class="cal-bg-theme-50 dark:cal-bg-theme-150 cal-text-base cal-font-medium cal-text-theme-100 cal-border-2 cal-py-3.5 cal-px-5 cal-placeholder-theme-800 cal-border-theme-800 focus:cal-ring-theme-500 focus:cal-border-theme-500 focus:cal-outline-none cal-block cal-w-full sm:cal-text-sm cal-rounded-md"
            :placeholder="locale?.confirmationForm?.seats?.placeholder"
          />
        </div>
      </div>

      <div class="cal-flex cal-justify-between cal-mt-[32px]">
        <SecondaryButton @click="$emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton :loading="disabled" type="submit">
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { useSelectedEvent, book, useConfig } from "@zaptime/core";
import { useFormatters } from "../utils/dateFormatters";
import PrimaryButton from "./atomic/PrimaryButton.vue";
import SecondaryButton from "./atomic/SecondaryButton.vue";
import CalInput from "./DefaultCalendar/CalInput.vue";

const emits = defineEmits(["booking-confirmed", "go-back"]);

const { selectedEvent } = useSelectedEvent(inject("calendarId"));
const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } =
  useFormatters(inject("calendarId"));
const { config } = useConfig(inject("calendarId"));
const color2 = inject<string>("color2");

const email = ref("");
const name = ref("");
const seats = ref(1);

const disabled = ref(false);

const locale = computed(() => {
  if (config === undefined) {
    return;
  }
  return config.value.locale;
});

const splitName = (name: string) => {
  let firstName = "";
  let lastName = "";

  if (name !== "") {
    const splitName = name.split(" ");

    if (splitName.length > 1) {
      firstName = splitName[0];
      lastName = splitName[1];
    } else {
      firstName = name;
    }
  }

  return {
    firstName,
    lastName,
  };
};

const onSubmit = async () => {
  disabled.value = true;

  const { firstName, lastName } = splitName(name.value);
  await book(email.value, firstName, lastName, seats.value);
  emits("booking-confirmed");

  disabled.value = false;
};
</script>
