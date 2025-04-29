import ZaptimeConfig from "./types/ZaptimeConfig";

const config: ZaptimeConfig = {
  token: "oG77Ft7Wv6v9stJTOw8cbMmW7zENDzXl",
  locale: {
    preset: "en",
    texts: {
      chooseDate: "Choose a date",
      noTimeSlotAvailable: "There is no time slot available for chosen month.",
      choosePreferredTime: "Choose preferred time",
      pickTime: "Pick a time",
    },
    confirmationForm: {
      confirmBooking: "Confirm booking",
      reschedulingEvent: "Rescheduling event",
      buttons: {
        confirmBooking: "Confirm booking",
        reschedule: "Reschedule",
        goBack: "Go back",
      },
      payments: {
        showBillingDetails: "Vyplnit fakturační údaje",
        price: "Price",
        cardNumber: "Card number",
        name: "Name",
        email: "Email",
        company: "Company",
        address: "Address",
        city: "City",
        zip: "Postal code",
        country: "Country",
        vatId: "Vat ID",
        crn: "CRN",
      },
    },
  },
  theme: {
    preset: "basic",
    borderRadius: "0.375rem",
  },
};

export default config;
