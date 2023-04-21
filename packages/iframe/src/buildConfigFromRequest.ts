import type { IZapTimeConfig } from '@zaptime/vue3';

export type RequestConfig = {
  language: 'en' | 'cs';
  primaryColor: string;
  secondaryColor: string;
  activeTextColor: string;
  startDayOfTheWeek: 'mon' | 'sun';
  closestBookableDay: number;
  secondaryColorHover: string;
  chooseDateLocaleText: string;
  visibleMonthsInThePast: number;
  visibleMonthsInTheFuture: number;
  noEventAvailableLocaleText: string;
  choosePreferredTimeLocaleText: string;
};
export const buildConfigFromRequest = (request: RequestConfig, token: string): IZapTimeConfig => {
  return {
    token: token,
    min: request.visibleMonthsInThePast || 0,
    max: request.visibleMonthsInTheFuture || 2,
    closestAvailableEvent: request.closestBookableDay || 3,
    locale: {
      preset: request.language,
      startDayOfWeek: request.startDayOfTheWeek,

      texts: {
        chooseDate: request.chooseDateLocaleText,
        noEventAvailable: request.noEventAvailableLocaleText,
        choosePreferredTime: request.choosePreferredTimeLocaleText,
      },

      // confirmationForm: {
      //     confirmBooking: confirmBookingLocaleText.value,
      //     name: {
      //         label: nameFormInputLocaleText.value.label,
      //         placeholder: nameFormInputLocaleText.value.placeholder
      //     },
      //     email: {
      //         label: emailFormInputLocaleText.value.label,
      //         placeholder: emailFormInputLocaleText.value.placeholder
      //     },
      //     buttons: {
      //         confirmBooking: confirmationButtonLocaleText.value,
      //         goBack: goBackButtonLocaleText.value
      //     }
      // }
    },
    theme: {
      mode: 'light',
      colors: {
        'accent--1': request.primaryColor,
        'accent-0': request.secondaryColorHover,
        'accent-1': request.secondaryColor,
      },
    },
  };
};
