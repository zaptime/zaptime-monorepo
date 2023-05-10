<template>
  <div
    class="cal-flex cal-h-full cal-min-h-[524px] cal-items-end cal-justify-center cal-rounded-xl cal-bg-white cal-px-0 cal-pb-10 dark:cal-bg-theme-900 sm:cal-px-6"
    :class="[config.compact ? 'cal-w-[330px] sm:cal-w-[400px]' : 'cal-w-[330px] sm:cal-w-[840px]']"
    :style="{ backgroundColor: color2 }"
  >
    <form
      v-if="selectedEvent !== undefined"
      class="cal-mt-6 sm:cal-w-[370px]"
      :class="[selectedEvent.seats > 1 ? 'cal-mt-8' : 'cal-mt-20']"
      @submit.prevent="onSubmit"
    >
      <h1 class="cal-text-2xl cal-font-medium cal-text-theme-500 dark:cal-text-theme-500">
        {{ locale?.confirmationForm?.confirmBooking }}
      </h1>
      <h2 class="cal-mt-[24px] cal-text-2xl cal-font-semibold cal-text-theme-700 dark:cal-text-theme-100">
        {{ getFormattedDay(selectedEvent.start) }}
        {{ getFormattedDayInMonth(selectedEvent.start) }}
      </h2>
      <h3 class="cal-text-[24px] cal-font-semibold cal-leading-[36px] cal-text-theme-500 dark:cal-text-theme-300">
        {{ getFormattedTime(selectedEvent.start) }} -
        {{ getFormattedTime(selectedEvent.end) }}
      </h3>

      <div class="cal-mt-6 cal-max-w-[370px]">
        <CalInput
          v-model="name"
          :label="locale?.confirmationForm?.name?.label"
          :placeholder="locale?.confirmationForm?.name?.placeholder"
          type="text"
          name="name"
          autocomplete="name"
        ></CalInput>
      </div>

      <div class="cal-mt-6 cal-max-w-[370px]">
        <CalInput
          v-model="email"
          :label="locale?.confirmationForm?.email?.label"
          :placeholder="locale?.confirmationForm?.email?.placeholder"
          type="email"
          name="email"
          autocomplete="email"
        ></CalInput>
      </div>

      <div
        v-if="selectedEvent.seats > 1"
        class="cal-mt-6 cal-max-w-[370px]"
      >
        <label
          for="email"
          class="cal-block cal-text-sm cal-font-medium cal-text-theme-700 dark:cal-text-theme-200"
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
            class="dark:cal-bg-theme-150 cal-block cal-w-full cal-rounded-md cal-border-2 cal-border-theme-800 cal-bg-theme-50 cal-px-5 cal-py-3.5 cal-text-base cal-font-medium cal-text-theme-100 cal-placeholder-theme-800 focus:cal-border-theme-500 focus:cal-outline-none focus:cal-ring-theme-500 sm:cal-text-sm"
            :placeholder="locale?.confirmationForm?.seats?.placeholder"
          />
        </div>
      </div>

      <div v-if="customFields && customFields.length > 0">
        <div
          v-for="(field, i) in customFields"
          :key="i"
        >
          <div class="cal-relative cal-mt-6 cal-w-full">
            <label
              for="email"
              class="cal-block cal-text-sm cal-font-medium cal-text-theme-500 dark:cal-text-theme-200"
            >
              {{ field.label }}
            </label>
            <Combobox
              v-model="customFields[i].selectedValue"
              class="cal-mt-2"
            >
              <div class="cal-relative cal-mt-1">
                <div
                  class="cal-relative cal-w-full cal-cursor-default cal-overflow-hidden cal-rounded-md cal-border cal-border-theme-300 cal-bg-white cal-text-left focus:cal-outline-none focus:cal-ring-accent-0 focus-visible:cal-ring-2 focus-visible:cal-ring-accent-0 focus-visible:cal-ring-opacity-75 focus-visible:cal-ring-offset-2 focus-visible:cal-ring-offset-teal-300 dark:cal-border-theme-600 dark:cal-bg-theme-700 sm:cal-text-sm"
                >
                  <ComboboxInput
                    ref="selectText"
                    :placeholder="field.placeholder"
                    class="cal-w-full cal-bg-theme-100 cal-py-3 cal-pl-3 cal-pr-10 cal-text-xs cal-font-medium cal-leading-5 cal-text-theme-900 cal-placeholder-theme-400 focus:cal-outline-none focus:cal-ring-0 dark:cal-bg-theme-800 dark:cal-text-theme-100 dark:cal-placeholder-theme-500 sm:cal-text-sm"
                    :name="field.name"
                    :display-value="() => String(field.selectedValue)"
                    @change="customFields[i].selectedValue = parseInt($event.target.value)"
                  />
                  <ComboboxButton class="cal-absolute cal-inset-y-0 cal-right-0 cal-flex cal-items-center cal-pr-2">
                    <ChevronUpDownIcon
                      class="cal-h-5 cal-w-5 cal-text-theme-400"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                </div>
                <TransitionRoot>
                  <ComboboxOptions
                    class="cal-absolute cal-z-10 cal-mt-1 cal-max-h-60 cal-w-[300px] cal-overflow-auto cal-rounded-md cal-border cal-border-theme-200 cal-bg-theme-100 cal-py-1 cal-pl-0 cal-text-base cal-shadow-lg cal-ring-1 cal-ring-black cal-ring-opacity-5 focus:cal-outline-none dark:cal-border-theme-600 dark:cal-bg-theme-800 sm:cal-text-sm"
                  >
                    <div
                      v-for="(option, id) in field.options"
                      :key="id"
                    >
                      <ComboboxOption
                        v-slot="{ selected, active }"
                        as="template"
                        :value="option.value"
                      >
                        <li
                          class="cal-relative cal-cursor-default cal-select-none cal-list-none cal-py-2 cal-pl-2 cal-pr-4"
                          :class="{
                            'cal-bg-accent-0 cal-text-white dark:cal-text-theme-900': active,
                            'cal-text-theme-900 dark:cal-text-theme-100': !active,
                          }"
                        >
                          <span
                            class="cal-block cal-truncate"
                            :class="{ 'cal-font-medium': selected, 'cal-font-normal': !selected }"
                          >
                            {{ option.label }}
                          </span>
                          <!-- <span
                    v-if="selected"
                    class="cal-absolute cal-inset-y-0 cal-left-0 cal-flex cal-items-center cal-pl-3"
                    :class="{ 'cal-text-white': active, 'cal-text-accent-0': !active }"
                  >
                    <CheckIcon
                      class="cal-h-5 cal-w-5"
                      aria-hidden="true"
                    />
                  </span> -->
                        </li>
                      </ComboboxOption>
                    </div>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
          </div>
        </div>
      </div>

      <div class="cal-mt-[32px] cal-flex cal-justify-between">
        <SecondaryButton @click="$emit('go-back')">
          {{ locale?.confirmationForm?.buttons?.goBack }}
        </SecondaryButton>
        <PrimaryButton
          :loading="disabled"
          type="submit"
        >
          {{ locale?.confirmationForm?.buttons?.confirmBooking }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useSelectedEvent, book, useConfig } from '@zaptime/core';
