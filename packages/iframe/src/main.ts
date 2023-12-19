import { createApp } from 'vue';
import App from './App.vue';
import { ZaptimeConfig, book as bookZaptime, reserve as reserveZaptime, confirm as confirmZaptime, cancel as cancelZaptime } from '@zaptime/vue3';

interface BookAndReservePayload {
  email: string;
  firstName?: string;
  lastName?: string;
  seats?: number;
  calendarId?: string;
}
declare global {
  interface Window {
    xprops: {
      config: ZaptimeConfig;
      onTimeSlotChanged(timeSlot: unknown): void;
    };

    ZaptimeProxy: {
      book(payload: BookAndReservePayload): void;
      reserve(payload: BookAndReservePayload): void;
      confirm(calendarId?: string): void;
      cancel(calendarId?: string): void;
    };
  }
}

window.ZaptimeProxy = {
  book(payload) {
    bookZaptime({ email: payload.email });
  },
  reserve(payload) {
    reserveZaptime({ email: payload.email });
  },
  confirm(calendarId) {
    confirmZaptime(calendarId);
  },
  cancel(calendarId) {
    cancelZaptime(calendarId);
  },
};

createApp(App).mount('#app');
