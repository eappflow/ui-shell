<script setup lang="ts">
defineProps<{
    visible: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="visible" class="eaf-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
                <div class="eaf-modal-content bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="eaf-modal-header flex items-center justify-between px-6 py-4 border-b border-slate-200">
                        <h2 class="text-lg font-semibold text-slate-900">
                            <slot name="header" />
                        </h2>
                        <button class="text-slate-400 hover:text-slate-600 focus:outline-none" @click="emit('close')">
                            &times;
                        </button>
                    </div>
                    <div class="eaf-modal-body px-6 py-4">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="eaf-modal-footer px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>