import { useFormatters } from '../utils/dateFormatters';
import PrimaryButton from './atomic/PrimaryButton.vue';
import SecondaryButton from './atomic/SecondaryButton.vue';
import CalInput from './DefaultCalendar/CalInput.vue';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from '@headlessui/vue';
import { ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const emits = defineEmits(['booking-confirmed', 'go-back']);

const { selectedEvent } = useSelectedEvent(inject('calendarId'));
const { getFormattedTime, getFormattedDay, getFormattedDayInMonth } = useFormatters(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));
const color2 = inject<string>('color2');
const calendarId = inject<string>('calendarId');

const email = ref('');
const name = ref('');
const seats = ref(1);

const disabled = ref(false);

const customFields = ref(config.value.customFields);

const locale = computed(() => {
  if (config === undefined) {
    return;
  }
  return config.value.locale;
});

const splitName = (name: string) => {
  let firstName = '';
  let lastName = '';

  if (name !== '') {
    const splitName = name.split(' ');

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

const onSubmit = async (e: any) => {
  disabled.value = true;

  const customFieldsCollected = [];

  if (e && e.target && e.target.elements && customFields.value) {
    for (const customField of customFields.value) {
      const field = e.target.elements.namedItem(customField.name);

      customFieldsCollected.push({
        name: customField.name,
        value: field?.value,
      });
    }
  }

  console.log(customFieldsCollected);

  // const { firstName, lastName } = splitName(name.value);

  // await book({
  //   email: email.value,
  //   firstName: firstName,
  //   lastName: lastName,
  //   seats: seats.value,
  //   calendarId: calendarId,
  //   customFields: customFieldsCollected,
  // });

  // emits('booking-confirmed');

  disabled.value = false;
};
</script>
