<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { IDENTITY_TEXT, identityLine, identityPicker } from "../identityData";
import { glyph } from "../vue/glyph";

const { items, groups } = identityPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add single sign-on" label-key="add" @click="open = true" />
    <output>{{ identityLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add single sign-on"
      hint="The service people sign in through, over OpenID Connect."
      :items="items"
      :groups="groups"
      :text="IDENTITY_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
