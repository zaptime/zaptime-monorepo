export default interface ZaptimeLocale {
  preset?: string;
  startDayOfWeek?: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  headers?: {
    mon?: string;
    tue?: string;
    wed?: string;
    thu?: string;
    fri?: string;
    sat?: string;
    sun?: string;
  };
  hideTimePreferences?: boolean;
  texts?: {
    introduction?: string;
    chooseDate?: string;
    noTimeSlotAvailable?: string;
    choosePreferredTime?: string;
    pickTime?: string;
  };

  confirmationForm?: {
    confirmBooking?: string;
    reschedulingEvent?: string;
    buttons?: {
      confirmBooking?: string;
      reschedule?: string;
      goBack?: string;
    };
    payments?: {
      showBillingDetails: string;
      price: string;
      cardNumber: string;
      name: string;
      email: string;
      company: string;
      address: string;
      city: string;
      zip: string;
      country: string;
      vatId: string;
      crn: string;
    };
  };
}
