<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { MCP_TEXT, mcpLine, mcpPicker } from "../mcpData";
import { glyph } from "../vue/glyph";

const { items, groups } = mcpPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Connect a client" label-key="add" @click="open = true" />
    <output>{{ mcpLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Connect a client"
      hint="The AI app that connects to this server, so the steps that follow fit it."
      :items="items"
      :groups="groups"
      :text="MCP_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
