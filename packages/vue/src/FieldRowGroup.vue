<script setup lang="ts">
import { provide } from "vue";
import { FIELD_ROW_GROUP } from "./fieldName";

// Rows that share one column for their names, as wide as the longest, so fields
// that grow start at one edge. The rows stand directly inside it.
provide(FIELD_ROW_GROUP, true);
</script>

<template>
  <div class="glim-field-row-group"><slot /></div>
</template>
