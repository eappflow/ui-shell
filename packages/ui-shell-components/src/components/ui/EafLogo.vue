<script setup lang="ts">
defineProps<{
  src: string;
  alt?: string;
  height?: number;
}>();
</script>

<template>
  <img :src="src" :alt="alt ?? ''" />
</template>

<style scoped>
img {
  display: block;
  object-fit: contain;
  max-height: 2.5rem;
}
</style>
