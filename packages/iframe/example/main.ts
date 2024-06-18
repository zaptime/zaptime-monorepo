import { createApp } from 'vue';
import App from './Example.vue';
import '../src/assets/style.css';

import { ZaptimeConfig } from '@zaptime/vue3';
import type { EventTypeGroup } from '../src/components/EventTypesGroup.vue';

declare global {
  interface Window {
    xprops: {
      type?: 'single' | 'group';
      config: ZaptimeConfig | EventTypeGroup;
      position: 'left' | 'center' | 'right';
    };
  }
}

createApp(App).mount('#app');
