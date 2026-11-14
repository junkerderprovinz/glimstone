<script lang="ts">
  import { Tree, type TreeNode } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

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

  let chosen = $state<string | null>("/mnt/user");
  let acted = $state("nothing");
  let asked = $state(0);

  async function load(id: string | null): Promise<TreeNode[]> {
    asked++;
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

<div style="display: grid; gap: 8px; width: 300px">
  <div class="glim-well" style="padding: 8px; min-height: 200px">
    <Tree label="Folders" {load} defaultOpen={["/mnt"]} bind:value={chosen} onActivate={(id) => (acted = id)} />
  </div>
  <output>Acted on {acted}, {asked} lists asked for</output>
</div>
