<template>
  <div class="">
    <label
      :for="name"
      class="cal:block cal:text-sm cal:font-medium cal:text-theme-500 cal:dark:text-theme-200"
    >
      {{ label }}
    </label>
    <select
      v-model="model"
      :name="name"
      class="cal:form-select cal:mt-2 cal:block cal:w-full cal:rounded-md cal:border cal:border-theme-300 cal:bg-theme-50 cal:px-5 cal:py-3.5 cal:text-base cal:font-medium cal:text-theme-900 cal:placeholder-theme-400 cal:focus:border-theme-400 cal:focus:outline-hidden cal:focus:ring-theme-500 cal:dark:border-theme-600 cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:placeholder-theme-500 cal:dark:focus:border-theme-400 cal:sm:text-sm"
    >
      <option
        v-for="option of options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
<script setup lang="ts">
export type Option = {
  value: string;
  label: string;
};

defineProps<{
  label: string;
  name: string;
  options: Option[];
}>();

const model = defineModel();
</script>
