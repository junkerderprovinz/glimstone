<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Card, FieldRow, PickerWindow, TextField } from "@glimstone/vue";
import { CHANNEL_GROUPS, CHANNEL_TEXT, channelItems, labelOf, testAddress } from "../channelData";
import { glyph } from "../vue/glyph";

const ITEMS = channelItems(glyph("IconMail"), glyph("IconLink"));

const open = ref(false);
const picked = ref<string | null>(null);
const address = ref("");
const testing = ref(false);
const reached = ref<boolean | null>(null);
const saved = ref("Nothing saved yet");
function back() {
  picked.value = null;
  reached.value = null;
}
function close() {
  open.value = false;
  back();
}
async function test() {
  testing.value = true;
  reached.value = await testAddress(address.value);
  testing.value = false;
}
const actions = computed(() => [
  {
    label: "Test connection",
    labelKey: "confirm",
    tone: reached.value === null ? undefined : reached.value ? ("ok" as const) : ("danger" as const),
    busy: testing.value,
    title: reached.value === null ? undefined : reached.value ? "Reached" : "Not reached",
    onClick: () => {
      void test();
      return false as const;
    },
  },
  {
    label: "Save",
    labelKey: "save",
    primary: true,
    onClick: () => {
      saved.value = `Saved: ${labelOf(picked.value!)} at ${address.value}`;
    },
  },
]);
</script>

<template>
  <Card title="Storage" :hue-index="2">
    <div style="display: flex; align-items: center; gap: 12px">
      <Button label="Connect a service" label-key="add" @click="open = true" />
      <output>{{ saved }}</output>
    </div>
    <PickerWindow
      v-if="open"
      :title="picked ? labelOf(picked) : 'Connect a service'"
      :items="ITEMS"
      :groups="CHANNEL_GROUPS"
      :text="CHANNEL_TEXT"
      :actions="actions"
      :start="reached === null ? undefined : reached ? 'Reached' : 'Not reached'"
      @pick="picked = $event"
      @back="back"
      @close="close"
    >
      <template v-if="picked" #default>
        <FieldRow label="Address" hint="Where the service takes its messages.">
          <TextField v-model="address" width="medium" />
        </FieldRow>
      </template>
    </PickerWindow>
  </Card>
</template>
