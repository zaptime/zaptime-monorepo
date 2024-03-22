<template>
  <App />
</template>

<script setup lang="ts">
import App from '../src/App.vue';

// @ts-expect-error Faking xprops for the example
window.xprops = {
  config: {
    token: 'j7TGKJbtwCJ6whtf7x6pG4nFWuilagWE',
  },
};
</script>
