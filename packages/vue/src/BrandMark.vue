<script setup lang="ts">
// A vendor mark kept as its own markup, from appMarks.ts in the core, with
// the drawing a lit tile shows instead where it has one.
defineProps<{ svg: string; hover?: string }>();
</script>

<template>
  <span v-if="hover" data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true">
    <span class="glim-mark-rest" v-html="svg" />
    <span class="glim-mark-hover" v-html="hover" />
  </span>
  <span v-else data-glim="BrandMark" class="glim-brand-svg" aria-hidden="true" v-html="svg" />
</template>
