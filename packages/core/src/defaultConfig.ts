import IZapTimeConfig from "./types/IZapTimeConfig";

const config: IZapTimeConfig = {
  token: "ftwIxLA2ZHvPnDN04WAXpt0q0srSfV49",
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
  },
};

export default config;
