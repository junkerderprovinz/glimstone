<script setup lang="ts">
import { ref } from "vue";
import { IconButton, Meter, SidebarRow } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const note = ref("Nothing yet");
const unpinned = ref(0);
</script>

<template>
  <div style="display: grid; gap: 4px; width: 300px">
    <SidebarRow label="Media" :glyph="glyph('IconFolder')" href="#/components/sidebar-row" @click.prevent="note = 'Opened Media'">
      <template #before><span data-slot="before">›</span></template>
      <template #after>
        <span data-slot="after" style="display: inline-flex; align-items: center; gap: 4px">
          <Meter label="Media is 40% full" :value="0.4" quiet size="small" />
          <IconButton tip="Unpin" :glyph="glyph('IconPin')" @click="unpinned++" />
        </span>
      </template>
    </SidebarRow>
    <SidebarRow
      v-for="(name, depth) in ['mnt', 'user', 'Big Buck Bunny and the other films']"
      :key="name"
      :data-depth="depth"
      :label="name"
      :glyph="glyph('IconFolder')"
      :depth="depth"
      @click="note = `Opened ${name}`"
    >
      <template #before><span data-toggle>›</span></template>
    </SidebarRow>
    <SidebarRow label="Trash" :glyph="glyph('IconTrash')" @click="note = 'Opened Trash'" />
    <output>{{ unpinned ? `Unpinned ${unpinned}` : note }}</output>
  </div>
</template>
