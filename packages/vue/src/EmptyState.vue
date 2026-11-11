<script setup lang="ts">
import type { Component } from "vue";

// What a list, table or panel shows when it holds nothing: a muted, oversized
// glyph, a title, an optional hint and an optional action in the default slot.
// "Nothing here yet" and "nothing matches the filter" take the same shape with
// different words, so somebody is not sent looking for a filter never set.
withDefaults(
  defineProps<{
    /** The page's own glyph, so the empty state echoes the place it is on. */
    glyph?: Component;
    /** What is missing, such as "No backups yet" or "No backups match the filter". */
    title: string;
    /** One line on how to get there. */
    hint?: string;
    /** It stands inside a card, which already provides the surface. */
    nested?: boolean;
  }>(),
  { nested: false },
);
</script>

<template>
  <div data-glim="EmptyState" :data-glim-title="title" :class="nested ? 'glim-empty' : 'glim-card glim-empty'">
    <span v-if="glyph" class="glim-empty-glyph" aria-hidden="true">
      <component :is="glyph" />
    </span>
    <p class="glim-empty-title">{{ title }}</p>
    <p v-if="hint" class="glim-empty-hint">{{ hint }}</p>
    <slot />
  </div>
</template>
