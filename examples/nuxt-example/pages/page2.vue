<template>
  <NuxtLink to="/">Go To home</NuxtLink>

  {{ calendarId1 }}
  <ZaptimeCalendar
    :calendar-id="calendarId1"
    :config="config"
  ></ZaptimeCalendar>
</template>

<script lang="ts" setup>
import { ZaptimeCalendar, reserve, confirm, book } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';

const calendarId1 = 'this-is-my-calendar-id-2';
const config: ZaptimeConfig = {
  token: 'mjkzfnQrQzkFSNICYUkbhi9F8trZGKVe',
  apiBaseUrl: 'https://api.zaptime.test/',
  externalBooking: true,
  profileImage: '',
  locale: {
    texts: {
      introduction: '',
    },
  },

  hideLocation: true,
};
</script>
