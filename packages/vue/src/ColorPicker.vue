<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import {
  canPickFromScreen,
  COLOR_NAMES_DE,
  COLOR_PICKER_TEXT,
  colorPicker,
  floatColorPicker,
  MARKS,
  nearestColorName,
  normalizeHex,
  pickFromScreen,
  rainbowSwatches,
  type ColorName,
  type ColorPicker as Widget,
  type ColorPickerPanelText,
  portalTarget,
} from "@glimstone/core";
import Button from "./Button.vue";
import IconButton from "./IconButton.vue";
import { IconCheck, MarkSvg } from "./glyphs";

// The colour picker as a component: the core's square and hue bar, a preview
// with the name the colour proposes, a row of ready colours, the hex field, an
// eyedropper where the browser has one, and Apply. v-model holds
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
    /** The ready colours under the hue bar, as `#rrggbb`. The page's rainbow unless given, and `false` shows none. */
    swatches?: string[] | false;
    /** The words, read when the picker opens. */
    text?: Partial<ColorPickerPanelText>;
  }>(),
  // Vue would read a missing `swatches` as false, which shows none.
  { anchor: null, names: () => COLOR_NAMES_DE, swatches: undefined },
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
const ready = ref<string[]>([]);
const dropper = canPickFromScreen();
const IconEyedropper = () => h(MarkSvg, { mark: MARKS.eyedropper, class: "glim-mark" });

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
function readSwatches() {
  ready.value = props.swatches === false ? [] : (props.swatches ?? rainbowSwatches()).flatMap((c) => normalizeHex(c) ?? []);
}
watch(() => props.swatches, readSwatches);

onMounted(() => {
  readSwatches();
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

/** A colour from a ready swatch or from the screen, taken as a drag on the square would be. */
function take(hex: string) {
  draft.value = hex;
  typed.value = hex;
  widget.setValue(hex);
  emit("input", hex);
}

async function pickScreen() {
  const hex = await pickFromScreen();
  if (hex) take(hex);
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
  <Teleport :to="portalTarget()" :disabled="!anchor">
    <div
      data-glim="ColorPicker"
      ref="panel"
      :class="['glim-picker-panel', anchor && 'glim-picker-panel--float']"
      :style="{ '--glim-picker-colour': draft }"
      @keydown="onKeyDown"
    >
      <div ref="host" style="display: contents" />
      <div v-if="ready.length > 0" role="group" :aria-label="words.swatches" class="glim-picker-swatches">
        <button
          v-for="hex in ready"
          :key="hex"
          type="button"
          :aria-label="hex"
          :aria-pressed="hex === draft"
          class="glim-picker-preset"
          :style="{ '--glim-preset': hex }"
          @click="take(hex)"
        />
      </div>
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
        <IconButton v-if="dropper" :tip="words.eyedropper" :glyph="IconEyedropper" @click="pickScreen" />
      </div>
      <div class="glim-picker-actions">
        <Button :label="words.apply" label-key="apply" :glyph="IconCheck" tone="accent" @click="apply" />
      </div>
    </div>
  </Teleport>
</template>
