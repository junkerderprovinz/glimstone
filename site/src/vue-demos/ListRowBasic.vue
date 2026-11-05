<script setup lang="ts">
import { ref } from "vue";
import { IconButton, ListRow, Pill } from "@glimstone/vue";
import { glyph, Glyph } from "../vue/glyph";

const opened = ref(0);
const LONG = "/mnt/user/media/series/a-very-long-name-that-does-not-fit-beside-its-badges-and-its-buttons-in-one-row/season-01";
</script>

<template>
  <div style="display: grid; gap: 2px; width: 100%; max-width: 560px">
    <ListRow name="nightly-backup" tip="Runs at three in the morning." @click="opened++">
      <template #tile><Glyph name="IconFolder" /></template>
      <template #badges>
        <Pill class="glim-num">2.4 GB</Pill>
        <Pill tone="ok">Settled</Pill>
      </template>
      <template #actions>
        <IconButton tip="Edit" :glyph="glyph('IconPencil')" />
        <IconButton tip="Delete" :glyph="glyph('IconTrash')" />
      </template>
    </ListRow>
    <ListRow name="archive-copy">
      <template #tile><Glyph name="IconCloud" /></template>
      <template #badges><Pill class="glim-num">880 MB</Pill></template>
      <template #actions>
        <IconButton tip="Edit" :glyph="glyph('IconPencil')" />
        <IconButton tip="Delete" :glyph="glyph('IconTrash')" />
      </template>
    </ListRow>
    <ListRow :name="LONG" mono>
      <template #tile><Glyph name="IconFolder" /></template>
      <template #badges><Pill class="glim-num">12 GB</Pill></template>
      <template #actions>
        <IconButton tip="Edit" :glyph="glyph('IconPencil')" />
        <IconButton tip="Delete" :glyph="glyph('IconTrash')" />
      </template>
    </ListRow>
    <output>Opened {{ opened }}</output>
  </div>
</template>
