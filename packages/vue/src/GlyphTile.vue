<script setup lang="ts">
import type { Component } from "vue";

// A small holder for a glyph at the start of a row or beside a name. It is a
// picture: the words beside it name the row.
defineProps<{
  glyph: Component;
  /** Takes the accent off the glyph, such as for a file among folders. */
  quiet?: boolean;
  /** Sets it on the third surface, for a place where a bare glyph gets lost. */
  ground?: boolean;
  /** Fills it with the accent, as a row around it being reached does. */
  active?: boolean;
}>();
</script>

<template>
  <span :class="['glim-tile', { 'glim-tile--quiet': quiet, 'glim-tile--ground': ground, 'glim-tile--active': active }]" aria-hidden="true">
    <component :is="glyph" />
  </span>
</template>
