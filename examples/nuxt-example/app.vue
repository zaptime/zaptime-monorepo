<template>
  <ZaptimeCalendar :config="config"></ZaptimeCalendar>

  <form @submit.prevent="onSubmit">
    <input
      v-model="form.company"
      type="text"
      name="name"
      placeholder="Company"
      required
    />
    <input
      v-model="form.email"
      type="email"
      name="email"
      placeholder="Email"
      required
    />
    <input
      v-model="form.name"
      type="text"
      name="name"
      placeholder="Name"
      required
    />
    <input
      v-model="form.phone"
      type="tel"
      name="phone"
      placeholder="Phone"
      required
    />

    <button type="submit">Submit</button>
  </form>

  <form @submit.prevent="onConfirm">
    <button type="submit">confirm</button>
  </form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ZaptimeCalendar, reserve, confirm, book } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';

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
