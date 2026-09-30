<script setup lang="ts">
import type { EafField } from "../types/eaf-form";
import { computed, provide, reactive } from "vue";
import Message from "primevue/message";

export interface Props {
  /**
   * Field from `$f.fields`. Its path is the label's `for`, `data-testid` and
   * the slot's `id` (`v-slot="{ id }"` → `:id="id"`)
   */
  for: EafField;

  /**
   * Label text (optional)
   */
  label?: string;

  /**
   * Additional class for the wrapper
   */
  class?: string;

  /**
   * Additional class for the `<label>` element
   */
  labelClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  class: "",
  labelClass: "",
});

const path = computed(() => props.for.$path);

const required = computed(() => props.for.$required);

const errorMessage = computed(() => props.for.$error);

const hasError = computed(() => errorMessage.value !== undefined);

// PrimeVue inputs at any depth read `invalid` from `$pcFormField` (as under
// PrimeVue Forms' FormField)
provide("$pcFormField", reactive({ $field: { invalid: hasError } }));
</script>

<template>
  <div
    :class="['flex flex-col gap-2', props.class]"
    :data-testid="path"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="path"
      :class="['font-medium', props.labelClass]"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </label>

    <slot
      :id="path"
      :has-error="hasError"
      :error-message="errorMessage"
    />
    <!-- Error message -->
    <Message
      v-if="hasError"
      severity="error"
      size="small"
      variant="simple"
      :data-testid="`${path}-error`"
    >
      {{ errorMessage }}
    </Message>
  </div>
</template>
