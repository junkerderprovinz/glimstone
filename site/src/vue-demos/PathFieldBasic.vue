<script setup lang="ts">
import { ref } from "vue";
import { FieldRow, PathField, Tree, Window, type TreeNode } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const FOLDERS: Record<string, { name: string; kids: boolean }[]> = {
  "": [
    { name: "mnt", kids: true },
    { name: "boot", kids: false },
  ],
  "/mnt": [
    { name: "user", kids: true },
    { name: "disk1", kids: false },
  ],
  "/mnt/user": [
    { name: "media", kids: false },
    { name: "archive", kids: false },
  ],
};

const TEXT = { cancel: "Cancel", close: "Close" };

async function load(id: string | null): Promise<TreeNode[]> {
  return (FOLDERS[id ?? ""] ?? []).map((f) => ({
    id: `${id ?? ""}/${f.name}`,
    label: f.name,
    hasChildren: f.kids,
    glyph: glyph("IconFolder"),
    openGlyph: glyph("IconFolderOpen"),
  }));
}

const parents = (path: string) => path.split("/").filter(Boolean).map((_, i, all) => `/${all.slice(0, i + 1).join("/")}`);

const path = ref("/mnt/user/media");
const picked = ref("");
const chosen = ref<string | null>(null);
const open = ref<string[]>([]);
let answer: (path: string | null) => void = () => {};

function pick(current: string) {
  chosen.value = current;
  open.value = parents(current);
  return new Promise<string | null>((done) => (answer = done));
}
function finish(path: string | null) {
  chosen.value = null;
  answer(path);
}
const actions = () => [{ label: "Choose", labelKey: null, glyph: glyph("IconCheck"), primary: true, onClick: () => finish(chosen.value) }];
</script>

<template>
  <div style="display: grid; gap: 8px; width: 100%; max-width: 560px">
    <FieldRow label="Target">
      <PathField
        v-model="path"
        :pick="pick"
        :text="{ pick: 'Choose a folder' }"
        :button-attrs="{ 'data-pick-for': 'target' }"
        data-hook="target"
        @picked="picked = `Picked ${$event}`"
      />
    </FieldRow>
    <output>{{ picked }}</output>
    <Window v-if="chosen !== null" title="Choose a folder" :text="TEXT" :actions="actions()" @close="finish(null)">
      <div class="glim-well" style="padding: 8px">
        <Tree v-model="chosen" v-model:open="open" label="Folders" :load="load" @activate="finish" />
      </div>
    </Window>
  </div>
</template>
