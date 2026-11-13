<script setup lang="ts">
defineProps<{ filled?: boolean }>();
</script>

<template>
  <!-- Lucide's "pin" (ISC): PrimeIcons' thumbtack has no filled variant.
       1em, so it's sized by font-size like the icon font. -->
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 17v5" />
    <path
      d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"
    />
  </svg>
</template>
