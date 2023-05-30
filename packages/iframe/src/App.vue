<script setup lang="ts">
import { ZapTimeCalendar } from '@zaptime/vue3';
import { ref, onMounted } from 'vue';
import type { RequestConfig } from './buildConfigFromRequest';
import { buildConfigFromRequest } from './buildConfigFromRequest';

let config = window.xprops.config;
const remoteConfigLoaded = ref(false);

async function fetchRemoteConfig(token: string) {
  if (token) {
    type Response = {
      success: boolean;
      data: RequestConfig;
    };

    const res = await fetch(`https://my.zaptime.app/api/configuration?token=${token}`);
    const data: Response = await res.json();

    if (data.success) {
      config = buildConfigFromRequest(data.data, token);
    }
  }
}

onMounted(async () => {
  await fetchRemoteConfig(config.token);
  remoteConfigLoaded.value = true;
});

const onEventChanged = (event: unknown) => {
  if (window.xprops.onEventChanged) {
    window.xprops.onEventChanged(event);
  }
};
</script>

<template>
  <div v-if="remoteConfigLoaded">
    <ZapTimeCalendar
      :config="config"
      @event-changed="onEventChanged"
    ></ZapTimeCalendar>
  </div>
</template>

<style>
@import url('/node_modules/@zaptime/vue3/dist/style.css');
</style>
