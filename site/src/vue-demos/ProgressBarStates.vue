<script setup lang="ts">
import { ProgressBar } from "@glimstone/vue";
</script>

<template>
  <div style="display: grid; gap: 14px; width: 360px">
    <ProgressBar :value="0.62" label="Copying" value-text="2.5 GB of 4 GB" />
    <ProgressBar :value="0.4" paused label="Paused" />
    <ProgressBar :value="0.55" failed label="Failed" />
    <ProgressBar :value="1" label="Done" />
    <ProgressBar label="Preparing" />
  </div>
</template>
