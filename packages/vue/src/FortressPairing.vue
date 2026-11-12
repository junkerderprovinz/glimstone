<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from "vue";
import { createFortressFlow, fill, type ChangeAnswer, type FortressAnswer, type FortressText, type PhraseAnswer } from "@glimstone/core";
import Button from "./Button.vue";
import Card from "./Card.vue";
import FieldRow from "./FieldRow.vue";
import FortressWindow from "./FortressWindow.vue";

// The fortress in the app's pairing settings: the one place where the phrase
// shows and changes and the app leaves, each behind a window that says what it
// does. The default slot holds rows of the app's own above the phrase, such as
// the name the instance goes by. An app that shows the phrase here leaves Show
// phrase out of its Fortress.
const props = defineProps<{
  text: FortressText;
  lang: string;
  app: { id: string; name: string };
  onLeave: () => Promise<FortressAnswer>;
  /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase here. */
  onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
  /** Asks for the app's password before the phrase shows. */
  phrasePassword?: boolean;
  /** What the QR code beside the words carries, the words alone without it. */
  phraseQr?: (words: string[]) => string;
  /** Without it there is no way to change the phrase here, for an app that cannot keep a new one. */
  onChangePhrase?: () => Promise<ChangeAnswer>;
  /** The devices whose pairing ends with leaving. */
  pairedWith?: string[];
  /** A sentence of the app's own for the leave window, such as what stays as it is. */
  leaveNote?: string;
  labelKeys?: Partial<Record<"leave" | "showPhrase" | "changePhrase" | "copy", string>>;
  hueIndex?: number;
}>();

const flow = createFortressFlow(() => ({ ...props, failed: props.text.failed }));
const s = shallowRef(flow.state());
const stop = flow.subscribe(() => (s.value = flow.state()));
onBeforeUnmount(stop);

const keys = computed(() => ({
  join: "fortressJoin",
  leave: "fortressLeave",
  showPhrase: "fortressShowPhrase",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  later: "fortressLater",
  unlock: "unlock",
  copy: "copy",
  ...props.labelKeys,
}));
</script>

<template>
  <Card data-glim="FortressPairing" :title="text.pairing" :hue-index="hueIndex">
    <slot />
    <FieldRow v-if="onShowPhrase || onChangePhrase" :label="text.phraseTitle" :hint="onChangePhrase ? text.changePhraseAbout : undefined">
      <Button
        v-if="onShowPhrase"
        :label="text.showPhrase"
        :label-key="keys.showPhrase"
        :busy="s.busy === 'show'"
        data-fortress="show"
        @click="flow.openPhrase()"
      />
      <Button v-if="onChangePhrase" :label="text.change" :label-key="keys.changePhrase" data-fortress="open-change" @click="flow.openChange()" />
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
      :phrase-qr="phraseQr"
      :keys="keys"
    />
  </Card>
</template>
