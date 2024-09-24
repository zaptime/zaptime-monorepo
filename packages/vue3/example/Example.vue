<template>
  <div
    style="background-color: black; height: 100vh"
    class="cal-flex cal-px-4"
  >
    <div style="padding-top: 20px; padding-left: 20px">
      <button @click="reserveDemocall">Reserve reservation</button>

      <button @click="confirmDemocall">Confirm reservation</button>

      <button @click="refresh">refresh</button>

      <ZaptimeCalendar
        :config="config"
        :calendar-id="calendarId"
        @booking-confirmed="(data) => bookingConfirmed(data)"
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
import { ZaptimeConfig, reserve, confirm, ReservationResponse, useCalendar } from '@zaptime/core';
import { ref } from 'vue';

const { getDays } = useCalendar();
const calendarId = 'this-is-my-calendar-id';
function confirmDemocall() {
  confirm({
    calendarId,
  });
}

function reserveDemocall() {
  reserve({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.test',
    calendarId: calendarId,
  });
}

// const calypsoTheme: ZaptimeConfig['theme'] = {
//   mode: 'dark',
//   colors: {
//     accentLight: '#9e7700',
//     accentBase: '#ffc000',
//     accentDark: '#ffcc31',
//   },
// };

function refresh() {
  getDays();
}

function bookingConfirmed(reservation: ReservationResponse) {
  console.log('Booking confirmed', reservation.data.userEmail);
}

const config = ref<ZaptimeConfig>({
  //@ts-expect-error - This is a valid config
  token: import.meta.env.VITE_ZAP_KEY,

  // token: 'T7yScBeVefuiwwXyNvJDntql6TNZbc1D',

  // compact: false,

  apiBaseUrl: 'https://api.zaptime.test/',

  // hideLocation: true,
  // profileImage: '',

  // redirectAfterBookingUrl: 'https://google.com',

  // externalBooking: false,

  // min: 0,
  // max: 1,
  // externalBooking: false,
  // compact: true,

  // profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',

  // locale: {
  //   preset: 'en',

  //   hideTimePreferences: false,
  //   startDayOfWeek: 'sun',

  //   texts: {
  //     introduction: '<p>Book a <b>meeting</b> with me</p><p>new line</p>',
  //   },
  //   confirmationForm: {
  //     confirmBooking: 'Confirm booking',
  //     name: {
  //       label: 'Your name',
  //       placeholder: 'Enter your name',
  //     },

  //     email: {
  //       label: 'Your email',
  //       placeholder: 'Enter your email',
  //     },
  //     seats: {
  //       label: 'Number of seats',
  //       placeholder: 'Enter number of seats',
  //     },
  //     buttons: {
  //       confirmBooking: 'Confirm booking',
  //       goBack: 'Go back',
  //     },
  //   },
  // },
  // theme: calypsoTheme,
});
</script>

<style>
body {
  margin: 0;
}
</style>
