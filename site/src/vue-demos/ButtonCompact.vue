<script setup lang="ts">
import { Button } from "@glimstone/vue";
import { glyph } from "../vue/glyph";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <Button label="Jobs" :label-key="null" :glyph="glyph('IconQueued')" compact>
      <template #after><span data-count class="glim-num">12</span></template>
    </Button>
    <Button label="All jobs" :label-key="null" :glyph="glyph('IconQueued')" compact />
    <Button label="Find" :label-key="null" :glyph="glyph('IconSearch')" :compact-below="900" />
    <Button label="Sign in" :label-key="null" :glyph="glyph('IconApply')" tone="accent" size="key" />
  </div>
</template>
