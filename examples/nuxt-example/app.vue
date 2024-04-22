<template>
  <ZaptimeCalendar :config="config"></ZaptimeCalendar>
</template>

<script lang="ts" setup>
import { ZaptimeCalendar } from '@zaptime/vue3';
import type { ZaptimeConfig } from '@zaptime/vue3';

const config: ZaptimeConfig = {
  token: 'XxAhjGJ4vZlwjQkQtU82SeOymDUcqgnE',
};
</script>

<style>
@import url('/node_modules/@zaptime/vue3/dist/style.css');
</style>
