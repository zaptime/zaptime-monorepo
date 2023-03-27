export default interface IZapTimeLocale {
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
  texts?: {
    introduction?: string;
    chooseDate?: string;
    noEventAvailable?: string;
    choosePreferredTime?: string;
  };

  confirmationForm?: {
    confirmBooking?: string;
    name?: {
      label?: string;
      placeholder?: string;
    };
    email?: {
      label?: string;
      placeholder?: string;
    };
    seats?: {
      label?: string;
      placeholder?: string;
    };
    buttons?: {
      confirmBooking?: string;
      goBack?: string;
    };
  };
}
