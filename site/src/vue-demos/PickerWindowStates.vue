<script setup lang="ts">
import { ref } from "vue";
import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/vue";
import { STORAGE_GROUPS, STORAGE_TEXT, placeOf, storageItems } from "../placeData";
import { glyph } from "../vue/glyph";

const ITEMS = storageItems(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
const last = ref<string | undefined>();
const path = ref("");
const saved = ref("No place yet");
function pick(id: string) {
  picked.value = id;
  last.value = id;
}
function close() {
  open.value = false;
  picked.value = null;
}
const actions = [
  {
    label: "Save",
    labelKey: "save",
    primary: true,
    onClick: () => {
      saved.value = `Saved: ${placeOf(picked.value!)} at ${path.value}`;
    },
  },
];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Choose a place" label-key="add" @click="open = true" />
    <output>{{ saved }}</output>
    <PickerWindow
      v-if="open"
      :title="picked ? placeOf(picked) : 'Choose a place'"
      :items="ITEMS"
      :groups="STORAGE_GROUPS"
      :text="STORAGE_TEXT"
      :selected="last"
      :actions="actions"
      @pick="pick"
      @back="picked = null"
      @close="close"
    >
      <template v-if="picked" #default>
        <FieldRow label="Path" hint="Where on the place the backups go.">
          <TextField v-model="path" width="medium" />
        </FieldRow>
      </template>
    </PickerWindow>
  </div>
</template>
