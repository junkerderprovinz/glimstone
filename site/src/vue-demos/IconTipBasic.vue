<script setup lang="ts">
import { IconTipButton } from "@glimstone/vue";
import { Glyph } from "../vue/glyph";
</script>

<template>
  <IconTipButton tip="Move up" class="row-action"><Glyph name="IconMoveUp" /></IconTipButton>
  <IconTipButton tip="Move down" class="row-action"><Glyph name="IconMoveDown" /></IconTipButton>
  <IconTipButton tip="Pin to the top" class="row-action" :aria-pressed="false"><Glyph name="IconPin" /></IconTipButton>
</template>

<style scoped>
.row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  color: var(--carbon-text-sub);
}
.row-action:hover {
  background-color: var(--carbon-hover);
  color: var(--carbon-text);
}
</style>
