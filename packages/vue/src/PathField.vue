<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, type Component, type StyleValue } from "vue";
import { fieldWidthClass, PATH_ROOM_PX, type FieldWidth } from "@glimstone/core";
import Button from "./Button.vue";
import { useFieldName } from "./fieldName";
import { IconFolderOpen } from "./glyphs";

// A path to type and a button that asks the app for one, bound with v-model.
// GlimStone does not know where an app's folders come from, so `pick` is the
// app's own: it opens whatever it opens and answers with a path. Attributes go
// to the <input>; `class` and `style` go to the wrapper, which carries the width.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Handed the path in the field. Answers with a path, or with nothing when the person left. */
    pick: (current: string) => string | null | undefined | Promise<string | null | undefined>;
    /** The accessible name. Inside a FieldRow the row gives it. */
    label?: string;
    width?: FieldWidth;
    /** The button's words. */
    text?: { pick: string };
    /** The button's glyph, an open folder unless set, such as a file for a picker of files. */
    glyph?: Component;
    /** Shows the button's glyph alone, as it does by itself with less than 20rem of room. */
    compact?: boolean;
    /** Attributes for the button, such as a data hook. */
    buttonAttrs?: Record<string, string>;
    disabled?: boolean;
  }>(),
  { text: () => ({ pick: "Choose" }), disabled: false },
);
const value = defineModel<string>({ default: "" });
/** A path the picker answered with, after it landed in the field. */
const emit = defineEmits<{ picked: [path: string] }>();
const name = useFieldName(() => props.label);
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });

const box = shallowRef<HTMLElement | null>(null);
const tight = ref(false);
const watcher = new ResizeObserver(([entry]) => (tight.value = entry!.contentRect.width < PATH_ROOM_PX));
onMounted(() => watcher.observe(box.value!));
onBeforeUnmount(() => watcher.disconnect());

async function ask() {
  const answer = await props.pick(value.value);
  input.value?.focus();
  if (!answer) return;
  value.value = answer;
  emit("picked", answer);
}
</script>

<template>
  <span ref="box" :class="['glim-path', fieldWidthClass(width), $attrs.class]" :style="$attrs.style as StyleValue">
    <input
      ref="input"
      v-model="value"
      type="text"
      spellcheck="false"
      autocomplete="off"
      :aria-label="name"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :disabled="disabled"
      class="glim-input glim-input--mono"
    />
    <Button
      v-bind="buttonAttrs"
      variant="icon"
      :label="text.pick"
      :label-key="null"
      :glyph="glyph ?? IconFolderOpen"
      :compact="compact || tight"
      :disabled="disabled"
      @click="ask"
    />
  </span>
</template>
