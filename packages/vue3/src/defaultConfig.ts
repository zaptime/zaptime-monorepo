import IZapTimeConfig from "./types/IZapTimeConfig";

const config: IZapTimeConfig = {
  token: "oG77Ft7Wv6v9stJTOw8cbMmW7zENDzXl",
  locale: {
    preset: "en",
    texts: {
      chooseDate: "Choose date",
      noEventAvailable: "There is no event available for chosen month.",
      choosePreferredTime: "Choose preferred time",
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
  theme: {
    preset: "basic",
    borderRadius: "0.375rem",
  },
};

export default config;
