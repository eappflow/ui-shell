<script setup lang="ts">
defineEmits<{
    submit: [];
}>();
</script>

<template>
    <form class="eaf-form space-y-4" @submit.prevent="$emit('submit')">
        <slot />
    </form>
</template>