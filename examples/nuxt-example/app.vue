<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ZaptimeCalendar, reserve, confirm, book } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';

const calendarId1 = 'this-is-my-calendar-id';
const calendarId2 = 'this-is-my-calendar-id-2';

const config: ZaptimeConfig = {
  token: 'bINIbfBAOI8YOe5wYfJcwbx58l1Clapt',
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

const config2: ZaptimeConfig = {
  token: 'mjkzfnQrQzkFSNICYUkbhi9F8trZGKVe',
  apiBaseUrl: 'https://api.zaptime.test/',
};

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
});

async function onSubmit() {
  const res = await reserve({
    email: form.email,
    firstName: form.name.split(' ')[0],
    lastName: form.name.split(' ')[1],
    phone: form.phone,
    location: {
      type: 'in-person',
      value: '123 Main St, San Francisco, CA 94111, USA',
    },
    customFields: [
      {
        uuid: '104cf3ad-b1e9-494f-ac51-62eb3a4b4e61',
        value: form.company,
      },
    ],
  });
}

function onConfirm() {
  confirm({
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
  });
}
</script>

<style>
@import url('/node_modules/@zaptime/vue3/dist/style.css');
</style>
