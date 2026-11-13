<script setup lang="ts">
import IconTipButton from "./IconTipButton.vue";
import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs";

// The title bar a desktop app draws where its window has no native one
// (design-language.md, "The desktop window frame"): a strip to drag and the
// three window buttons, nothing else. The rail already shows the mark and the
// name. It knows nothing of the shell that hosts the page; the app hands it
// whether the window is maximised and answers its events.
//
// Render it only where the app draws its own frame. tokens.css moves the page
// and every scrim below it as soon as it is in the document.
defineProps<{
  /** The app's name. The bar shows none, so this is what a screen reader announces for it. */
  appName: string;
  /** Whether the window fills the screen. The middle button then restores it,
   *  and the app turns its edge resizing off. */
  maximised: boolean;
  /** The buttons' accessible names, which also show in their bubbles. */
  text: { minimise: string; maximise: string; restore: string; close: string };
}>();
const emit = defineEmits<{
  minimise: [];
  toggleMaximise: [];
  /** Asks the way the native close button does, so an app that hides to the tray on close still does. */
  close: [];
  /** A press on the bar started to move. The app hands it to the system, which moves the window from there. */
  dragStart: [];
}>();

// The drag starts on the first move, not on the press, so a click and a
// double click on the bar stay clicks. An edge the app's resize has taken
// arrives with its default prevented and is left to it.
let pressed = false;
const onButton = (e: MouseEvent) => (e.target as Element).closest("button") !== null;
function down(e: MouseEvent) {
  pressed = e.button === 0 && !e.defaultPrevented && !onButton(e);
}
function move(e: MouseEvent) {
  if (!pressed) return;
  pressed = false;
  if (e.buttons === 1) emit("dragStart");
}
function toggle(e: MouseEvent) {
  if (!onButton(e)) emit("toggleMaximise");
}
function up() {
  pressed = false;
}
</script>

<!-- Each button takes the bar's full height and shows the house square inside,
     so a pointer thrown into the corner of a maximised window still lands on close. -->
<template>
  <header data-glim="WindowBar" :aria-label="appName" class="glim-window-bar" @mousedown="down" @mousemove="move" @mouseup="up" @dblclick="toggle">
    <IconTipButton :tip="text.minimise" class="glim-window-button" @click="emit('minimise')">
      <span class="glim-window-square"><IconWindowMinimise /></span>
    </IconTipButton>
    <IconTipButton :tip="maximised ? text.restore : text.maximise" class="glim-window-button" @click="emit('toggleMaximise')">
      <span class="glim-window-square"><IconWindowRestore v-if="maximised" /><IconWindowMaximise v-else /></span>
    </IconTipButton>
    <IconTipButton :tip="text.close" class="glim-window-button" @click="emit('close')">
      <span class="glim-window-square"><IconClose /></span>
    </IconTipButton>
  </header>
</template>
