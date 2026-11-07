<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useDragArmed } from "@glimstone/vue";

const list = shallowRef<HTMLElement | null>(null);
const order = ref(["Mail", "Photos", "Music", "Notes", "Maps", "Files"]);
const held = ref<string | null>(null);
const shift = ref<{ x: number; y: number } | null>(null);
let start = { x: 0, y: 0 };
useDragArmed(list, () => held.value !== null);

function press(e: PointerEvent, name: string) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  start = { x: e.clientX, y: e.clientY };
  held.value = name;
}
function move(e: PointerEvent) {
  if (held.value !== null) shift.value = { x: e.clientX - start.x, y: e.clientY - start.y };
}
function drop(e: PointerEvent) {
  const name = held.value;
  if (name === null) return;
  const target = [...list.value!.children].findIndex((tile, i) => {
    const r = tile.getBoundingClientRect();
    return order.value[i] !== name && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
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
  shift.value = null;
}
</script>

<template>
  <!-- The list rewrites its own class once the tile moves, which is what the composable has to survive. -->
  <div ref="list" role="list" aria-label="Apps" :class="['demo-drag-tiles', { 'is-moving': shift }]">
    <div
      v-for="name in order"
      :key="name"
      role="listitem"
      :class="['demo-drag-tile', { 'glim-drag-lift': held === name }]"
      :style="held === name && shift ? { translate: `${shift.x}px ${shift.y}px` } : undefined"
      @pointerdown="press($event, name)"
      @pointermove="move"
      @pointerup="drop"
      @pointercancel="cancel"
    >
      {{ name }}
    </div>
  </div>
</template>
