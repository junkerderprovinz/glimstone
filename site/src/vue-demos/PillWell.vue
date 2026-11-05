<script setup lang="ts">
import { Pill, SubCard } from "@glimstone/vue";
</script>

<template>
  <div style="display: grid; gap: 12px; width: 320px">
    <div data-plain style="display: flex; gap: 6px">
      <Pill>2.4 GB</Pill>
      <Pill tone="ok">Settled</Pill>
    </div>
    <div data-well class="glim-well" style="display: flex; gap: 6px; padding: 12px">
      <Pill>2.4 GB</Pill>
      <Pill tone="ok">Settled</Pill>
    </div>
    <SubCard>
      <div style="display: flex; gap: 6px">
        <Pill>2.4 GB</Pill>
        <Pill tone="fail">Failed</Pill>
      </div>
    </SubCard>
  </div>
</template>
