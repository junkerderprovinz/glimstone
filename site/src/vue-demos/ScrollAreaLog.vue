<script setup lang="ts">
import { ScrollArea } from "@glimstone/vue/ScrollArea";

const lines = Array.from({ length: 30 }, (_, i) => `04:${String(10 + i).padStart(2, "0")}  Copied folder ${i + 1} of 30`);
</script>

<template>
  <div class="glim-well" style="width: min(30rem, 100%); padding: 0">
    <ScrollArea label="Backup log" max-height="10rem">
      <div class="glim-num" style="padding: 12px; display: grid; gap: 4px">
        <span v-for="line in lines" :key="line">{{ line }}</span>
      </div>
    </ScrollArea>
  </div>
</template>
