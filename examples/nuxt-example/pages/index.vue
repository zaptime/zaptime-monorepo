<template>
  <NuxtLink to="/page2">Go to page 2</NuxtLink>

  {{ calendarId1 }}
  <ZaptimeCalendar :calendar-id="calendarId1" :config="config"></ZaptimeCalendar>

  <ZaptimeCalendar :calendar-id="calendarId2" :config="config2"></ZaptimeCalendar>
</template>

<script lang="ts" setup>
import { ZaptimeCalendar, reserve, confirm, book } from "@zaptime/vue3";
import type { ZaptimeConfig } from "@zaptime/vue3";

const calendarId1 = "this-is-my-calendar-id";
const config: ZaptimeConfig = {
  token: "qM0IbQM2g0Mgk9ftP3yQgFVNbixazEPp",
  // apiBaseUrl: "https://api.zaptime.test/",
  // externalBooking: true,
  profileImage: "",
  locale: {
    texts: {
      introduction: "",
    },
  },

  hideLocation: true,
};

const calendarId2 = "this-is-my-calendar-id-2";
const config2: ZaptimeConfig = {
  token: "mjkzfnQrQzkFSNICYUkbhi9F8trZGKVe",
  apiBaseUrl: "https://api.zaptime.test/",
  externalBooking: true,
  profileImage: "",
  locale: {
    texts: {
      introduction: "",
    },
  },

  hideLocation: true,
};
</script>
