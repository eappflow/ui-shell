<script setup lang="ts">
import { computed, unref } from "vue";
import Message from "primevue/message";
import type { FormValidation } from "../types";

interface Props {
    form?: FormValidation;
    severity?: "error" | "warn" | "info" | "success";
    generalMessage?: string;
    summaryErrors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    form: undefined,
    severity: "error",
    generalMessage: "",
    summaryErrors: () => [],
});

const message = computed(() => {
    const formMessage = props.form?.generalMessage
        ? (unref(props.form.generalMessage) as string)
        : "";
    return formMessage || props.generalMessage || "";
});

const errors = computed(() => {
    const formErrors = props.form?.summaryErrors
        ? (unref(props.form.summaryErrors) as string[])
        : [];
    return formErrors.length > 0 ? formErrors : props.summaryErrors || [];
});

const hasContent = computed(() => message.value !== "" || errors.value.length > 0);
</script>

<template>
    <Message v-if="hasContent" :severity="severity" :closable="false" class="mb-4">
        <div class="flex flex-col gap-2">
            <div v-if="message" class="font-semibold">{{ message }}</div>
            <ul v-if="errors && errors.length > 0" class="list-disc list-inside space-y-1 mt-1">
                <li v-for="(error, index) in errors" :key="index" class="text-sm">
                    {{ error }}
                </li>
            </ul>
        </div>
    </Message>
</template>