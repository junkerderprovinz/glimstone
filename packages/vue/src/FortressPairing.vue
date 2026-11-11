<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from "vue";
import { createFortressFlow, fill, type ChangeAnswer, type FortressAnswer, type FortressText } from "@glimstone/core";
import Button from "./Button.vue";
import Card from "./Card.vue";
import FieldRow from "./FieldRow.vue";
import FortressWindow from "./FortressWindow.vue";

// The fortress in the app's pairing settings: the one place where the phrase
// changes and the app leaves, each behind a window that says what it does.
const props = defineProps<{
  text: FortressText;
  lang: string;
  app: { id: string; name: string };
  onLeave: () => Promise<FortressAnswer>;
  /** Without it there is no way to change the phrase here, for an app that cannot keep a new one. */
  onChangePhrase?: () => Promise<ChangeAnswer>;
  /** The devices whose pairing ends with leaving. */
  pairedWith?: string[];
  /** A sentence of the app's own for the leave window, such as what stays as it is. */
  leaveNote?: string;
  labelKeys?: Partial<Record<"leave" | "changePhrase" | "copy" | "done", string>>;
  hueIndex?: number;
}>();

const flow = createFortressFlow(() => ({ ...props, failed: props.text.failed }));
const s = shallowRef(flow.state());
const stop = flow.subscribe(() => (s.value = flow.state()));
onBeforeUnmount(stop);

const keys = computed(() => ({
  join: "fortressJoin",
  leave: "fortressLeave",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  unlock: "unlock",
  copy: "copy",
  done: "confirm",
  ...props.labelKeys,
}));
</script>

<template>
  <Card :title="text.pairing" :hue-index="hueIndex">
    <FieldRow v-if="onChangePhrase" :label="text.phraseTitle" :hint="text.changePhraseAbout">
      <Button :label="text.change" :label-key="keys.changePhrase" data-fortress="open-change" @click="flow.openChange()" />
    </FieldRow>
    <FieldRow :label="text.leaveRow" :hint="fill(text.leaveAbout, { app: app.name })">
      <Button :label="text.leaveConfirm" :label-key="keys.leave" data-fortress="open-leave" @click="flow.openLeave()" />
    </FieldRow>
    <FortressWindow
      v-if="s.window"
      :flow="flow"
      :state="s"
      :text="text"
      :lang="lang"
      :app="app"
      :paired-with="pairedWith"
      :leave-note="leaveNote"
      :keys="keys"
    />
  </Card>
</template>
