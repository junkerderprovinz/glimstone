<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { TRANSFER_TEXT, transferLine, transferPicker } from "../transferData";
import { glyph } from "../vue/glyph";

const { items, groups } = transferPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add a transfer link" label-key="add" @click="open = true" />
    <output>{{ transferLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add a transfer link"
      hint="The service that sent the file. Its link downloads without an account."
      :items="items"
      :groups="groups"
      :text="TRANSFER_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
