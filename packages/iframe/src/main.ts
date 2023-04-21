import { createApp } from 'vue';
import App from './App.vue';
import { IZapTimeConfig, book as bookZaptime, reserve as reserveZaptime, confirm as confirmZaptime, cancel as cancelZaptime } from '@zaptime/vue3';

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
      config: IZapTimeConfig;
      onEventChanged(event: unknown): void;
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
    bookZaptime(payload.email);
  },
  reserve(payload) {
    reserveZaptime(payload.email);
  },
  confirm(calendarId) {
    confirmZaptime(calendarId);
  },
  cancel(calendarId) {
    cancelZaptime(calendarId);
  },
};

createApp(App).mount('#app');
