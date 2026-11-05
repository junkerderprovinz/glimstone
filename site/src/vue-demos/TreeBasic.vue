<script setup lang="ts">
import { ref } from "vue";
import { Tree, type TreeNode } from "@glimstone/vue";
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

const chosen = ref<string | null>("/mnt/user");
const open = ref(["/mnt"]);
const acted = ref("nothing");
const asked = ref(0);

async function load(id: string | null): Promise<TreeNode[]> {
  asked.value++;
  return (FOLDERS[id ?? ""] ?? []).map((f) => {
    const path = `${id ?? ""}/${f.name}`;
    return {
      id: path,
      label: f.name,
      hasChildren: f.kids,
      glyph: glyph("IconFolder"),
      openGlyph: glyph("IconFolderOpen"),
      attrs: { "data-pick": path },
    };
  });
}
</script>

<template>
  <div style="display: grid; gap: 8px; width: 300px">
    <div class="glim-well" style="padding: 8px; min-height: 200px">
      <Tree v-model="chosen" v-model:open="open" label="Folders" :load="load" @activate="acted = $event" />
    </div>
    <output>Acted on {{ acted }}, {{ asked }} lists asked for</output>
  </div>
</template>
