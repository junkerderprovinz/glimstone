<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { CHANNEL_TEXT, channelPicker, pickedLine } from "../channelData";
import { glyph } from "../vue/glyph";

const { items, groups } = channelPicker(glyph);

const open = ref(false);
const picked = ref<string[]>([]);
function pick(id: string) {
  open.value = false;
  picked.value = [...picked.value, id];
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add a channel" label-key="add" @click="open = true" />
    <output>{{ pickedLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add a channel"
      hint="Where a message goes. Pick a service, then fill in its few fields."
      :items="items"
      :groups="groups"
      :text="CHANNEL_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
