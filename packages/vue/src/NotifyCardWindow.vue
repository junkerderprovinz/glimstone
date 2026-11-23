<script setup lang="ts">
import { computed, type Component } from "vue";
import {
  connectionTestFace,
  fill,
  notifyChannelName,
  notifyForm,
  notifyPicker,
  type Catalog,
  type NotifyCardFlow,
  type NotifyCardLabelKeys,
  type NotifyCardState,
  type NotifyCardText,
  type NotifyChoice,
  type NotifyKind,
} from "@glimstone/core";
import { IconCheck, IconClose } from "./glyphs";
import NotifyCardForm from "./NotifyCardForm.vue";
import PickerWindow from "./PickerWindow.vue";
import Window from "./Window.vue";
import type { WindowAction } from "./windowParts";

// The notification card's window: the picker, and the form of the channel
// being added or edited.
const props = defineProps<{
  state: NotifyCardState;
  flow: NotifyCardFlow;
  text: NotifyCardText;
  app: string;
  lang: string;
  providers: Catalog;
  kinds: readonly NotifyKind[];
  events: readonly NotifyChoice[];
  checks: readonly NotifyChoice[];
  unavailable: Partial<Record<NotifyKind, string>>;
  keys: NotifyCardLabelKeys;
  mark: (kind: NotifyKind) => Component;
}>();

const w = computed(() => props.state.window);
const picker = computed(() => notifyPicker(props.providers, props.text, props.lang, props.kinds, props.mark));
const pickerText = computed(() => ({ search: props.text.search, none: props.text.noMatch, clear: props.text.clear, close: props.text.close, cancel: props.text.cancel, back: props.text.back }));
const form = computed(() => (w.value?.kind === "form" ? notifyForm(props.state, props) : null));
const title = computed(() => (props.state.draft ? fill(props.text.editTitle, { name: notifyChannelName(props.text, props.state.draft) }) : ""));
const actions = computed<WindowAction[]>(() => {
  const test = props.state.formTest;
  const face = connectionTestFace(test);
  return [
    {
      label: props.text.test,
      labelKey: props.keys.test,
      glyph: face.outcome === "cross" ? IconClose : face.outcome === "check" ? IconCheck : undefined,
      tone: test?.busy ? undefined : test?.tone,
      busy: !!test?.busy,
      title: test?.title,
      attrs: { "data-notify": "form-test" },
      onClick: () => {
        void props.flow.test();
        return false;
      },
    },
    {
      label: props.text.save,
      labelKey: props.keys.save,
      primary: true,
      busy: props.state.busy === "save",
      attrs: { "data-notify": "save" },
      onClick: () => {
        void props.flow.save();
        return false;
      },
    },
  ];
});
</script>

<template>
  <PickerWindow
    v-if="w?.kind === 'pick'"
    :title="text.add"
    :hint="text.hint"
    :items="picker.items"
    :groups="picker.groups"
    :text="pickerText"
    @pick="flow.choose"
    @close="flow.close()"
  />
  <PickerWindow
    v-else-if="w?.kind === 'form' && form && w.adding"
    :title="text.add"
    :items="picker.items"
    :groups="picker.groups"
    :text="pickerText"
    :selected="form.kind"
    :actions="actions"
    @pick="flow.choose"
    @back="flow.pick()"
    @close="flow.close()"
  >
    <NotifyCardForm :form="form" :state="state" :flow="flow" :text="text" :keys="keys" />
  </PickerWindow>
  <Window v-else-if="w?.kind === 'form' && form" :title="title" :text="{ cancel: text.cancel, close: text.close }" :close-on-backdrop="false" :actions="actions" @close="flow.close()">
    <NotifyCardForm :form="form" :state="state" :flow="flow" :text="text" :keys="keys" />
  </Window>
</template>
