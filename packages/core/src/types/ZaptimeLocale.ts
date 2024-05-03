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
    buttons?: {
      confirmBooking?: string;
      goBack?: string;
    };
    payments?: {
      price?: string;
      cardNumber?: string;
    };
  };
}
