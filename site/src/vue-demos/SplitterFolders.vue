<script setup lang="ts">
import { ref } from "vue";
import { Splitter } from "@glimstone/vue/Splitter";

const panels = [
  { id: "folders", minSize: 20, lines: ["Documents", "Photos", "Music"] },
  { id: "files", minSize: 30, lines: ["holiday.jpg", "harbour.jpg", "market.jpg"] },
];
const size = ref([35, 65]);
</script>

<template>
  <div style="display: grid; gap: 12px; width: min(36rem, 100%)">
    <div class="glim-well" style="height: 160px; padding: 0">
      <Splitter v-model:size="size" :panels="panels">
        <template #panel="{ panel }">
          <ul style="margin: 0; padding: 12px; list-style: none">
            <li v-for="line in panel.lines" :key="line">{{ line }}</li>
          </ul>
        </template>
      </Splitter>
    </div>
    <span class="glim-num">{{ `Folders ${Math.round(size[0]!)} %, files ${Math.round(size[1]!)} %` }}</span>
  </div>
</template>
