<script setup lang="ts">
import { computed } from "vue";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const props = withDefaults(
    defineProps<{
        variant?: ButtonVariant;
        size?: ButtonSize;
        disabled?: boolean;
    }>(),
    {
        variant: "primary",
        size: "md",
        disabled: false,
    },
);

const variantClasses = computed(() => {
    const map: Record<ButtonVariant, string> = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary:
            "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        ghost:
            "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
    };
    return map[props.variant];
});

const sizeClasses = computed(() => {
    const map: Record<ButtonSize, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };
    return map[props.size];
});
</script>

<template>
    <button :class="[
        'eaf-button inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses,
        sizeClasses,
    ]" :disabled="disabled" v-bind="$attrs">
        <slot />
    </button>
</template>

<style scoped>
.eaf-button {
    cursor: pointer;
}
</style>