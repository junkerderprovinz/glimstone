<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import {
  COLOR_NAMES_DE,
  COLOR_PICKER_TEXT,
  colorPicker,
  floatColorPicker,
  nearestColorName,
  normalizeHex,
  type ColorName,
  type ColorPicker as Widget,
  type ColorPickerPanelText,
} from "@glimstone/core";
import Button from "./Button.vue";
import { IconCheck } from "./glyphs";

// The colour picker as a component: the core's square and hue bar, a preview
// with the name the colour proposes, the hex field and Apply. v-model holds
// the applied colour and changes only on Apply, so a caller can show the
// colour live through `input` and still keep the old one when the picker
// closes without it.
const props = withDefaults(
  defineProps<{
    /** The control that opened the picker. With it the picker floats beside it
     *  and closes on Escape, on a click beside it and after Apply. */
    anchor?: HTMLElement | null;
    /** The names a colour is matched against, nearest in OKLab. `false` shows none. */
    names?: readonly ColorName[] | false;
    /** The words, read when the picker opens. */
    text?: Partial<ColorPickerPanelText>;
  }>(),
  { anchor: null, names: () => COLOR_NAMES_DE },
);
const model = defineModel<string>({ required: true });
const emit = defineEmits<{
  /** Apply or Enter, with the colour and the name it proposes. */
  apply: [hex: string, name: string | null];
  /** Every step of a drag, a key or a valid hex, for a live preview. */
  input: [hex: string];
  /** A floating picker closed, however it closed. */
  close: [];
}>();

const words = { ...COLOR_PICKER_TEXT, ...props.text };
const panel = shallowRef<HTMLElement | null>(null);
const host = shallowRef<HTMLElement | null>(null);
const draft = ref(normalizeHex(model.value) ?? "#000000");
const typed = ref(draft.value);
const name = computed(() => (props.names === false ? null : nearestColorName(draft.value, props.names)));

const widget: Widget = colorPicker(
  draft.value,
  (hex) => {
    draft.value = hex;
    typed.value = hex;
    emit("input", hex);
  },
  { text: words },
);

let unfloat: (() => void) | undefined;
onMounted(() => {
  host.value!.appendChild(widget.el);
  if (props.anchor && panel.value) {
    unfloat = floatColorPicker(panel.value, props.anchor, () => emit("close"));
    widget.focus();
  }
});
onBeforeUnmount(() => unfloat?.());

watch(model, (value) => {
  const hex = normalizeHex(value);
  if (!hex) return;
  draft.value = hex;
  typed.value = hex;
  widget.setValue(hex);
});

function onTyped(e: Event) {
  typed.value = (e.target as HTMLInputElement).value;
  const hex = normalizeHex(typed.value);
  if (!hex) return;
  draft.value = hex;
  widget.setValue(hex);
  emit("input", hex);
}

function apply() {
  model.value = draft.value;
  emit("apply", draft.value, name.value);
  if (props.anchor) {
    props.anchor.focus();
    emit("close");
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
    e.preventDefault();
    apply();
  }
}
</script>

<template>
  <Teleport to="body" :disabled="!anchor">
    <div
      data-glim="ColorPicker"
      ref="panel"
      :class="['glim-picker-panel', anchor && 'glim-picker-panel--float']"
      :style="{ '--glim-picker-colour': draft }"
      @keydown="onKeyDown"
    >
      <div ref="host" style="display: contents" />
      <div class="glim-picker-foot">
        <span class="glim-picker-swatch" aria-hidden="true" />
        <span v-if="name !== null" class="glim-picker-name">{{ name }}</span>
        <input
          class="glim-picker-hex"
          :value="typed"
          maxlength="7"
          spellcheck="false"
          :aria-label="words.hex"
          @input="onTyped"
        />
      </div>
      <div class="glim-picker-actions">
        <Button :label="words.apply" label-key="apply" :glyph="IconCheck" tone="accent" @click="apply" />
      </div>
    </div>
  </Teleport>
</template>
