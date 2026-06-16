<script setup lang="ts">
import { computed } from "vue";
import Message from "primevue/message";
import { useMessageStore } from "../stores/useMessageStore";

const messageStore = useMessageStore();

const message = computed(() => messageStore.validationMessage?.message || "");
const validationErrors = computed(
    () => messageStore.validationMessage?.validationErrors || [],
);
const severity = computed(
    () => messageStore.validationMessage?.severity || "error",
);

const shouldDisplay = computed(() => {
    return (
        messageStore.validationMessage !== null &&
        (message.value !== "" || validationErrors.value.length > 0)
    );
});

function handleClose() {
    messageStore.clearValidationMessage();
}
</script>

<template>
    <Message v-if="shouldDisplay" :severity="severity" closable @close="handleClose" class="mb-4">
        <div class="flex flex-col gap-2">
            <div v-if="message" class="font-semibold">{{ message }}</div>
            <ul v-if="validationErrors.length > 0" class="list-disc list-inside space-y-1 mt-1">
                <li v-for="(error, index) in validationErrors" :key="index" class="text-sm">
                    {{ error }}
                </li>
            </ul>
        </div>
    </Message>
</template>