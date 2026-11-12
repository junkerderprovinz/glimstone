<script setup lang="ts">
import { ref } from "vue";
import { Button, IconButton, Sheet } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const open = ref(false);
</script>

<template>
  <Button label="Details" :label-key="null" @click="open = true" />
  <Sheet :open="open" title="Nightly backup" :text="{ cancel: 'Cancel', close: 'Close' }" :actions="[{ label: 'Run now', labelKey: null, primary: true }]" @close="open = false">
    <p style="margin: 0">Runs at three in the morning and keeps the last fourteen copies.</p>
    <div>
      <IconButton tip="Copy the path" :glyph="glyph('IconCopy')" />
    </div>
  </Sheet>
</template>
