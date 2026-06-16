<script setup lang="ts">
import { computed, onMounted, onUnmounted, useSlots, cloneVNode, type VNode } from "vue";
import type { FormValidation } from "../types";

interface Props {
    field: string;
    form: FormValidation;
    modelValue?: unknown;
    label?: string;
    required?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "",
    required: false,
    class: "",
    modelValue: undefined,
});

const slots = useSlots();

onMounted(() => {
    if (props.form?.registerField) {
        props.form.registerField(props.field);
    }
});

onUnmounted(() => {
    if (props.form?.unregisterField) {
        props.form.unregisterField(props.field);
    }
});

const hasError = computed(() =>
    props.form?.hasFieldError ? props.form.hasFieldError(props.field) : false,
);

const errorMessage = computed(() =>
    props.form?.getFieldError ? props.form.getFieldError(props.field) : "",
);

const inputId = computed(() => `field-${props.field}`);

const addInvalidClass = (vnodes: VNode[] | undefined): VNode[] | undefined => {
    if (!vnodes) return vnodes;

    return vnodes.map((vnode) => {
        if (typeof vnode.type === "symbol") return vnode;

        const existingClass = vnode.props?.class || "";
        let newClass = existingClass;
        if (hasError.value) {
            newClass = existingClass
                ? `${existingClass} p-invalid`
                : "p-invalid";
        }

        return cloneVNode(vnode, {
            class: newClass,
            name: `field-${props.field}`,
        });
    });
};

const renderSlot = () => {
    const slotted = slots.default?.();
    return addInvalidClass(slotted);
};
</script>

<template>
    <div class="form-item flex flex-col gap-1">
        <label v-if="label" :for="inputId" class="text-sm font-medium text-surface-700 dark:text-surface-300">
            {{ label }}
            <span v-if="required" class="text-red-500 ml-0.5">*</span>
        </label>

        <div class="form-item-input">
            <renderSlot />
        </div>

        <small v-if="hasError && typeof errorMessage === 'string'" class="text-red-500">
            {{ errorMessage }}
        </small>

        <slot name="hint" />
    </div>
</template>