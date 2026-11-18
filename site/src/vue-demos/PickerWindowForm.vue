<script setup lang="ts">
import { ref } from "vue";
import { Button, FieldRow, PickerWindow, TextField } from "@glimstone/vue";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf } from "../channelData";
import { glyph } from "../vue/glyph";

const ITEMS = channelItems(glyph("IconMail"), glyph("IconLink"));

const open = ref(false);
const picked = ref<string | null>(null);
const address = ref("");
const saved = ref("Nothing saved yet");
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
      saved.value = `Saved: ${labelOf(picked.value!)} at ${address.value}`;
    },
  },
];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Connect a service" label-key="add" @click="open = true" />
    <output>{{ saved }}</output>
    <PickerWindow
      v-if="open"
      :title="picked ? labelOf(picked) : 'Connect a service'"
      :items="ITEMS"
      :groups="CHANNEL_GROUPS"
      :text="CHANNEL_TEXT"
      :actions="actions"
      @pick="picked = $event"
      @back="picked = null"
      @close="close"
    >
      <template v-if="picked" #default>
        <FieldRow label="Address" hint="Where the service takes its messages.">
          <TextField v-model="address" width="medium" />
        </FieldRow>
      </template>
    </PickerWindow>
  </div>
</template>
