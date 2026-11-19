<script setup lang="ts">
import { ref } from "vue";
import { Button, PickerWindow } from "@glimstone/vue";
import { CAPTCHA_TEXT, captchaLine, captchaPicker } from "../captchaData";
import { glyph } from "../vue/glyph";

const { items, groups } = captchaPicker(glyph);

const open = ref(false);
const picked = ref<string | null>(null);
function pick(id: string) {
  open.value = false;
  picked.value = id;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <Button label="Add a solver" label-key="add" @click="open = true" />
    <output>{{ captchaLine(picked) }}</output>
    <PickerWindow
      v-if="open"
      title="Add a captcha solver"
      hint="A paid service that solves captchas before anyone is asked. Its API key comes next."
      :items="items"
      :groups="groups"
      :text="CAPTCHA_TEXT"
      @pick="pick"
      @close="open = false"
    />
  </div>
</template>
