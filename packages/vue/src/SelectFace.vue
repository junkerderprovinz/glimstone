<script setup lang="ts" generic="T extends string">
import { computed } from "vue";
import { faceLabels, type SelectWidth } from "@glimstone/core";
import type { SelectOption } from "./selectParts";

// The value on the trigger; see faceLabels in the core.
const props = defineProps<{ all: SelectOption<T>[]; value: T | null; placeholder?: string; width: SelectWidth; glyphs: boolean }>();
const face = computed(() => faceLabels(props.all, props.value, props.placeholder, props.width));
const glyph = computed(() => props.all.find((o) => o.value === props.value)?.glyph);
</script>

<template>
  <span v-if="glyphs" class="glim-select-glyph"><component :is="glyph" v-if="glyph" /></span>
  <span class="glim-select-value">
    <span
      v-for="l in face.labels"
      :key="l"
      :aria-hidden="l !== face.text || undefined"
      :class="l === face.text ? undefined : 'glim-select-ghost'"
    >{{ l }}</span>
  </span>
</template>
