<script setup lang="ts">
import { EafFormValidation } from '@/types/api-error'
import { computed, onMounted, onUnmounted, useSlots, cloneVNode, type VNode } from 'vue'


interface Props {
  /**
   * Field key for validation
   * Must match the API field name for validation to work (e.g., 'email', 'firstName')
   */
  field: string

  /**
   * Form validation object from useEafFormValidation
   */
  form: EafFormValidation

  /**
   * Model value (v-model support)
   */
  modelValue?: unknown

  /**
   * Label text (optional)
   */
  label?: string

  /**
   * Whether field is required (shows asterisk)
   */
  required?: boolean

  /**
   * Additional class for the wrapper
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  class: '',
  modelValue: undefined,
})

const slots = useSlots()

// Auto-register field on mount
onMounted(() => {
  if (props.form?.registerField) {
    props.form.registerField(props.field)
  }
})

// Cleanup: unregister field on unmount
onUnmounted(() => {
  if (props.form?.unregisterField) {
    props.form.unregisterField(props.field)
  }
})

// Computed helpers
const hasError = computed(() => {
  return props.form?.hasFieldError ? props.form.hasFieldError(props.field) : false
})

const errorMessage = computed(() => {
  return props.form?.getFieldError ? props.form.getFieldError(props.field) : ''
})

const inputId = computed(() => `field-${props.field}`)

// Function to add p-invalid class to VNodes
const addInvalidClassAndName = (vnodes: VNode[] | undefined): VNode[] | undefined => {
  if (!vnodes) return vnodes

  return vnodes.map(vnode => {
    // Skip text nodes and comments
    if (typeof vnode.type === 'symbol' && vnode.type.toString().includes('Text')) {
      return vnode
    }
    if (typeof vnode.type === 'symbol' && vnode.type.toString().includes('Comment')) {
      return vnode
    }

    // Clone the vnode and add p-invalid class
    const existingClass = vnode.props?.class || ''
    let newClass = existingClass;
    if (hasError.value) {
      newClass = existingClass ? `${existingClass} p-invalid` : 'p-invalid'
    }

    return cloneVNode(vnode, {
      class: newClass,
      name: `field-${props.field}`
    })
  })
}

// Render function for slot content with p-invalid class
const renderSlot = () => {
  const defaultSlot = slots.default?.({
    hasError: hasError.value,
    errorMessage: errorMessage.value,
    field: props.field
  })

  const processedNodes = addInvalidClassAndName(defaultSlot)
  return processedNodes || []
}


</script>

<template>
  <div :class="['flex flex-col gap-2', props.class, hasError ? 'p-invalid' : '']">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Slot with p-invalid class on children when hasError -->
    <component :is="renderSlot" />
    <!-- Error message -->
    <small v-if="hasError" class="text-red-500">
      {{ errorMessage }}
    </small>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
