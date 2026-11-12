<script setup lang="ts">
import { ref } from "vue";
import { BusyRing, Button } from "@glimstone/vue";

const waiting = ref(0);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
    <BusyRing size="small" :delay="0" />
    <BusyRing label="Loading backups" :delay="0" />
    <BusyRing size="large" :delay="0" />
    <Button label="Saving" label-key="save" tone="accent" busy />
    <Button label="Wait" :label-key="null" @click="waiting++" />
    <BusyRing v-if="waiting > 0" :key="waiting" label="Waiting" />
  </div>
</template>
