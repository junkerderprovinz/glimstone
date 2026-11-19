<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { VPN_TEXT, vpnLine, vpnPicker } from "../vpnData";
import { glyph } from "../vue/glyph";

const { items, groups } = vpnPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add a VPN" label-key="add" @click="open = true" />
    <output>{{ vpnLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add a VPN"
      hint="Where the traffic goes. Pick your provider, or a WireGuard server of your own."
      :items="items"
      :groups="groups"
      :text="VPN_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
