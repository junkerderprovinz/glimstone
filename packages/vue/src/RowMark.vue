<script setup lang="ts">
import { IconCheck } from "./glyphs";

// The round mark on a row picked for an action on many (rule 39). It is a
// picture: the row says it is picked, with aria-selected.
defineProps<{ on?: boolean }>();
</script>

<template>
  <span :class="['glim-rowmark', { 'glim-rowmark--on': on }]" aria-hidden="true"><IconCheck /></span>
</template>
