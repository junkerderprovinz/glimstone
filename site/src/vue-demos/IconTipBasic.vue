<script setup lang="ts">
import { IconTipButton } from "@glimstone/vue";
import { Glyph } from "../vue/glyph";

const ROW = "inline-flex h-8 w-8 items-center justify-center rounded-pill text-carbon-textSub hover:bg-carbon-hover hover:text-carbon-text";
</script>

<template>
  <IconTipButton tip="Move up" :class="ROW"><Glyph name="IconMoveUp" /></IconTipButton>
  <IconTipButton tip="Move down" :class="ROW"><Glyph name="IconMoveDown" /></IconTipButton>
  <IconTipButton tip="Pin to the top" :class="ROW" :aria-pressed="false"><Glyph name="IconPin" /></IconTipButton>
</template>

