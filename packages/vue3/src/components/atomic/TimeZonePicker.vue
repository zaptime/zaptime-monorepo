<template>
  <div class="cal:w-full">
    <Combobox
      :model-value="timezone"
      @update:model-value="setNewTimezone"
      @mouseover="getTimezones"
    >
      <div class="cal:relative cal:mt-1">
        <div
          class="cal:relative cal:w-full cal:cursor-default cal:overflow-hidden cal:rounded-md cal:bg-white cal:text-left cal:focus:outline-hidden cal:focus:ring-accent-base cal:focus-visible:ring-2 cal:focus-visible:ring-accent-base cal:focus-visible:ring-opacity-75 cal:focus-visible:ring-offset-2 cal:focus-visible:ring-offset-teal-300 cal:dark:bg-theme-700 cal:sm:text-sm"
        >
          <ComboboxInput
            id="zaptime-timezone-picker"
            ref="selectText"
            class="cal:w-full cal:border-none cal:bg-theme-100 cal:py-2 cal:pl-3 cal:pr-10 cal:text-xs cal:leading-5 cal:text-theme-900 cal:focus:outline-hidden cal:focus:ring-0 cal:dark:bg-theme-800 cal:dark:text-theme-100"
            :displayValue="() => timezone"
            @change="setQuery($event.target.value)"
            @focus="selectAllText"
          />
          <ComboboxButton class="cal:absolute cal:inset-y-0 cal:right-0 cal:flex cal:items-center cal:pr-2">
            <ChevronUpDownIcon
              class="cal:h-5 cal:w-5 cal:text-theme-400"
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>
        <TransitionRoot
          leave="cal:transition cal:ease-in cal:duration-100"
          leaveFrom="cal:opacity-100 "
          leaveTo="cal:opacity-0"
          enter="cal:transition-all cal:duration-300 cal:ease-out"
          enter-from="cal:opacity-0 cal:-translate-y-[30px]"
          enter-to="cal:opacity-100 cal:-translate-y-[36px]"
          @after-leave="query = ''"
        >
          <ComboboxOptions
            class="cal:absolute cal:-top-3 cal:mt-1 cal:max-h-60 cal:w-[300px] cal:-translate-y-full cal:overflow-auto cal:rounded-md cal:border cal:border-theme-200 cal:bg-theme-100 cal:py-1 cal:pl-0 cal:text-base cal:shadow-lg cal:ring-1 cal:ring-black cal:ring-opacity-5 cal:focus:outline-hidden cal:dark:border-theme-600 cal:dark:bg-theme-800 cal:sm:text-sm"
          >
            <div
              v-if="timezones.length === 0 && query !== ''"
              class="cal:relative cal:cursor-default cal:select-none cal:px-4 cal:py-2 cal:text-theme-700 cal:dark:text-theme-100"
            >
              Nothing found.
            </div>

            <div
              v-for="(tz, id) in filteredTimezones"
              :key="id"
            >
              <ComboboxOption
                v-slot="{ selected, active }"
                as="template"
                :value="tz"
              >
                <li
                  class="cal:relative cal:cursor-default cal:select-none cal:list-none cal:py-2 cal:pl-2 cal:pr-4"
                  :class="{
                    'cal:bg-accent-base cal:text-white cal:dark:text-theme-900': active,
                    'cal:text-theme-900 cal:dark:text-theme-100': !active,
                  }"
                >
                  <span
                    class="cal:block cal:truncate"
                    :class="{ 'cal:font-medium': selected, 'cal:font-normal': !selected }"
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
import { ref, computed, inject, watch } from 'vue';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from '@headlessui/vue';
import { ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { useCurrentTimezone, useCalendar, useConfig } from '@zaptime/core';
import { useDebounceFn } from '@vueuse/core';

const { timezone, setTimezone } = useCurrentTimezone();
const { getDays } = useCalendar(inject('calendarId'));
const { config } = useConfig(inject('calendarId'));

const timezones = ref<string[]>([]);

const query = ref('');
const selectText = ref();

// Refetch days to update the calendar
// for cases where the timezone is changed
// and some days are suddenly empty
watch(timezone, () => {
  getDays();
});

const setQuery = useDebounceFn(
  (newQuery: string) => {
    console.log('test');

    query.value = newQuery;
  },
  500,
  { maxWait: 5000 },
);

function setNewTimezone(newTz: string) {
  setTimezone(newTz);
}

async function fetchTimezone() {
  try {
    const baseUrl = config.value.apiBaseUrl || 'https://api.zaptime.app/';
    const res = await fetch(baseUrl + 'timezones');

    const json = await res.json();

    timezones.value = json.data;
  } catch (err) {
    console.error('Error fetching timezones', err);
  }
}

async function getTimezones() {
  if (timezones.value.length === 0) {
    await fetchTimezone();
  }
}

function selectAllText() {
  const input = document.querySelector('#zaptime-timezone-picker') as HTMLInputElement;
  if (input) {
    input.select();
  }
}

const filteredTimezones = computed(() => {
  if (query.value === '') {
    return timezones.value;
  }

  return timezones.value.filter((timezone) => {
    return timezone.toLowerCase().includes(query.value.toLowerCase());
  });
});
</script>
