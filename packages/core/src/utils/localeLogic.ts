import ZaptimeLocale from "../types/ZaptimeLocale";
import DfnsConfig from "../types/DfnsConfig";

import { format } from "date-fns";
export const getHeaders = (locale: ZaptimeLocale, dfnsConfig: DfnsConfig): string[] => {
  let sun = "";

  if (locale && locale.headers && locale.headers.sun) {
    sun = locale.headers.sun;
  } else {
    sun = format(new Date(2020, 11, 6), "cccccc", dfnsConfig);
  }

  let mon = "";

  if (locale && locale.headers && locale.headers.mon) {
    mon = locale.headers.mon;
  } else {
    mon = format(new Date(2020, 11, 7), "cccccc", dfnsConfig);
  }

  let tue = "";

  if (locale && locale.headers && locale.headers.tue) {
    tue = locale.headers.tue;
  } else {
    tue = format(new Date(2020, 11, 8), "cccccc", dfnsConfig);
  }

  let wed = "";

  if (locale && locale.headers && locale.headers.wed) {
    wed = locale.headers.wed;
  } else {
    wed = format(new Date(2020, 11, 9), "cccccc", dfnsConfig);
  }

  let thu = "";

  if (locale && locale.headers && locale.headers.thu) {
    thu = locale.headers.thu;
  } else {
    thu = format(new Date(2020, 11, 10), "cccccc", dfnsConfig);
  }

  let fri = "";

  if (locale && locale.headers && locale.headers.fri) {
    fri = locale.headers.fri;
  } else {
    fri = format(new Date(2020, 11, 11), "cccccc", dfnsConfig);
  }

  let sat = "";

  if (locale && locale.headers && locale.headers.sat) {
    sat = locale.headers.sat;
  } else {
    sat = format(new Date(2020, 11, 12), "cccccc", dfnsConfig);
  }

  const autoHeaders = [sun, mon, tue, wed, thu, fri, sat];

  const startOfTheWeekIndex = getStartOfTheWeekIndex(locale);

  if (startOfTheWeekIndex !== 0) {
    const elementsToBeMoved = [];

    for (let i = 0; i < startOfTheWeekIndex; i++) {
      const shifted = autoHeaders.shift();
      elementsToBeMoved.push(shifted);
    }

    for (const shifted of elementsToBeMoved) {
      if (shifted !== undefined) {
        autoHeaders.push(shifted);
      }
    }
  }

  return autoHeaders;
};

export const getStartOfTheWeekIndex = (locale: ZaptimeLocale): number => {
  const dayToIndex = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  if (locale.startDayOfWeek) {
    return dayToIndex[locale.startDayOfWeek];
  }

  return 0;
};
