<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { STORAGE_TEXT, storageLine, storagePicker } from "../storageData";
import { glyph } from "../vue/glyph";

const { items, groups } = storagePicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add storage" label-key="add" @click="open = true" />
    <output>{{ storageLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add storage"
      hint="Where the files go. Pick a cloud, a bucket store or a server."
      :items="items"
      :groups="groups"
      :text="STORAGE_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
