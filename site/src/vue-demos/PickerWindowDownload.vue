<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { DOWNLOAD_TEXT, downloadLine, downloadPicker } from "../downloadData";
import { glyph } from "../vue/glyph";

const { items, groups } = downloadPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add an account" label-key="add" @click="open = true" />
    <output>{{ downloadLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add an account"
      hint="Where the links are unlocked. Pick a debrid service or a hoster you have a login at."
      :items="items"
      :groups="groups"
      :text="DOWNLOAD_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
