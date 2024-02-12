<template>
  <App />
</template>

<script setup lang="ts">
import App from '../src/App.vue';

// Faking xprops for the example
window.xprops = {
  type: 'group',
  config: {
    token: 'mVlRIHzRWmI0ZYHDETlfDQsnRV9X4hZF',
  },
};
</script>
