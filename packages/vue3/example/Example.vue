<template>
  <div
    style="background-color: black; height: 100vh"
    class="cal-flex cal-px-4"
  >
    <div style="padding-top: 20px; padding-left: 20px">
      <ZaptimeCalendar
        calendarId="calendar-1"
        :config="config"
      ></ZaptimeCalendar>
    </div>

    <!-- <ZaptimeCalendar
      :config="config2"
      calendarId="calendar-2"
    ></ZaptimeCalendar>
    <ZaptimeCalendar
      :config="config3"
      calendarId="calendar-3"
    ></ZaptimeCalendar> -->
  </div>
</template>

<script setup lang="ts">
import { default as ZaptimeCalendar } from '../src/App.vue';
import IZapTimeTheme from '../src/types/IZapTimeTheme';
import { IZapTimeConfig } from '../dist/types/src/entry';

const calypsoTheme: IZapTimeTheme = {
  mode: 'light',
  colors: {
    'accent--1': '#2ED3B7',
    'accent-0': '#15B79E',
    'accent-1': '#0E9384',
  },
};

const config: IZapTimeConfig = {
  token: 'kikuhNJV3zWBeIvIXGryWsubIEZ74dRX',

  compact: true,

  externalBooking: false,
  // min: 0,
  // max: 1,
  // externalBooking: false,
  // compact: true,
  profileImage: 'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',

  locale: {
    preset: 'en',
    startDayOfWeek: 'sun',
    texts: {
      introduction: 'Hello mother fucker',
    },
    confirmationForm: {
      confirmBooking: 'Confirm booking',
      name: {
        label: 'Your name',
        placeholder: 'Enter your name',
      },

      email: {
        label: 'Your email',
        placeholder: 'Enter your email',
      },
      seats: {
        label: 'Number of seats',
        placeholder: 'Enter number of seats',
      },
      buttons: {
        confirmBooking: 'Confirm booking',
        goBack: 'Go back',
      },
    },
  },
  theme: calypsoTheme,
};
</script>

<style>
body {
  margin: 0;
}
</style>
