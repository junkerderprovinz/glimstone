<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useDragArmed } from "@glimstone/vue";

const list = shallowRef<HTMLElement | null>(null);
const order = ref(["debian-13.iso", "podcast-episode-212.mp3", "photos-2026.zip", "firmware-v4.bin", "dataset.tar.gz"]);
const held = ref<string | null>(null);
const shift = ref(0);
let start = 0;
useDragArmed(list, () => held.value !== null);

function press(e: PointerEvent, name: string) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  start = e.clientY;
  held.value = name;
}
function move(e: PointerEvent) {
  if (held.value !== null) shift.value = e.clientY - start;
}
function drop(e: PointerEvent) {
  const name = held.value;
  if (name === null) return;
  const target = [...list.value!.children].findIndex((row, i) => {
    const r = row.getBoundingClientRect();
    return order.value[i] !== name && e.clientY >= r.top && e.clientY <= r.bottom;
  });
  if (target >= 0) {
    const next = order.value.filter((n) => n !== name);
    next.splice(target, 0, name);
    order.value = next;
  }
  cancel();
}
function cancel() {
  held.value = null;
  shift.value = 0;
}
</script>

<template>
  <!-- Rows as wide as the list tremble with the row wiggle, which tilts them far less. -->
  <div ref="list" role="list" aria-label="Downloads" class="demo-drag-rows glim-drag-rows">
    <div
      v-for="name in order"
      :key="name"
      role="listitem"
      :class="['demo-drag-row', { 'glim-drag-lift': held === name }]"
      :style="held === name ? { translate: `0 ${shift}px` } : undefined"
      @pointerdown="press($event, name)"
      @pointermove="move"
      @pointerup="drop"
      @pointercancel="cancel"
    >
      {{ name }}
    </div>
  </div>
</template>
