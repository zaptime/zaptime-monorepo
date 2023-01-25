<template>
  <div style="background-color: black; height: 100vh" class="cal-flex">
    <ZaptimeCalendar :config="config"></ZaptimeCalendar>
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
import { default as ZaptimeCalendar } from "../src/App.vue";
import IZapTimeTheme from "../src/types/IZapTimeTheme";
import { IZapTimeConfig } from "../dist/types/src/entry";

const calypsoTheme: IZapTimeTheme = {
  mode: "light",
  colors: {
    // 25: "#F6FEFC",
    // 50: "#F0FDF9",
    // 100: "#CCFBEF",
    // 200: "#99F6E0",
    // 300: "#5FE9D0",
    // 400: "#2ED3B7",
    // 500: "#15B79E",
    // 600: "#0E9384",
    // 700: "#107569",
    // 800: "#125D56",
    // 900: "#134E48",

    "accent--1": "#2ED3B7",
    "accent-0": "#15B79E",
    "accent-1": "#0E9384",
  },
};

const mullberyTheme: IZapTimeConfig["theme"] = {
  mode: "dark",
  colors: {
    25: "#F6FEFC",
    50: "#F0FDF9",
    100: "#CCFBEF",
    200: "#99F6E0",
    300: "#5FE9D0",
    400: "#2ED3B7",
    500: "#15B79E",
    600: "#0E9384",
    700: "#107569",
    800: "#125D56",
    900: "#134E48",
  },
};

const conf: IZapTimeConfig = {
  token: "kikuhNJV3zWBeIvIXGryWsubIEZ74dRX",
  min: 0,
  max: 1,
  compact: false,
  externalBooking: true,
  closestAvailableEvent: 3,
  locale: {
    preset: "cs",
    startDayOfWeek: "mon",
    texts: {
      chooseDate: "Vybrat datum",
      noEventAvailable: "Pro daný měsíc nejsou žádné volné termíny",
      choosePreferredTime: "Vyberte čas",
    },
  },
  theme: {
    preset: "basic",
    mode: "light",
    colors: {
      "accent--1": "#47ad00",
      "accent-0": "#47ad00",
      "accent-1": "#47ad00",
    },
  },
};

const config: IZapTimeConfig = {
  token: "kikuhNJV3zWBeIvIXGryWsubIEZ74dRX",

  compact: false,

  externalBooking: false,
  // min: 0,
  // max: 1,
  // externalBooking: false,
  // compact: true,
  // profileImage:
  //   'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',

  locale: {
    preset: "cs",
    startDayOfWeek: "mon",
    texts: {
      introduction: "",
    },
    confirmationForm: {
      confirmBooking: "Confirm booking",
      name: {
        label: "Your name",
        placeholder: "Enter your name",
      },
      email: {
        label: "Your email",
        placeholder: "Enter your email",
      },
      seats: {
        label: "Number of seats",
        placeholder: "Enter number of seats",
      },
      buttons: {
        confirmBooking: "Confirm booking",
        goBack: "Go back",
      },
    },
  },
  theme: calypsoTheme,
};

const config2: IZapTimeConfig = {
  token: "kikuhNJV3zWBeIvIXGryWsubIEZ74dRX",
  min: 0,
  max: 1,
  externalBooking: false,
  compact: true,
  profileImage:
    "https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

  locale: {
    preset: "en",
    startDayOfWeek: "sun",
    // texts: {
    //   introduction: 'www!',
    //   chooseDate:
    //     'Vyberte si prosím z&nbsp;kalendáře datum a&nbsp;čas demohovoru.',
    //   noEventAvailable: 'Pro daný měsíc již není žádný dostupný termín.',
    //   choosePreferredTime: 'What time works best?'
    // },
    // confirmationForm: {
    //   confirmBooking: 'Confirm booking',
    //   name: {
    //     label: 'Your name',
    //     placeholder: 'Enter your name'
    //   },
    //   email: {
    //     label: 'Your email',
    //     placeholder: 'Enter your email'
    //   },
    //   seats: {
    //     label: 'Number of seats',
    //     placeholder: 'Enter number of seats'
    //   },
    //   buttons: {
    //     confirmBooking: 'Confirm booking',
    //     goBack: 'Go back'
    //   }
    // }
  },
  theme: mullberyTheme,
};

const config3: IZapTimeConfig = {
  token: "kikuhNJV3zWBeIvIXGryWsubIEZ74dRX",
  min: 0,
  max: 1,
  externalBooking: false,
  compact: false,
  profileImage:
    "https://ca.slack-edge.com/T09T3PVEU-U3D2164MC-95827050dfca-512",

  locale: {
    preset: "cs",
    startDayOfWeek: "mon",
    texts: {
      introduction: "Prvotní konzultace",
      chooseDate: "Vyberte si prosím z&nbsp;kalendáře datum demohovoru.",
      noEventAvailable: "Pro daný měsíc již není žádný dostupný termín.",
      choosePreferredTime: "Který čas vám vyhovuje?",
    },
    confirmationForm: {
      confirmBooking: "Potvrdit konzultaci",
      name: {
        label: "Vaše jméno",
        placeholder: "Napište vaše jméno",
      },
      email: {
        label: "Váš email",
        placeholder: "Napište váš email",
      },
      seats: {
        label: "Number of seats",
        placeholder: "Enter number of seats",
      },
      buttons: {
        confirmBooking: "Potvrdit rezervaci",
        goBack: "Zpět",
      },
    },
  },
  theme: mullberyTheme,
};
</script>
