<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, pickedLine } from "../channelData";
import { glyph } from "../vue/glyph";

const ITEMS = channelItems(glyph("IconMail"), glyph("IconLink"));

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
      :items="ITEMS"
      :groups="CHANNEL_GROUPS"
      :text="CHANNEL_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
