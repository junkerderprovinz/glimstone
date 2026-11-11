<script setup lang="ts">
import { computed, shallowReactive, shallowRef, watch } from "vue";
import { focusTreeRow, treeRows, treeStep } from "@glimstone/core";
import { IconExpand } from "./glyphs";
import type { TreeNode } from "./windowParts";

// A hierarchy to walk through, loaded as it opens: the chosen row through
// v-model, the open rows through v-model:open. The rows and the keys come from
// tree.ts in the core.
const props = defineProps<{
  /** The tree's accessible name. */
  label: string;
  /** Asked once for the children of a row, and for the top with null. A list that fails is asked for again on the next opening. */
  load: (id: string | null) => readonly TreeNode[] | Promise<readonly TreeNode[]>;
}>();
const chosen = defineModel<string | null>({ default: null });
const open = defineModel<string[]>("open", { default: () => [] });
/** A double click or Enter on a row, for a picker that takes it at once. */
const emit = defineEmits<{ activate: [id: string] }>();

const children = shallowReactive(new Map<string | null, readonly TreeNode[]>());
const asked = new Set<string | null>();
const tree = shallowRef<HTMLElement | null>(null);

function ask(id: string | null) {
  if (asked.has(id)) return;
  asked.add(id);
  Promise.resolve(props.load(id)).then(
    (nodes) => children.set(id, nodes),
    () => asked.delete(id),
  );
}
watch(open, (ids) => [null, ...ids].forEach(ask), { immediate: true });

const rows = computed(() => treeRows(children, open.value));
const stop = computed(() => Math.max(rows.value.findIndex((r) => r.node.id === chosen.value), 0));

function toggle(id: string) {
  open.value = open.value.includes(id) ? open.value.filter((o) => o !== id) : [...open.value, id];
}

function keys(e: KeyboardEvent, at: number) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const id = rows.value[at]!.node.id;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    chosen.value = id;
    if (e.key === "Enter") emit("activate", id);
    return;
  }
  const step = treeStep(rows.value, at, e.key, getComputedStyle(tree.value!).direction === "rtl");
  if (!step) return;
  e.preventDefault();
  if ("focus" in step) {
    chosen.value = step.focus;
    focusTreeRow(tree.value!, step.focus);
  } else toggle("open" in step ? step.open : step.close);
}
</script>

<template>
  <div ref="tree" role="tree" :aria-label="label" class="glim-tree">
    <div
      v-for="(r, i) in rows"
      v-bind="r.node.attrs"
      :key="r.node.id"
      role="treeitem"
      :aria-level="r.level"
      :aria-posinset="r.position"
      :aria-setsize="r.siblings"
      :aria-expanded="r.node.hasChildren ? r.open : undefined"
      :aria-selected="r.node.id === chosen"
      :tabindex="i === stop ? 0 : -1"
      :data-tree-id="r.node.id"
      class="glim-tree-row"
      :style="{ '--tree-level': r.level - 1 }"
      @click="chosen = r.node.id"
      @dblclick="emit('activate', r.node.id)"
      @keydown="keys($event, i)"
    >
      <span class="glim-tree-toggle" aria-hidden="true" @click.stop="r.node.hasChildren && toggle(r.node.id)" @dblclick.stop>
        <IconExpand v-if="r.node.hasChildren" />
      </span>
      <span v-if="r.node.glyph" class="glim-tree-glyph" aria-hidden="true">
        <component :is="(r.open && r.node.openGlyph) || r.node.glyph" />
      </span>
      <span class="glim-tree-label">{{ r.node.label }}</span>
    </div>
  </div>
</template>
