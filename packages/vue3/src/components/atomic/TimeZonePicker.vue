<template>
  <div class="cal-w-full">
    <Combobox :model-value="timezone" @update:model-value="setNewTimezone">
      <div class="cal-relative cal-mt-1">
        <div
          class="cal-relative cal-w-full cal-cursor-default cal-overflow-hidden cal-rounded-md cal-bg-white cal-text-left focus:cal-outline-none focus:cal-ring-accent-base focus-visible:cal-ring-2 focus-visible:cal-ring-accent-base focus-visible:cal-ring-opacity-75 focus-visible:cal-ring-offset-2 focus-visible:cal-ring-offset-teal-300 dark:cal-bg-theme-700 sm:cal-text-sm"
        >
          <ComboboxInput
            :aria-label="messages.timezone"
            ref="selectText"
            class="cal-w-full cal-border-none cal-bg-theme-100 cal-py-2 cal-pl-3 cal-pr-10 cal-text-xs cal-leading-5 cal-text-theme-900 focus:cal-outline-none focus:cal-ring-0 dark:cal-bg-theme-800 dark:cal-text-theme-100"
            :displayValue="() => timezone"
            @change="setQuery($event.target.value)"
            @focus="selectAllText"
          />
          <ComboboxButton :aria-label="messages.timezone" class="cal-absolute cal-inset-y-0 cal-right-0 cal-flex cal-items-center cal-pr-2">
            <ChevronUpDownIcon class="cal-h-5 cal-w-5 cal-text-theme-400" aria-hidden="true" />
          </ComboboxButton>
        </div>
        <TransitionRoot
          leave="cal-transition cal-ease-in cal-duration-100"
          leaveFrom="cal-opacity-100 "
          leaveTo="cal-opacity-0"
          enter="cal-transition-all cal-duration-300 cal-ease-out"
          enter-from="cal-opacity-0 -cal-translate-y-[30px]"
          enter-to="cal-opacity-100 -cal-translate-y-[36px]"
          @after-leave="query = ''"
        >
          <ComboboxOptions
            class="cal-absolute -cal-top-3 cal-mt-1 cal-max-h-60 cal-w-[300px] -cal-translate-y-full cal-overflow-auto cal-rounded-md cal-border cal-border-theme-200 cal-bg-theme-100 cal-py-1 cal-pl-0 cal-text-base cal-shadow-lg cal-ring-1 cal-ring-black cal-ring-opacity-5 focus:cal-outline-none dark:cal-border-theme-600 dark:cal-bg-theme-800 sm:cal-text-sm"
          >
            <div v-if="filteredTimezones.length === 0 && query !== ''" class="cal-relative cal-cursor-default cal-select-none cal-px-4 cal-py-2 cal-text-theme-700 dark:cal-text-theme-100">Nothing found.</div>

            <div v-for="(tz, id) in filteredTimezones" :key="id">
              <ComboboxOption v-slot="{ selected, active }" as="template" :value="tz">
                <li
                  class="cal-relative cal-cursor-default cal-select-none cal-list-none cal-py-2 cal-pl-2 cal-pr-4"
                  :class="{
                    'cal-bg-accent-base cal-text-white dark:cal-text-theme-900': active,
                    'cal-text-theme-900 dark:cal-text-theme-100': !active,
                  }"
                >
                  <span
                    class="cal-block cal-truncate"
                    :class="{
                      'cal-font-medium': selected,
                      'cal-font-normal': !selected,
                    }"
                  >
                    {{ tz }}
                  </span>
                </li>
              </ComboboxOption>
            </div>
          </ComboboxOptions>
        </TransitionRoot>
      </div>
    </Combobox>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from "vue";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from "@headlessui/vue";
import { ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { useCurrentTimezone, useConfig } from "@zaptime/vue-headless";
import { calendarMessages } from "../../generated/messages";

const { timezone, setTimezone } = useCurrentTimezone();
const { config } = useConfig(inject("calendarId"));

const messages = computed(() => calendarMessages(config.value.locale?.preset));
const timezones = computed(() => Array.from(new Set([timezone.value, "UTC", ...(typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["Europe/Prague", "America/New_York"])])));
const query = ref("");
const selectText = ref();
const setQuery = (value: string) => {
  query.value = value;
};
function setNewTimezone(value: string) {
  void setTimezone(value).catch(() => {});
}

function selectAllText(event: FocusEvent) {
  const input = event.target as HTMLInputElement;
  if (input) {
    input.select();
  }
}

const filteredTimezones = computed(() => {
  if (query.value === "") {
    return timezones.value;
  }

  return timezones.value.filter((timezone) => {
    return timezone.toLowerCase().includes(query.value.toLowerCase());
  });
});
</script>
