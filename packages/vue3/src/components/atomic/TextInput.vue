<template>
  <div>
    <label
      :for="name"
      class="cal:block cal:text-sm cal:font-medium cal:text-theme-500 cal:dark:text-theme-200"
    >
      {{ label }}
    </label>
    <div class="cal:mt-2">
      <input
        v-model="model"
        :required="required"
        :type="type"
        :name="name"
        :autocomplete="autocomplete"
        class="cal:block cal:w-full cal:rounded-md cal:border cal:border-theme-300 cal:bg-theme-50 cal:px-5 cal:py-3.5 cal:text-base cal:font-medium cal:text-theme-900 cal:placeholder-theme-400 cal:focus:border-theme-400 cal:focus:outline-hidden cal:focus:ring-theme-500 cal:dark:border-theme-600 cal:dark:bg-theme-800 cal:dark:text-theme-100 cal:dark:placeholder-theme-500 cal:dark:focus:border-theme-400 cal:sm:text-sm"
        :placeholder="placeholder"
        @blur="emit('blur')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue', 'blur']);

const model = defineModel();

interface Props {
  label: string;
  required?: boolean;
  type: string;
  name: string;
  autocomplete: string;
  placeholder?: string;
}
withDefaults(defineProps<Props>(), {
  required: false,
});
</script>
