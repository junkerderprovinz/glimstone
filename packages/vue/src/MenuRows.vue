<script setup lang="ts">
import { computed } from "vue";
import { isMenuHead, menuRowView } from "@glimstone/core";
import { IconCheck, IconExpand, IconPencil } from "./glyphs";
import IconTipButton from "./IconTipButton.vue";
import Kbd from "./Kbd.vue";
import type { MenuEntry } from "./windowParts";

// The rows of one menu, the first or a submenu. ContextMenu decides what a
// pick does; every row carries its index as `data-row` for that.
const props = defineProps<{ entries: MenuEntry[]; openAt?: number }>();
const emit = defineEmits<{ pick: [row: number] }>();

const rows = computed(() =>
  props.entries.map((entry) =>
    entry === "-"
      ? ({ kind: "sep" } as const)
      : isMenuHead(entry)
        ? ({ kind: "head", head: entry } as const)
        : ({ kind: "item", item: entry, view: menuRowView(entry) } as const),
  ),
);
</script>

<template>
  <template v-for="(row, i) in rows" :key="i">
    <div v-if="row.kind === 'sep'" class="glim-menu-sep" role="separator" />
    <div v-else-if="row.kind === 'head'" class="glim-menu-head" role="presentation">
      <span>{{ row.head.head }}</span>
      <IconTipButton
        v-if="row.head.edit"
        :tip="row.head.edit.tip"
        role="menuitem"
        tabindex="-1"
        class="glim-menu-head-edit"
        :data-row="i"
        @click="emit('pick', i)"
      >
        <component :is="row.head.edit.glyph ?? IconPencil" />
      </IconTipButton>
    </div>
    <button
      v-else
      type="button"
      :role="row.view.role"
      tabindex="-1"
      :aria-checked="row.view.role === 'menuitem' ? undefined : row.item.checked"
      :aria-haspopup="row.item.sub ? 'menu' : undefined"
      :aria-expanded="row.item.sub ? openAt === i : undefined"
      :disabled="row.item.disabled"
      :class="['glim-menu-item', { 'glim-menu-item--current': row.view.current }]"
      :data-row="i"
      @click="emit('pick', i)"
    >
      <span v-if="row.view.lead === 'box'" class="glim-checkbox-box" aria-hidden="true"><IconCheck /></span>
      <span
        v-else-if="row.view.lead === 'dot'"
        class="glim-menu-dot"
        :style="{ backgroundColor: row.item.color }"
        aria-hidden="true"
      />
      <span v-else class="glim-menu-glyph" aria-hidden="true">
        <component :is="row.item.glyph" v-if="row.view.lead === 'glyph'" />
      </span>
      <span class="glim-menu-label">{{ row.item.label }}</span>
      <span v-if="row.view.end === 'submenu'" class="glim-menu-end glim-menu-caret" aria-hidden="true"><IconExpand /></span>
      <span v-else-if="row.view.end === 'tick'" class="glim-menu-end glim-menu-tick" aria-hidden="true"><IconCheck /></span>
      <Kbd v-else-if="row.view.end === 'shortcut'" class="glim-menu-end">{{ row.item.shortcut }}</Kbd>
      <span v-else-if="row.view.end === 'count'" class="glim-menu-end glim-menu-count glim-num">{{ row.item.count }}</span>
    </button>
  </template>
</template>
