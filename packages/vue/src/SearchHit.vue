<script setup lang="ts">
import { computed } from "vue";
import { searchParts } from "@glimstone/core";

// A row's label in a list that filters as somebody types, with the part that
// matches the search set apart.
const props = defineProps<{ label: string; query: string }>();
const parts = computed(() => searchParts(props.label, props.query));
</script>

<template>
  <template v-if="parts">{{ parts.before }}<span class="glim-combobox-hit">{{ parts.hit }}</span>{{ parts.after }}</template>
  <template v-else>{{ label }}</template>
</template>
