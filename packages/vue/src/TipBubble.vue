<script setup lang="ts">
import type { TipBubble } from "./tipBubble";

// Portalled to <body>, so no card's `overflow: hidden` clips it.
defineProps<{ state: TipBubble }>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.shown.value"
      :ref="(el) => (state.bubble.value = el as HTMLElement | null)"
      :id="state.id"
      role="tooltip"
      class="glim-bubble glim-fade"
    >
      {{ state.text.value }}
    </div>
  </Teleport>
</template>
