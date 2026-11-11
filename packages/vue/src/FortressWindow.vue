<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, shallowRef, watch } from "vue";
import { COPIED_MS, copyText, fill, listOf, MARKS, phraseReady, qrCode, shake, type FortressFlow, type FortressState, type FortressText } from "@glimstone/core";
import PasswordField from "./PasswordField.vue";
import Window from "./Window.vue";
import { glyphFor, IconClose, MarkSvg } from "./glyphs";
import type { WindowAction } from "./windowParts";

// The window in front of the fortress, drawn from the flow's state: join,
// joined, leave, remove, the phrase and its change.
const props = defineProps<{
  flow: FortressFlow;
  state: FortressState;
  text: FortressText;
  lang: string;
  app: { id: string; name: string };
  pairedWith?: string[];
  leaveNote?: string;
  keys: Record<"join" | "leave" | "changePhrase" | "remove" | "unlock" | "copy", string>;
}>();

const win = shallowRef<{ card: HTMLElement | null } | null>(null);
const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;
onScopeDispose(() => clearTimeout(copiedTimer));

const w = computed(() => props.state.window!);
const paired = computed(() => (props.pairedWith?.length ? listOf(props.lang, props.pairedWith) : null));
const way = computed(() => ({ cancel: props.text.cancel, close: props.text.close }));
const busy = computed(() => props.state.busy !== null);

let stopShake: (() => void) | undefined;
onScopeDispose(() => stopShake?.());
watch(
  () => props.state.refusal,
  (refusal) => {
    const el = refusal && win.value?.card?.querySelector<HTMLElement>(`[data-fortress="${refusal.button}"]`);
    if (el) stopShake = shake(el);
  },
);
watch(
  () => (w.value.kind === "join" ? w.value.focus : -1),
  async (focus) => {
    await nextTick();
    if (focus >= 0) win.value?.card?.querySelector<HTMLInputElement>(`[data-word="${focus}"]`)?.focus();
  },
);

function send(button: string, run: () => Promise<void>, label: string, key: string, disabled = false): WindowAction {
  return {
    label,
    labelKey: key,
    primary: true,
    disabled: disabled || busy.value,
    attrs: { "data-fortress": button },
    onClick: () => {
      void run();
      return false;
    },
  };
}
function copy(words: string[]): WindowAction {
  return {
    label: props.text.copy,
    labelKey: props.keys.copy,
    attrs: { "data-fortress": "copy" },
    onClick: () => {
      void copyText(words.join(" ")).then((ok) => {
        copied.value = ok;
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => (copied.value = false), COPIED_MS);
      });
      return false;
    },
  };
}
const qr = computed(() => {
  const s = w.value;
  if (s.kind !== "phrase" && s.kind !== "changed") return null;
  const code = qrCode(s.words.join(" "));
  return { ...code, side: code.size + 8 };
});
// Window adds Close only to a foot with something in it, so a window that only says something brings its own.
const close = computed<WindowAction>(() => ({ label: props.text.close, labelKey: "common.close", glyph: IconClose, wayOut: true }));

const view = computed(() => {
  const t = props.text;
  const s = w.value;
  const f = props.flow;
  const k = props.keys;
  switch (s.kind) {
    case "join":
      return { title: t.joinTitle, size: "wide" as const, actions: [send("join", f.join, t.join, k.join, !phraseReady(s.words))] };
    case "joined":
      return { title: t.joinTitle, actions: [close.value] };
    case "leave":
      return { title: t.leaveTitle, actions: [send("leave", f.leave, t.leaveConfirm, k.leave)] };
    case "remove":
      return { title: fill(t.removeTitle, { device: s.device }), actions: [send("remove", f.remove, t.remove, k.remove)] };
    case "phrase":
      return s.step === "password"
        ? { title: t.phraseTitle, actions: [send("unlock", f.unlock, t.unlock, k.unlock, s.password === "")] }
        : { title: t.phraseTitle, size: "wide" as const, actions: [copy(s.words)] };
    case "change":
      return { title: t.changeTitle, actions: [send("change", f.change, t.changeConfirm, k.changePhrase)] };
    case "changed":
      return { title: t.changedTitle, size: "wide" as const, actions: [copy(s.words)] };
  }
  return { title: "", actions: [] };
});
</script>

