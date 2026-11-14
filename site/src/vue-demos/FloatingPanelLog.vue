<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@glimstone/vue";
import { FloatingPanel } from "@glimstone/vue/FloatingPanel";

const open = ref(false);
</script>

<template>
  <div>
    <Button label="Show the transfer log" :label-key="null" @click="open = true" />
    <FloatingPanel v-model:open="open" title="Transfer log">
      <p style="margin: 0">04:10 Copied 2,113 files to the cellar.</p>
      <p style="margin: 0">04:14 Checked every file against its sum.</p>
    </FloatingPanel>
  </div>
</template>
