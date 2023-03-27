import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';

if (process.env.NODE_ENV === 'development') {
  import('../local.config').then((config) => {
    createApp(App, {
      config: config.default,
    }).mount('#app');
  });
} else {
  createApp(App).mount('#app');
}
