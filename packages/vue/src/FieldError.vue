<script setup lang="ts">
import { TOAST_MARKS } from "@glimstone/core";
import { MarkSvg } from "./glyphs";

// The line under a field whose value it cannot take, with the fault mark. The
// fields draw it from their `error`; an app's own field draws it with the id
// its aria-describedby names.
defineProps<{ id: string }>();
</script>

<template>
  <span :id="id" class="glim-field-error"><MarkSvg :mark="TOAST_MARKS.fail" /><slot /></span>
</template>
