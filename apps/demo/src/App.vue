<script setup lang="ts">
import "./assets/main.css";
</script>

<template>
    <!-- Route tree handles layout: public routes render standalone,
         protected routes are children of AuthorizedLayout -->
    <router-view />
</template>