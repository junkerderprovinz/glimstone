<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { REGISTRY_TEXT, registryLine, registryPicker } from "../registryData";
import { glyph } from "../vue/glyph";

const { items, groups } = registryPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add a registry" label-key="add" @click="open = true" />
    <output>{{ registryLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add a registry"
      hint="Where private images come from. Pick the registry to sign in to."
      :items="items"
      :groups="groups"
      :text="REGISTRY_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
