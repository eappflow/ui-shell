<script setup lang="ts" generic="T extends object">
import { EafForm } from "../types/eaf-form";
import { computed, useSlots, cloneVNode, type VNode } from "vue";

export interface Props<T> {
  /**
   * Field key for validation
   * Must match the API field name for validation to work (e.g., 'email', 'firstName')
   */
  for: Extract<keyof T, string>;

  /**
   * Form validation object from useEafFormValidation
   */
  form: EafForm<T>;

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

const props = withDefaults(defineProps<Props<T>>(), {
  label: "",
  class: "",
  labelClass: "",
});

const required = computed(() => props.form.isFieldRequired(props.for));
const slots = useSlots();

// Computed helpers
const hasError = computed(() => {
  return props.form?.hasFieldError
    ? props.form.hasFieldError(props.for)
    : false;
});

const errorMessage = computed(() => {
  return props.form?.getFieldError ? props.form.getFieldError(props.for) : "";
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
      name: props.for,
    });
  });
};

// Render function for slot content with p-invalid class
const renderSlot = () => {
  const defaultSlot = slots.default?.({
    hasError: hasError.value,
    errorMessage: errorMessage.value,
    field: props.for,
  });

  const processedNodes = addInvalidClassAndName(defaultSlot);
  return processedNodes || [];
};
</script>

<template>
  <div
    :class="['flex flex-col gap-2', props.class, hasError ? 'p-invalid' : '']"
    :data-testid="props.for"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="props.for"
      :class="['font-medium', props.labelClass]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Slot with p-invalid class on children when hasError -->
    <component :is="renderSlot" />
    <!-- Error message -->
    <small
      v-if="hasError"
      class="text-red-500"
      :data-testid="`${props.for}-error`"
    >
      {{ errorMessage }}
    </small>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
