<script setup lang="ts">
import type { EafField } from "../types/eaf-form";
import { computed, useSlots, cloneVNode, type VNode } from "vue";
import { EAF_FIELD_SHOW_ALL_ERRORS } from "../composables/eafFields";

export interface Props {
  /**
   * Field handle from `useEafForm`, e.g. `$f.fields.email` or
   * `$f.fields.address.street`
   *
   * Its `$path` is used for the label's `for`, the `name` of the slotted
   * input and `data-testid` (`"address.street"`, errors under
   * `"address.street-error"`); `$required` drives the asterisk and
   * `$error`/`$errors` the error message.
   */
  field: EafField<unknown>;

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

const slots = useSlots();

/** Dot path of the field ("email", "address.street") */
const fieldPath = computed<string>(() => props.field.$path);

const required = computed<boolean>(() => props.field.$required);

const hasError = computed<boolean>(() => props.field.$errors.length > 0);

/**
 * First error message, or all of them when the form was created with
 * `showAllErrors` (same contract as `EafForm.getFieldError`)
 */
const errorMessage = computed<string | string[] | undefined>(() => {
  const field = props.field;
  const showAllErrors =
    (field as unknown as Record<symbol, unknown>)[EAF_FIELD_SHOW_ALL_ERRORS] ===
    true;
  return showAllErrors ? field.$errors : field.$error;
});

/** Error messages to render, one per line */
const errorMessages = computed<string[]>(() => {
  const message = errorMessage.value;
  if (message === undefined) {
    return [];
  }
  return Array.isArray(message) ? message : [message];
});

// Function to add p-invalid class to VNodes
const addInvalidClassAndName = (
  vnodes: VNode[] | undefined,
): VNode[] | undefined => {
  if (!vnodes) return vnodes;

  return vnodes.map((vnode) => {
    // Skip text nodes and comments
    if (
      typeof vnode.type === "symbol" &&
      vnode.type.toString().includes("Text")
    ) {
      return vnode;
    }
    if (
      typeof vnode.type === "symbol" &&
      vnode.type.toString().includes("Comment")
    ) {
      return vnode;
    }

    // Clone the vnode and add p-invalid class
    const existingClass = vnode.props?.class || "";
    let newClass = existingClass;
    if (hasError.value) {
      newClass = existingClass ? `${existingClass} p-invalid` : "p-invalid";
    }

    return cloneVNode(vnode, {
      class: newClass,
      name: fieldPath.value,
    });
  });
};

// Render function for slot content with p-invalid class
const renderSlot = () => {
  const defaultSlot = slots.default?.({
    hasError: hasError.value,
    errorMessage: errorMessage.value,
    // Field path ("address.street"), not the handle
    field: fieldPath.value,
  });

  const processedNodes = addInvalidClassAndName(defaultSlot);
  return processedNodes || [];
};
</script>

<template>
  <div
    :class="['flex flex-col gap-2', props.class, hasError ? 'p-invalid' : '']"
    :data-testid="fieldPath"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="fieldPath"
      :class="['font-medium', props.labelClass]"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </label>

    <!-- Slot with p-invalid class on children when hasError -->
    <component :is="renderSlot" />
    <!-- Error message -->
    <small
      v-if="hasError"
      class="text-red-500"
      :data-testid="`${fieldPath}-error`"
    >
      <template v-if="errorMessages.length <= 1">
        {{ errorMessages[0] }}
      </template>
      <template v-else>
        <span
          v-for="(message, index) in errorMessages"
          :key="index"
          class="block"
        >{{ message }}</span>
      </template>
    </small>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
