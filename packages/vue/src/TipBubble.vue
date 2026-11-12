<script setup lang="ts">
import { portalTarget } from "@glimstone/core";
import type { TipBubble } from "./tipBubble";

// Portalled to <body>, or into an open sheet (portalTarget), so no card's `overflow: hidden` clips it.
defineProps<{ state: TipBubble }>();
</script>

<template>
  <Teleport :to="portalTarget()">
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