<template>
  <Window
    ref="win"
    :title="view.title"
    :size="view.size"
    :actions="view.actions"
    :start="copied ? text.copied : undefined"
    :text="way"
    @close="flow.close()"
  >
    <form v-if="w.kind === 'join'" class="glim-fortress-text" @submit.prevent="flow.join()">
      <p>{{ text.about }}</p>
      <div class="glim-phrase-fields">
        <label v-for="(word, i) in w.words" :key="i" class="glim-phrase-field">
          <span class="glim-phrase-number glim-num">{{ i + 1 }}</span>
          <input
            class="glim-input"
            :data-word="i"
            :value="word"
            :aria-label="fill(text.word, { n: i + 1 })"
            autocomplete="off"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            @input="flow.enter(i, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
      <button type="submit" hidden />
      <p class="glim-fortress-sub">{{ text.phraseWhere }}</p>
      <p v-if="paired" class="glim-fortress-note" data-fortress="moves">
        <component :is="glyphFor('info')" v-if="glyphFor('info')" />
        <span>{{ fill(text.moves, { app: app.name, devices: paired }) }}</span>
      </p>
      <p v-if="state.error" class="glim-fortress-error" role="alert">{{ state.error }}</p>
    </form>

    <div v-else-if="w.kind === 'joined'" class="glim-fortress-result">
      <span class="glim-fortress-result-mark" aria-hidden="true"><MarkSvg :mark="MARKS.check" /></span>
      <div class="glim-fortress-text">
        <p class="glim-fortress-result-title">{{ fill(text.joinedTitle, { app: app.name }) }}</p>
        <p class="glim-fortress-sub">{{ paired ? `${fill(text.joinedMoved, { devices: paired })} ` : "" }}{{ text.joinedNext }}</p>
      </div>
    </div>

    <div v-else-if="w.kind === 'leave'" class="glim-fortress-text">
      <p>
        {{ fill(text.leaveBody, { app: app.name }) }}{{ paired ? ` ${fill(text.leavePairing, { devices: paired })}` : ""
        }}{{ leaveNote ? ` ${leaveNote}` : "" }}
      </p>
      <p class="glim-fortress-sub">{{ text.leaveBack }}</p>
      <p v-if="state.error" class="glim-fortress-error" role="alert">{{ state.error }}</p>
    </div>

    <div v-else-if="w.kind === 'remove'" class="glim-fortress-text">
      <p>{{ fill(text.removeBody, { device: w.device }) }}</p>
      <p class="glim-fortress-sub">{{ text.removeBack }}</p>
      <p v-if="state.error" class="glim-fortress-error" role="alert">{{ state.error }}</p>
    </div>

    <form v-else-if="w.kind === 'phrase' && w.step === 'password'" class="glim-fortress-text" @submit.prevent="flow.unlock()">
      <p>{{ fill(text.phrasePassword, { app: app.name }) }}</p>
      <PasswordField
        :model-value="w.password"
        :aria-label="fill(text.password, { app: app.name })"
        :placeholder="fill(text.password, { app: app.name })"
        :text="{ show: text.showPassword, hide: text.hidePassword }"
        @update:model-value="flow.setPassword($event)"
      />
      <p v-if="state.error" class="glim-fortress-error" role="alert">{{ state.error }}</p>
    </form>

    <div v-else-if="w.kind === 'change'" class="glim-fortress-text">
      <p>{{ text.changeBody }}</p>
      <p class="glim-fortress-sub">{{ text.changeAway }}</p>
      <p v-if="state.error" class="glim-fortress-error" role="alert">{{ state.error }}</p>
    </div>

    <div v-else-if="w.kind === 'phrase' || w.kind === 'changed'" class="glim-fortress-text">
      <p>{{ text.phraseBody }}</p>
      <div class="glim-phrase-show">
        <ol class="glim-phrase-words" data-fortress="words">
          <li v-for="(word, i) in w.words" :key="i"><span class="glim-phrase-number glim-num">{{ i + 1 }}</span>{{ word }}</li>
        </ol>
        <!-- A camera reads dark modules on a light ground, so these two colours stay put in every theme. -->
        <svg
          v-if="qr"
          class="glim-phrase-qr"
          data-fortress="qr"
          role="img"
          :aria-label="text.qrName"
          :viewBox="`-4 -4 ${qr.side} ${qr.side}`"
          shape-rendering="crispEdges"
        >
          <rect x="-4" y="-4" :width="qr.side" :height="qr.side" fill="#ffffff" />
          <path :d="qr.path" fill="#161616" />
        </svg>
        <p class="glim-phrase-scan">{{ text.scanHint }}</p>
      </div>
      <p v-if="w.kind === 'changed' && w.left.length" class="glim-fortress-sub">{{ fill(text.changedLeft, { devices: listOf(lang, w.left) }) }}</p>
    </div>
  </Window>
</template>
