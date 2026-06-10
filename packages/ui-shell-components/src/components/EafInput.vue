<script setup lang="ts">
import { useId } from "../composables/useFormValidation";

const inputId = useId();

defineProps<{
  modelValue?: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="eaf-input-group">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="eaf-input block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600"
    >
      {{ error }}
    </p>
    <p
      v-if="hint && !error"
      class="mt-1 text-sm text-slate-500"
    >
      {{ hint }}
    </p>
  </div>
</template>