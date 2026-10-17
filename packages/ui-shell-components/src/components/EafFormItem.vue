<script setup lang="ts">
import type { EafField } from "../types/eaf-form";
import { computed, provide, reactive, watchEffect } from "vue";
import Message from "primevue/message";

export interface Props {
  /**
   * Field from `$f.fields`. Its path is the label's `for`, `data-testid` and
   * the slot's `id` (`v-slot="{ id }"` → `:id="id"`)
   */
  field: EafField;

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

const path = computed(() => props.field.$path);

// Its errors show here, not in the form's summary
watchEffect((onCleanup) => onCleanup(props.field.$display()));

const required = computed(() => props.field.$required);

const errorMessage = computed(() => props.field.$error);

const hasError = computed(() => errorMessage.value !== undefined);

// A press inside - e.g. on PrimeVue Password's eye, which takes no focus -
// moves focus out until it ends. pointerdown comes before that in every browser.
let pressed = false;
function onPointerDown() {
  pressed = true;
  const done = new AbortController();
  const release = () => {
    pressed = false;
    done.abort();
  };
  window.addEventListener("pointerup", release, { signal: done.signal });
  window.addEventListener("pointercancel", release, { signal: done.signal });
}

// Leaving the field checks it - not focus moving inside it, nor a press inside it
function onFocusOut(event: FocusEvent) {
  const item = event.currentTarget as HTMLElement;
  if (!item.contains(event.relatedTarget as Node | null) && !pressed) {
    props.field.$touch();
  }
}

// PrimeVue inputs at any depth read `invalid` from `$pcFormField` (as under
// PrimeVue Forms' FormField)
provide("$pcFormField", reactive({ $field: { invalid: hasError } }));
</script>

<template>
  <div
    :class="['flex flex-col gap-2', props.class]"
    :data-testid="path"
    @pointerdown="onPointerDown"
    @focusout="onFocusOut"
  >
    <!-- Label -->
    <label v-if="label" :for="path" :class="['font-medium', props.labelClass]">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <slot :id="path" :has-error="hasError" :error-message="errorMessage" />
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
