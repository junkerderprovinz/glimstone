<script setup lang="ts">
import { Meter } from "@glimstone/vue";
</script>

<template>
  <div style="display: grid; gap: 14px; width: 320px">
    <span style="display: flex; align-items: center; gap: 10px">
      disk1 <Meter size="small" :value="0.42" label="disk1" value-text="2.3 TB free of 4 TB" />
    </span>
    <span style="display: flex; align-items: center; gap: 10px">
      cache <Meter size="small" :value="0.95" label="cache" value-text="50 GB free of 1 TB" />
    </span>
    <span style="display: flex; align-items: center; gap: 10px">disk2 <Meter size="small" label="disk2" /></span>
    <Meter :value="0.31" label="media" value-text="5.5 TB free of 8 TB" />
    <Meter :value="0.92" label="backups" value-text="320 GB free of 4 TB" />
  </div>
</template>
