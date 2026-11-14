<script setup lang="ts">
import { Badge } from "@glimstone/vue";
defineProps<{ round: "circle" | "pill" }>();
</script>

<template>
  <Badge tone="ok" shape="circle">✓</Badge>
  <Badge tone="warn" shape="square">Late</Badge>
  <Badge :shape="round">?</Badge>
</template>
