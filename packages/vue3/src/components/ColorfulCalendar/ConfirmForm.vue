<template>
  <div
    class="sm:cal-px-6 cal-px-0 cal-h-full cal-flex cal-rounded-xl cal-justify-center"
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
      class="sm:cal-w-[370px] cal-mt-8"
      :class="[selectedEvent.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']"
    >
      <h1 class="dark:cal-text-theme-200 cal-text-theme-700 cal-text-2xl">
        {{ locale?.confirmationForm?.confirmBooking }}
      </h1>
      <h2
        class="dark:cal-text-theme-300 cal-text-theme-600 cal-text-[32px] cal-mt-[15px] cal-font-semibold"
      >
        {{ getFormattedDay(selectedEvent.start) }}
        {{ getFormattedDayInMonth(selectedEvent.start) }}
      </h2>
      <h3
        class="cal-text-theme-400 dark:cal-text-theme-400 cal-font-semibold cal-leading-[48px] cal-text-[32px]"
      >
        {{ getFormattedTime(selectedEvent.start) }} -
        {{ getFormattedTime(selectedEvent.end) }}
      </h3>

      <div class="cal-max-w-[370px] cal-mt-6">
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium dark:cal-text-theme-200 cal-text-theme-700"
          >{{ locale?.confirmationForm?.name?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="name"
            type="text"
            autocomplete="name"
            name="name"
            class="cal-bg-theme-50 dark:cal-bg-theme-150 cal-text-base cal-font-medium dark:cal-text-theme-100 cal-text-theme-900 cal-border-2 cal-py-3.5 cal-px-5 dark:cal-placeholder-theme-800 cal-placeholder-theme-300 dark:cal-border-theme-800 cal-border-theme-300 focus:cal-ring-theme-500 focus:cal-border-theme-500 focus:cal-outline-none cal-block cal-w-full sm:cal-text-sm cal-rounded-md"
            :placeholder="locale?.confirmationForm?.name?.placeholder"
          />
        </div>
      </div>

      <div class="cal-max-w-[370px] cal-mt-6">
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium dark:cal-text-theme-200 cal-text-theme-700"
        >
          {{ locale?.confirmationForm?.email?.label }}</label
        >
        <div class="cal-mt-2">
          <input
            v-model="email"
            required
            type="email"
            name="email"
            autocomplete="email"
            class="cal-bg-theme-50 dark:cal-bg-theme-150 cal-text-base cal-font-medium dark:cal-text-theme-100 cal-text-theme-900 cal-border-2 cal-py-3.5 cal-px-5 dark:cal-placeholder-theme-800 cal-placeholder-theme-300 dark:cal-border-theme-800 cal-border-theme-300 focus:cal-ring-theme-500 focus:cal-border-theme-500 focus:cal-outline-none cal-block cal-w-full sm:cal-text-sm cal-rounded-md"
            :placeholder="locale?.confirmationForm?.email?.placeholder"
          />
        </div>
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
        <SecondaryButton @click="$emit('goBack')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton type="submit" @click="$emit('confirmBooking')">
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { useSelectedEvent, book, useConfig } from "@zaptime/core";
import { useFormatters } from "../../utils/dateFormatters";
import PrimaryButton from "./atomic/PrimaryButton.vue";
import SecondaryButton from "./atomic/SecondaryButton.vue";

const { selectedEvent } = useSelectedEvent(inject("calendarId"));
const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } =
  useFormatters(inject("calendarId"));
const { config } = useConfig(inject("calendarId"));
const color2 = inject<string>("color2");

const email = ref("");
const name = ref("");
const seats = ref(1);

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
    }
  }

  return {
    firstName,
    lastName,
  };
};

const onSubmit = async () => {
  const { firstName, lastName } = splitName(name.value);
  await book(email.value, firstName, lastName, seats.value);
};
</script>
