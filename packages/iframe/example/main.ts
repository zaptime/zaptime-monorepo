import { createApp } from 'vue';
import App from './Example.vue';
import '../src/assets/style.css';

import { ZaptimeConfig } from '@zaptime/vue3';
import type { MultipleEventTypesConfig } from '../src/components/MultipleEventTypes.vue';

declare global {
  interface Window {
    xprops: {
      type?: 'single' | 'multiple';
      config: ZaptimeConfig | MultipleEventTypesConfig;
    };
  }
}

createApp(App).mount('#app');
