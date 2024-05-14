<template>
  <SelectInput
    v-model="model"
    :label="label"
    :options="countries"
    name="country"
  >
  </SelectInput>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SelectInput from './SelectInput.vue';

const model = defineModel();

const props = defineProps<{
  defaultCountry: string;
  label: string;
}>();

const countries = ref<{ value: string; label: string }[]>([]);

async function getAllCountries() {
  const res = await fetch('https://api.zaptime.app/countries', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  countries.value = Object.keys(data.data).map((key) => {
    return {
      value: key,
      label: data.data[key],
    };
  });

  model.value = props.defaultCountry;
}

onMounted(async () => {
  await getAllCountries();
});
</script>
