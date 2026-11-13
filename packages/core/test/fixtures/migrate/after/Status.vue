<script setup lang="ts">
import { Badge } from "@glimstone/vue";
defineProps<{ round: "circle" | "pill" }>();
</script>

<template>
  <Badge tone="ok" form="circle">✓</Badge>
  <Badge tone="warn">Late</Badge>
  <Badge :shape="round">?</Badge>
</template>
