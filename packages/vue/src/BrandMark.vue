<script setup lang="ts">
// A vendor mark kept as its own markup, from appMarks.ts in the core.
defineProps<{ svg: string }>();
</script>

<template>
  <span class="glim-brand-svg" aria-hidden="true" v-html="svg" />
</template>
